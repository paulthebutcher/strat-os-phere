/**
 * Active Run Resolver
 * 
 * Resolves the active analysis run for a project using a consistent strategy:
 * 1. If runIdOverride is provided (query param or explicit), use it
 * 2. Else fetch the most recent run for the project (by created_at desc)
 * 3. If none exists and allowCreate is true, create a new run
 * 
 * This ensures evidence collection and display use the same run as the source of truth.
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { createProjectRun } from '@/lib/data/projectRuns'
import { getLatestProjectInput } from '@/lib/data/projectInputs'
import { logger } from '@/lib/logger'
import { PIPELINE_VERSION } from '@/lib/analysis/runProjectAnalysis'

export interface ResolveActiveRunIdOptions {
  /**
   * If true, create a new run if none exists
   * Only set this in paths where runs are intentionally created (e.g., "Generate analysis")
   * Not for passive read-only pages
   */
  allowCreate?: boolean
  /**
   * Explicit runId to use (e.g., from query param)
   * Takes precedence over latest run lookup
   */
  runIdOverride?: string | null
}

export interface ResolveActiveRunIdResult {
  runId: string | null
  source: 'param' | 'latest' | 'created' | 'none'
}

/**
 * Resolve the active run ID for a project
 * 
 * @param supabase - Supabase client
 * @param projectId - Project ID
 * @param opts - Options for resolution strategy
 * @returns Result with runId and source metadata
 */
export async function resolveActiveRunId(
  supabase: TypedSupabaseClient,
  projectId: string,
  opts?: ResolveActiveRunIdOptions
): Promise<ResolveActiveRunIdResult> {
  // 1. If explicit runId is provided, use it
  if (opts?.runIdOverride) {
    logger.debug('[resolveActiveRunId] Using explicit runId', {
      projectId,
      runId: opts.runIdOverride,
      source: 'param',
    })
    return { runId: opts.runIdOverride, source: 'param' }
  }

  // 2. Fetch the most recent run for the project
  const { data: latest, error } = await supabase
    .from('project_runs')
    .select('id')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    logger.error('[resolveActiveRunId] Failed to fetch latest run', {
      projectId,
      error: error.message,
    })
    return { runId: null, source: 'none' }
  }

  // Type guard: check if latest has the expected shape
  const latestRun = latest as { id: string } | null
  if (latestRun?.id) {
    logger.debug('[resolveActiveRunId] Found latest run', {
      projectId,
      runId: latestRun.id,
      source: 'latest',
    })
    return { runId: latestRun.id, source: 'latest' }
  }

  // 3. No run exists - create one if allowed
  if (!opts?.allowCreate) {
    logger.debug('[resolveActiveRunId] No run exists and allowCreate is false', {
      projectId,
      source: 'none',
    })
    return { runId: null, source: 'none' }
  }

  // Create a new run with appropriate input version
  try {
    const inputResult = await getLatestProjectInput(supabase, projectId)
    
    if (!inputResult.ok || !inputResult.data) {
      logger.warn('[resolveActiveRunId] Cannot create run: no project input found', {
        projectId,
      })
      return { runId: null, source: 'none' }
    }

    const inputVersion = inputResult.data.version
    const idempotencyKey = `${projectId}:${inputVersion}:${PIPELINE_VERSION}`

    const createResult = await createProjectRun(supabase, {
      projectId,
      inputVersion,
      idempotencyKey,
    })

    if (!createResult.ok) {
      logger.error('[resolveActiveRunId] Failed to create run', {
        projectId,
        error: createResult.error.message,
      })
      return { runId: null, source: 'none' }
    }

    if (!createResult.data) {
      logger.error('[resolveActiveRunId] Run created but no data returned', {
        projectId,
      })
      return { runId: null, source: 'none' }
    }

    logger.debug('[resolveActiveRunId] Created new run', {
      projectId,
      runId: createResult.data.id,
      source: 'created',
    })

    return { runId: createResult.data.id, source: 'created' }
  } catch (error) {
    logger.error('[resolveActiveRunId] Exception creating run', {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    })
    return { runId: null, source: 'none' }
  }
}

