/**
 * Project Inputs Data Access - Versioned JSON inputs for projects.
 * 
 * This module handles all operations on project_inputs table.
 * All functions return Result types and never throw, ensuring graceful degradation.
 * 
 * Purpose: Store evolving onboarding fields (hypothesis, decision framing, market context, etc.)
 * in versioned JSON records instead of adding columns to projects table.
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { logServerError } from '@/lib/server/errorLogger'
import { logProjectInputSaved } from '@/lib/health/logHealth'

type Client = TypedSupabaseClient

// Helper to get a properly typed Supabase client
function getTypedClient(client: Client): SupabaseClient<Database> {
  return client as unknown as SupabaseClient<Database>
}

/**
 * Result type for safe operations that never throw
 */
export type ProjectInputResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }

/**
 * Project input row type
 */
export type ProjectInput = {
  id: string
  project_id: string
  version: number
  status: 'draft' | 'final'
  input_json: Record<string, any>
  created_at: string
}

/**
 * Get a project input for a specific (project_id, version) pair.
 */
export async function getProjectInputByVersion(
  client: Client,
  projectId: string,
  version: number
): Promise<ProjectInputResult<ProjectInput | null>> {
  try {
    const typedClient = getTypedClient(client)
    
    const { data, error } = await typedClient
      .from('project_inputs')
      .select('*')
      .eq('project_id', projectId)
      .eq('version', version)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows found" which is fine
      logServerError('getProjectInputByVersion', error, { projectId, version })
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to fetch project input',
        },
      }
    }

    return { ok: true, data: data ? (data as ProjectInput) : null }
  } catch (error) {
    logServerError('getProjectInputByVersion', error, { projectId, version })
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
 * Get the latest project input for a project.
 * 
 * Returns:
 * - The highest version with status='final' if one exists
 * - Else the highest version draft
 * - Else null
 */
export async function getLatestProjectInput(
  client: Client,
  projectId: string
): Promise<ProjectInputResult<ProjectInput | null>> {
  try {
    const typedClient = getTypedClient(client)
    
    // First try to get the latest final version
    const { data: finalData, error: finalError } = await typedClient
      .from('project_inputs')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'final')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (finalError && finalError.code !== 'PGRST116') {
      // PGRST116 is "no rows found" which is fine
      logServerError('getLatestProjectInput (final)', finalError, { projectId })
      return {
        ok: false,
        error: {
          code: finalError.code || 'UNKNOWN',
          message: finalError.message || 'Failed to fetch project input',
        },
      }
    }

    if (finalData) {
      return { ok: true, data: finalData as ProjectInput }
    }

    // If no final version, get the latest draft
    const { data: draftData, error: draftError } = await typedClient
      .from('project_inputs')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'draft')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (draftError && draftError.code !== 'PGRST116') {
      logServerError('getLatestProjectInput (draft)', draftError, { projectId })
      return {
        ok: false,
        error: {
          code: draftError.code || 'UNKNOWN',
          message: draftError.message || 'Failed to fetch project input',
        },
      }
    }

    return { ok: true, data: draftData ? (draftData as ProjectInput) : null }
  } catch (error) {
    logServerError('getLatestProjectInput', error, { projectId })
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
 * Create a new draft project input version.
 * 
 * Determines next version = (max version for project) + 1, default 1.
 * Makes a best-effort attempt at concurrency safety by handling unique constraint violations.
 */
export async function createDraftProjectInput(
  client: Client,
  projectId: string,
  inputJson: Record<string, any>
): Promise<ProjectInputResult<ProjectInput>> {
  try {
    const typedClient = getTypedClient(client)
    
    // Get the max version for this project
    const { data: maxVersionData, error: maxVersionError } = await typedClient
      .from('project_inputs')
      .select('version')
      .eq('project_id', projectId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (maxVersionError && maxVersionError.code !== 'PGRST116') {
      logServerError('createDraftProjectInput (max version)', maxVersionError, { projectId })
      return {
        ok: false,
        error: {
          code: maxVersionError.code || 'UNKNOWN',
          message: maxVersionError.message || 'Failed to determine next version',
        },
      }
    }

    const nextVersion = maxVersionData && typeof maxVersionData === 'object' && maxVersionData !== null && 'version' in maxVersionData
      ? ((maxVersionData as { version: number }).version + 1)
      : 1

    // Insert the new draft
    const { data, error } = await (typedClient
      .from('project_inputs') as any)
      .insert({
        project_id: projectId,
        version: nextVersion,
        status: 'draft',
        input_json: inputJson,
      })
      .select()
      .single()

    if (error) {
      // If unique constraint violation, retry once with refreshed max version
      if (error.code === '23505') {
        // Re-fetch max version and retry
        const { data: retryMaxData, error: retryMaxError } = await typedClient
          .from('project_inputs')
          .select('version')
          .eq('project_id', projectId)
          .order('version', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (retryMaxError && retryMaxError.code !== 'PGRST116') {
          logServerError('createDraftProjectInput (retry max version)', retryMaxError, { projectId })
          return {
            ok: false,
            error: {
              code: retryMaxError.code || 'UNKNOWN',
              message: retryMaxError.message || 'Failed to determine next version on retry',
            },
          }
        }

        const retryNextVersion = retryMaxData && typeof retryMaxData === 'object' && retryMaxData !== null && 'version' in retryMaxData
          ? ((retryMaxData as { version: number }).version + 1)
          : 1

        const { data: retryData, error: retryError } = await (typedClient
          .from('project_inputs') as any)
          .insert({
            project_id: projectId,
            version: retryNextVersion,
            status: 'draft',
            input_json: inputJson,
          })
          .select()
          .single()

        if (retryError) {
          logServerError('createDraftProjectInput (retry insert)', retryError, { projectId })
          return {
            ok: false,
            error: {
              code: retryError.code || 'UNKNOWN',
              message: retryError.message || 'Failed to create project input after retry',
            },
          }
        }

        return { ok: true, data: retryData as ProjectInput }
      }

      logServerError('createDraftProjectInput', error, { projectId })
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to create project input',
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
    logProjectInputSaved(projectId, nextVersion, 'draft')

    return { ok: true, data: data as ProjectInput }
  } catch (error) {
    logServerError('createDraftProjectInput', error, { projectId })
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
 * Update an existing project input.
 * 
 * Merges patchJson into existing input_json (shallow merge).
 * Optionally updates status.
 */
export async function updateProjectInput(
  client: Client,
  id: string,
  patchJson: Record<string, any>,
  status?: 'draft' | 'final'
): Promise<ProjectInputResult<ProjectInput>> {
  try {
    const typedClient = getTypedClient(client)
    
    // First get the existing input to merge
    const { data: existingData, error: fetchError } = await typedClient
      .from('project_inputs')
      .select('input_json')
      .eq('id', id)
      .single()

    if (fetchError) {
      logServerError('updateProjectInput (fetch)', fetchError, { id })
      return {
        ok: false,
        error: {
          code: fetchError.code || 'UNKNOWN',
          message: fetchError.message || 'Failed to fetch existing project input',
        },
      }
    }

    if (!existingData) {
      return {
        ok: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project input not found',
        },
      }
    }

    // Shallow merge: spread existing, then patch
    const existingDataTyped = existingData as { input_json: Record<string, any> } | null
    const mergedJson = existingDataTyped
      ? { ...(existingDataTyped.input_json as Record<string, any>), ...patchJson }
      : patchJson

    // Build update payload
    const updatePayload: {
      input_json: Record<string, any>
      status?: 'draft' | 'final'
    } = {
      input_json: mergedJson,
    }

    if (status !== undefined) {
      updatePayload.status = status
    }

    const { data, error } = await (typedClient
      .from('project_inputs') as any)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logServerError('updateProjectInput', error, { id })
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to update project input',
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

    // Log health event (dev-only) - only if status was updated
    if (status !== undefined) {
      const updatedInput = data as ProjectInput
      logProjectInputSaved(updatedInput.project_id, updatedInput.version, updatedInput.status)
    }

    return { ok: true, data: data as ProjectInput }
  } catch (error) {
    logServerError('updateProjectInput', error, { id })
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
 * Finalize a project input by setting status to 'final'.
 */
export async function finalizeProjectInput(
  client: Client,
  id: string
): Promise<ProjectInputResult<ProjectInput>> {
  try {
    const typedClient = getTypedClient(client)
    
    const { data, error } = await (typedClient
      .from('project_inputs') as any)
      .update({ status: 'final' })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logServerError('finalizeProjectInput', error, { id })
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to finalize project input',
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

    // Log health event (dev-only)
    const finalizedInput = data as ProjectInput
    logProjectInputSaved(finalizedInput.project_id, finalizedInput.version, 'final')

    return { ok: true, data: data as ProjectInput }
  } catch (error) {
    logServerError('finalizeProjectInput', error, { id })
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
 * Upsert a project input for a specific (project_id, version) pair.
 * 
 * This function ensures create-or-update semantics:
 * - If a row exists with the given project_id and version, it updates it
 * - If no row exists, it creates a new one
 * 
 * For Step 1, use version=1 to ensure a single durable source of truth.
 */
export async function upsertProjectInput(
  client: Client,
  projectId: string,
  version: number,
  inputJson: Record<string, any>,
  status: 'draft' | 'final' = 'draft'
): Promise<ProjectInputResult<ProjectInput>> {
  try {
    const typedClient = getTypedClient(client)
    
    // Try to find existing input with this project_id and version
    const { data: existingData, error: findError } = await typedClient
      .from('project_inputs')
      .select('*')
      .eq('project_id', projectId)
      .eq('version', version)
      .maybeSingle()

    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 is "no rows found" which is fine
      logServerError('upsertProjectInput (find)', findError, { projectId, version })
      return {
        ok: false,
        error: {
          code: findError.code || 'UNKNOWN',
          message: findError.message || 'Failed to check existing project input',
        },
      }
    }

    if (existingData) {
      // Update existing row
      const existingTyped = existingData as ProjectInput
      const mergedJson = mergeInputJson(existingTyped.input_json as Record<string, any>, inputJson)
      
      const { data, error } = await (typedClient
        .from('project_inputs') as any)
        .update({
          input_json: mergedJson,
          status,
        })
        .eq('id', existingTyped.id)
        .select()
        .single()

      if (error) {
        logServerError('upsertProjectInput (update)', error, { projectId, version, id: existingTyped.id })
        return {
          ok: false,
          error: {
            code: error.code || 'UNKNOWN',
            message: error.message || 'Failed to update project input',
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

      // Log health event (dev-only)
      const updatedInput = data as ProjectInput
      logProjectInputSaved(updatedInput.project_id, updatedInput.version, updatedInput.status)

      return { ok: true, data: updatedInput }
    } else {
      // Create new row
      const { data, error } = await (typedClient
        .from('project_inputs') as any)
        .insert({
          project_id: projectId,
          version,
          status,
          input_json: inputJson,
        })
        .select()
        .single()

      if (error) {
        logServerError('upsertProjectInput (insert)', error, { projectId, version })
        return {
          ok: false,
          error: {
            code: error.code || 'UNKNOWN',
            message: error.message || 'Failed to create project input',
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
      const createdInput = data as ProjectInput
      logProjectInputSaved(createdInput.project_id, createdInput.version, createdInput.status)

      return { ok: true, data: createdInput }
    }
  } catch (error) {
    logServerError('upsertProjectInput', error, { projectId, version })
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
 * Helper to merge input JSON (shallow merge).
 * Exported for use in other modules if needed.
 */
export function mergeInputJson(
  existing: Record<string, any>,
  patch: Record<string, any>
): Record<string, any> {
  return { ...existing, ...patch }
}

