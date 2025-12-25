/**
 * Projects Data Contract - Single source of truth for all project operations.
 * 
 * This module centralizes all project reads/writes to prevent schema drift.
 * All functions return Result types and never throw, ensuring graceful degradation.
 * 
 * Only uses columns confirmed to exist in production schema (see projectsSchema.ts).
 */

import type { TypedSupabaseClient, Project, NewProject } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { PROJECT_FULL_SELECT, PROJECT_DASHBOARD_SELECT } from './projectSelect'
import { buildProjectUpdate } from '@/lib/db/projectUpdate'
import { pickAllowedProjectFields, pickStableProjectFields } from '@/lib/db/projectsSafeWrite'
import type { ProjectStableInsert } from '@/lib/db/projectsSchema'
import { logServerError } from '@/lib/server/errorLogger'
import { logProjectCreated } from '@/lib/health/logHealth'

type Client = TypedSupabaseClient

// Helper to get a properly typed Supabase client
function getTypedClient(client: Client): SupabaseClient<Database> {
  return client as unknown as SupabaseClient<Database>
}

/**
 * Result type for safe operations that never throw
 */
export type ProjectResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; isMissingColumn?: boolean } }

/**
 * Safe project shape - only fields that exist in production
 */
export type SafeProject = Project

/**
 * Get a single project by ID safely
 */
export async function getProjectSafe(
  client: Client,
  projectId: string
): Promise<ProjectResult<SafeProject | null>> {
  try {
    const typedClient = getTypedClient(client)
    const { data, error } = await typedClient
      .from('projects')
      .select(PROJECT_FULL_SELECT)
      .eq('id', projectId)
      .maybeSingle()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - not an error
        return { ok: true, data: null }
      }
      
      const isMissingColumn = error.message?.toLowerCase().includes('does not exist') ||
                              error.message?.toLowerCase().includes('column')
      
      logServerError('getProjectSafe', error, { projectId })
      
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to fetch project',
          isMissingColumn,
        },
      }
    }

    return { ok: true, data: data || null }
  } catch (error) {
    logServerError('getProjectSafe', error, { projectId })
    return {
      ok: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    }
  }
}

/**
 * List all projects for an owner safely
 */
export async function listProjectsForOwnerSafe(
  client: Client,
  ownerId: string
): Promise<ProjectResult<SafeProject[]>> {
  try {
    const typedClient = getTypedClient(client)
    const { data, error } = await typedClient
      .from('projects')
      .select(PROJECT_DASHBOARD_SELECT)
      .eq('user_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) {
      const isMissingColumn = error.message?.toLowerCase().includes('does not exist') ||
                              error.message?.toLowerCase().includes('column')
      
      logServerError('listProjectsForOwnerSafe', error, { ownerId })
      
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to list projects',
          isMissingColumn,
        },
      }
    }

    return { ok: true, data: data || [] }
  } catch (error) {
    logServerError('listProjectsForOwnerSafe', error, { ownerId })
    return {
      ok: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    }
  }
}

/**
 * Create a new project safely with only stable fields.
 * All evolving fields should be stored in project_inputs.input_json instead.
 */
export async function createProjectSafe(
  client: Client,
  input: ProjectStableInsert
): Promise<ProjectResult<SafeProject>> {
  try {
    const typedClient = getTypedClient(client)
    
    // Use pickStableProjectFields to ensure only stable fields are included
    const insertPayload = pickStableProjectFields(input) as unknown as Database['public']['Tables']['projects']['Insert']
    
    const query = typedClient.from('projects') as unknown as {
      insert: (values: Database['public']['Tables']['projects']['Insert']) => {
        select: (columns?: string) => {
          single: () => Promise<{ data: Project | null; error: { message: string; code?: string } | null }>
        }
      }
    }
    
    const { data, error } = await query.insert(insertPayload).select(PROJECT_FULL_SELECT).single()

    if (error) {
      const isMissingColumn = error.message?.toLowerCase().includes('does not exist') ||
                              error.message?.toLowerCase().includes('column')
      
      logServerError('createProjectSafe', error, { input: Object.keys(input) })
      
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to create project',
          isMissingColumn,
        },
      }
    }

    if (!data) {
      return {
        ok: false,
        error: {
          code: 'NO_DATA',
          message: 'No data returned from insert',
        },
      }
    }

    // Log health event (dev-only)
    logProjectCreated(data.id, Object.keys(insertPayload))

    return { ok: true, data }
  } catch (error) {
    logServerError('createProjectSafe', error, { input: Object.keys(input) })
    return {
      ok: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    }
  }
}

/**
 * Update a project safely - only allows whitelisted fields
 */
/**
 * Update a project safely - only allows whitelisted fields
 * Note: latest_successful_run_id is not included as it doesn't exist in production schema
 */
export async function updateProjectSafe(
  client: Client,
  projectId: string,
  patch: Partial<NewProject>
): Promise<ProjectResult<SafeProject>> {
  try {
    const typedClient = getTypedClient(client)
    
    // Whitelist and filter out unknown columns
    const safePatch = pickAllowedProjectFields(buildProjectUpdate(patch))
    const updatePayload = safePatch as unknown as Database['public']['Tables']['projects']['Update']
    
    const query = typedClient.from('projects') as unknown as {
      update: (values: Database['public']['Tables']['projects']['Update']) => {
        eq: (column: string, value: string) => {
          select: (columns?: string) => {
            single: () => Promise<{ data: Project | null; error: { message: string; code?: string } | null }>
          }
        }
      }
    }
    
    const { data, error } = await query
      .update(updatePayload)
      .eq('id', projectId)
      .select(PROJECT_FULL_SELECT)
      .single()

    if (error) {
      const isMissingColumn = error.message?.toLowerCase().includes('does not exist') ||
                              error.message?.toLowerCase().includes('column')
      
      logServerError('updateProjectSafe', error, { projectId, patch: Object.keys(patch) })
      
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to update project',
          isMissingColumn,
        },
      }
    }

    if (!data) {
      return {
        ok: false,
        error: {
          code: 'NO_DATA',
          message: 'No data returned from update',
        },
      }
    }

    return { ok: true, data }
  } catch (error) {
    logServerError('updateProjectSafe', error, { projectId, patch: Object.keys(patch) })
    return {
      ok: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    }
  }
}

/**
 * Delete a project permanently and all associated data
 * This will cascade delete related records (competitors, evidence, runs, etc.)
 * via database foreign key constraints
 */
export async function deleteProjectSafe(
  client: Client,
  projectId: string
): Promise<ProjectResult<void>> {
  try {
    const typedClient = getTypedClient(client)
    
    // Delete the project - cascade deletes should handle related data
    // If cascade is not configured, we may need to delete related tables explicitly
    const { error } = await typedClient
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      logServerError('deleteProjectSafe', error, { projectId })
      
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to delete project',
        },
      }
    }

    return { ok: true, data: undefined }
  } catch (error) {
    logServerError('deleteProjectSafe', error, { projectId })
    return {
      ok: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    }
  }
}

