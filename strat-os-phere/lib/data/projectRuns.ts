/**
 * Project Runs Data Access - Append-only run records.
 * 
 * This module handles all operations on project_runs table.
 * All functions return Result types and never throw, ensuring graceful degradation.
 * 
 * Purpose: Store analysis execution runs as append-only records.
 * This replaces storing derived run state on projects (no projects.latest_* fields).
 * Runs become the source of truth for execution status and artifacts.
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { logServerError } from '@/lib/server/errorLogger'
import { logProjectRunCreated } from '@/lib/health/logHealth'

type Client = TypedSupabaseClient

// Helper to get a properly typed Supabase client
function getTypedClient(client: Client): SupabaseClient<Database> {
  return client as unknown as SupabaseClient<Database>
}

/**
 * Result type for safe operations that never throw
 */
export type ProjectRunResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }

/**
 * Project run row type
 */
export type ProjectRun = {
  id: string
  project_id: string
  input_version: number
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  started_at: string | null
  finished_at: string | null
  created_at: string
  committed_at: string | null
  error_code: string | null
  error_message: string | null
  error_detail: string | null
  output: Record<string, any> | null
  metrics: Record<string, any>
  idempotency_key: string
}

/**
 * Create a new project run with status='queued'
 */
export async function createProjectRun(
  client: Client,
  params: {
    projectId: string
    inputVersion: number
    idempotencyKey: string
  }
): Promise<ProjectRunResult<ProjectRun>> {
  try {
    const typedClient = getTypedClient(client)
    
    const { data, error } = await (typedClient
      .from('project_runs') as any)
      .insert({
        project_id: params.projectId,
        input_version: params.inputVersion,
        status: 'queued',
        idempotency_key: params.idempotencyKey,
        metrics: {},
      })
      .select()
      .single()

    if (error) {
      // If unique constraint violation on idempotency_key, fetch existing run
      if (error.code === '23505') {
        const existingResult = await getProjectRunByIdempotencyKey(
          client,
          params.idempotencyKey
        )
        if (existingResult.ok && existingResult.data) {
          return {
            ok: true,
            data: existingResult.data,
          }
        }
      }
      
      logServerError('createProjectRun', error, { projectId: params.projectId })
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to create project run',
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
    logProjectRunCreated(params.projectId, data.id, params.inputVersion)

    return { ok: true, data: data as ProjectRun }
  } catch (error) {
    logServerError('createProjectRun', error, { projectId: params.projectId })
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
 * Get a project run by idempotency key
 */
export async function getProjectRunByIdempotencyKey(
  client: Client,
  idempotencyKey: string
): Promise<ProjectRunResult<ProjectRun | null>> {
  try {
    const typedClient = getTypedClient(client)
    
    const { data, error } = await typedClient
      .from('project_runs')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      logServerError('getProjectRunByIdempotencyKey', error, { idempotencyKey })
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to fetch project run',
        },
      }
    }

    return { ok: true, data: data ? (data as ProjectRun) : null }
  } catch (error) {
    logServerError('getProjectRunByIdempotencyKey', error, { idempotencyKey })
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
 * Update run metrics without changing status (for progress tracking during execution)
 */
export async function updateRunMetrics(
  client: Client,
  runId: string,
  metricsPatch: Record<string, any>
): Promise<ProjectRunResult<ProjectRun>> {
  try {
    const typedClient = getTypedClient(client)
    
    // Get current metrics to merge
    const { data: currentRun, error: fetchError } = await typedClient
      .from('project_runs')
      .select('metrics')
      .eq('id', runId)
      .single()

    if (fetchError) {
      logServerError('updateRunMetrics (fetch)', fetchError, { runId })
      return {
        ok: false,
        error: {
          code: fetchError.code || 'UNKNOWN',
          message: fetchError.message || 'Failed to fetch run',
        },
      }
    }

    const currentRunTyped = currentRun as { metrics: Record<string, any> } | null
    const currentMetrics = currentRunTyped?.metrics || {}
    const mergedMetrics = { ...currentMetrics, ...metricsPatch }

    const { data, error } = await (typedClient
      .from('project_runs') as any)
      .update({ metrics: mergedMetrics })
      .eq('id', runId)
      .select()
      .single()

    if (error) {
      logServerError('updateRunMetrics', error, { runId })
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to update run metrics',
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

    return { ok: true, data: data as ProjectRun }
  } catch (error) {
    logServerError('updateRunMetrics', error, { runId })
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
 * Set run status to 'running' and set started_at if not already set
 */
export async function setRunRunning(
  client: Client,
  runId: string
): Promise<ProjectRunResult<ProjectRun>> {
  try {
    const typedClient = getTypedClient(client)
    
    // Get current run to check if started_at is already set
    const { data: currentRun, error: fetchError } = await typedClient
      .from('project_runs')
      .select('started_at')
      .eq('id', runId)
      .single()

    if (fetchError) {
      logServerError('setRunRunning (fetch)', fetchError, { runId })
      return {
        ok: false,
        error: {
          code: fetchError.code || 'UNKNOWN',
          message: fetchError.message || 'Failed to fetch run',
        },
      }
    }

    const currentRunTyped = currentRun as { started_at: string | null } | null
    const updatePayload: {
      status: 'running'
      started_at?: string
    } = {
      status: 'running',
    }

    // Only set started_at if not already set
    if (!currentRunTyped?.started_at) {
      updatePayload.started_at = new Date().toISOString()
    }

    const { data, error } = await (typedClient
      .from('project_runs') as any)
      .update(updatePayload)
      .eq('id', runId)
      .select()
      .single()

    if (error) {
      logServerError('setRunRunning', error, { runId })
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to update run status',
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

    return { ok: true, data: data as ProjectRun }
  } catch (error) {
    logServerError('setRunRunning', error, { runId })
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
 * Set run status to 'succeeded' with output and metrics
 */
export async function setRunSucceeded(
  client: Client,
  runId: string,
  params?: {
    output?: Record<string, any>
    metricsPatch?: Record<string, any>
  }
): Promise<ProjectRunResult<ProjectRun>> {
  try {
    const typedClient = getTypedClient(client)
    
    // Get current metrics to merge
    const { data: currentRun, error: fetchError } = await typedClient
      .from('project_runs')
      .select('metrics')
      .eq('id', runId)
      .single()

    if (fetchError) {
      logServerError('setRunSucceeded (fetch)', fetchError, { runId })
      return {
        ok: false,
        error: {
          code: fetchError.code || 'UNKNOWN',
          message: fetchError.message || 'Failed to fetch run',
        },
      }
    }

    const currentRunTyped = currentRun as { metrics: Record<string, any> } | null
    const currentMetrics = currentRunTyped?.metrics || {}
    const mergedMetrics = params?.metricsPatch
      ? { ...currentMetrics, ...params.metricsPatch }
      : currentMetrics

    const updatePayload: {
      status: 'succeeded'
      finished_at: string
      output?: Record<string, any>
      metrics: Record<string, any>
    } = {
      status: 'succeeded',
      finished_at: new Date().toISOString(),
      metrics: mergedMetrics,
    }

    if (params?.output !== undefined) {
      updatePayload.output = params.output
    }

    const { data, error } = await (typedClient
      .from('project_runs') as any)
      .update(updatePayload)
      .eq('id', runId)
      .select()
      .single()

    if (error) {
      logServerError('setRunSucceeded', error, { runId })
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to update run status',
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

    return { ok: true, data: data as ProjectRun }
  } catch (error) {
    logServerError('setRunSucceeded', error, { runId })
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
 * Sanitize error message for storage (remove secrets, truncate long messages)
 */
function sanitizeErrorMessage(message: string, maxLength: number = 1000): string {
  // Remove common secret patterns (API keys, tokens, etc.)
  let sanitized = message
    .replace(/api[_-]?key[\s:=]+['"]?[a-zA-Z0-9_\-]{20,}['"]?/gi, '[REDACTED]')
    .replace(/token[\s:=]+['"]?[a-zA-Z0-9_\-]{20,}['"]?/gi, '[REDACTED]')
    .replace(/secret[\s:=]+['"]?[a-zA-Z0-9_\-]{20,}['"]?/gi, '[REDACTED]')
    .replace(/password[\s:=]+['"]?[a-zA-Z0-9_\-]{20,}['"]?/gi, '[REDACTED]')
    .replace(/auth[\s:=]+['"]?[a-zA-Z0-9_\-]{20,}['"]?/gi, '[REDACTED]')
    .replace(/(bearer|basic)\s+[a-zA-Z0-9_\-]{20,}/gi, '[REDACTED]')
  
  // Remove stack traces (keep only first line if it's an error message)
  const lines = sanitized.split('\n')
  if (lines.length > 1) {
    // Keep first line (usually the error message), remove stack trace
    sanitized = lines[0]
  }

  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength - 3) + '...'
  }

  return sanitized
}

/**
 * Sanitize error code (ensure it's safe for storage)
 */
function sanitizeErrorCode(code: string, maxLength: number = 100): string {
  // Truncate if too long
  if (code.length > maxLength) {
    return code.substring(0, maxLength - 3) + '...'
  }
  return code
}

/**
 * Set run status to 'failed' with error details and metrics
 * Errors are sanitized before storage (secrets removed, messages truncated)
 */
export async function setRunFailed(
  client: Client,
  runId: string,
  params: {
    error_code: string
    error_message: string
    error_detail?: string
    metricsPatch?: Record<string, any>
  }
): Promise<ProjectRunResult<ProjectRun>> {
  try {
    const typedClient = getTypedClient(client)
    
    // Get current metrics to merge
    const { data: currentRun, error: fetchError } = await typedClient
      .from('project_runs')
      .select('metrics')
      .eq('id', runId)
      .single()

    if (fetchError) {
      logServerError('setRunFailed (fetch)', fetchError, { runId })
      return {
        ok: false,
        error: {
          code: fetchError.code || 'UNKNOWN',
          message: fetchError.message || 'Failed to fetch run',
        },
      }
    }

    const currentRunTyped = currentRun as { metrics: Record<string, any> } | null
    const currentMetrics = currentRunTyped?.metrics || {}
    const mergedMetrics = params.metricsPatch
      ? { ...currentMetrics, ...params.metricsPatch }
      : currentMetrics

    // Sanitize error fields
    const sanitizedCode = sanitizeErrorCode(params.error_code)
    const sanitizedMessage = sanitizeErrorMessage(params.error_message)
    const sanitizedDetail = params.error_detail
      ? sanitizeErrorMessage(params.error_detail, 500) // Shorter limit for detail
      : undefined

    const updatePayload: {
      status: 'failed'
      finished_at: string
      error_code: string
      error_message: string
      error_detail?: string
      metrics: Record<string, any>
    } = {
      status: 'failed',
      finished_at: new Date().toISOString(),
      error_code: sanitizedCode,
      error_message: sanitizedMessage,
      metrics: mergedMetrics,
    }

    if (sanitizedDetail !== undefined) {
      updatePayload.error_detail = sanitizedDetail
    }

    const { data, error } = await (typedClient
      .from('project_runs') as any)
      .update(updatePayload)
      .eq('id', runId)
      .select()
      .single()

    if (error) {
      logServerError('setRunFailed', error, { runId })
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to update run status',
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

    return { ok: true, data: data as ProjectRun }
  } catch (error) {
    logServerError('setRunFailed', error, { runId })
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
 * Get the latest run for a project
 */
export async function getLatestRunForProject(
  client: Client,
  projectId: string
): Promise<ProjectRunResult<ProjectRun | null>> {
  try {
    const typedClient = getTypedClient(client)
    
    const { data, error } = await typedClient
      .from('project_runs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      logServerError('getLatestRunForProject', error, { projectId })
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to fetch latest run',
        },
      }
    }

    return { ok: true, data: data ? (data as ProjectRun) : null }
  } catch (error) {
    logServerError('getLatestRunForProject', error, { projectId })
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
 * Get a project run by ID
 */
export async function getProjectRunById(
  client: Client,
  runId: string
): Promise<ProjectRunResult<ProjectRun | null>> {
  try {
    const typedClient = getTypedClient(client)
    
    const { data, error } = await typedClient
      .from('project_runs')
      .select('*')
      .eq('id', runId)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      logServerError('getProjectRunById', error, { runId })
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to fetch project run',
        },
      }
    }

    return { ok: true, data: data ? (data as ProjectRun) : null }
  } catch (error) {
    logServerError('getProjectRunById', error, { runId })
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
 * Get the latest committed run for a project
 * This is the canonical pointer to committed decision results
 * A run is committed when committed_at IS NOT NULL
 */
export async function getLatestCommittedRunForProject(
  client: Client,
  projectId: string
): Promise<ProjectRunResult<ProjectRun | null>> {
  try {
    const typedClient = getTypedClient(client)
    
    const { data, error } = await typedClient
      .from('project_runs')
      .select('*')
      .eq('project_id', projectId)
      .not('committed_at', 'is', null)
      .order('committed_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      logServerError('getLatestCommittedRunForProject', error, { projectId })
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to fetch latest committed run',
        },
      }
    }

    return { ok: true, data: data ? (data as ProjectRun) : null }
  } catch (error) {
    logServerError('getLatestCommittedRunForProject', error, { projectId })
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
 * Get the latest successful (succeeded) run for a project
 * @deprecated Use getLatestCommittedRunForProject instead
 * This function is kept for backward compatibility but should be replaced
 */
export async function getLatestSuccessfulRunForProject(
  client: Client,
  projectId: string
): Promise<ProjectRunResult<ProjectRun | null>> {
  // Delegate to committed run function
  return getLatestCommittedRunForProject(client, projectId)
}

/**
 * List runs for a project (for run history UI)
 */
export async function listRunsForProject(
  client: Client,
  projectId: string,
  limit: number = 10
): Promise<ProjectRunResult<ProjectRun[]>> {
  try {
    const typedClient = getTypedClient(client)
    
    const { data, error } = await typedClient
      .from('project_runs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      logServerError('listRunsForProject', error, { projectId })
      return {
        ok: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to list runs',
        },
      }
    }

    return { ok: true, data: (data || []) as ProjectRun[] }
  } catch (error) {
    logServerError('listRunsForProject', error, { projectId })
    return {
      ok: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    }
  }
}

