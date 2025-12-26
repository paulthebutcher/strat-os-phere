/**
 * Dev-only schema preflight checks
 * 
 * Performs lightweight checks to ensure required tables exist.
 * Only runs in development to fail early with clear error messages.
 * 
 * In production, these checks are skipped to avoid performance impact.
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'

// Required MVP tables
const REQUIRED_TABLES = [
  'projects',
  'competitors',
  'project_inputs',
  'project_runs',
  'project_shares',
  'evidence_sources',
  'evidence_cache',
  'artifacts',
] as const

interface PreflightResult {
  ok: boolean
  missingTables: string[]
  error?: string
}

/**
 * Check if required tables exist
 * Only runs in development (NODE_ENV !== 'production')
 * 
 * Returns { ok: true } if all tables exist, or { ok: false, missingTables } if any are missing
 */
export async function checkRequiredTables(
  supabase: TypedSupabaseClient
): Promise<PreflightResult> {
  // Skip in production
  if (process.env.NODE_ENV === 'production') {
    return { ok: true, missingTables: [] }
  }

  try {
    // Try querying each table directly (simple SELECT with limit 0)
    // This fails fast if table doesn't exist
    const existingTables: string[] = []
    
    for (const table of REQUIRED_TABLES) {
      try {
        // Try a simple query that should fail fast if table doesn't exist
        const { error: tableError } = await (supabase as any)
          .from(table)
          .select('*')
          .limit(0)
        
        // If no error OR error is not "relation does not exist", assume table exists
        // RLS/permission errors mean table exists but we can't access it (which is fine)
        const isMissingTable = tableError && (
          tableError.code === '42P01' ||
          tableError.message?.toLowerCase().includes('does not exist') ||
          (tableError.message?.toLowerCase().includes('relation') && 
           tableError.message?.toLowerCase().includes('does not exist'))
        )
        
        if (!isMissingTable) {
          existingTables.push(table)
        }
        // If error code is 42P01 or message says "does not exist", table is missing
      } catch {
        // On exception, be conservative and assume table doesn't exist
        // (better to show warning than false positive)
      }
    }

    const missingTables = REQUIRED_TABLES.filter(t => !existingTables.includes(t))

    if (missingTables.length > 0) {
      logger.error('Schema preflight check failed: missing tables', { missingTables })
      return {
        ok: false,
        missingTables,
        error: `Missing required tables: ${missingTables.join(', ')}. Run migrations: supabase db reset (local) or supabase db push (remote)`,
      }
    }

    return { ok: true, missingTables: [] }
  } catch (error) {
    // If check itself fails, log but don't block (might be permissions issue)
    logger.warn('Schema preflight check error (non-blocking)', {
      error: error instanceof Error ? error.message : String(error),
    })
    return { ok: true, missingTables: [] } // Don't block on check failures
  }
}

/**
 * Assert that required tables exist (throws in dev if missing)
 * Call this at the start of key pages/routes in dev mode
 */
export async function assertSchemaReady(supabase: TypedSupabaseClient): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    return // Skip in production
  }

  const result = await checkRequiredTables(supabase)
  
  if (!result.ok) {
    const errorMessage = `[DEV] Schema preflight failed: ${result.error || 'Missing required tables'}\n\n` +
      `Missing tables: ${result.missingTables.join(', ')}\n\n` +
      `To fix:\n` +
      `  1. Run: supabase db reset (local) or supabase db push (remote)\n` +
      `  2. Verify tables exist: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    
    throw new Error(errorMessage)
  }
}

