/**
 * Progress event writer that persists events to the database
 * Wraps the existing progress callback system to add database persistence
 * 
 * NOTE: This module has been disabled during migration from analysis_runs to project_runs.
 * Progress events were stored in analysis_run_events table, but project_runs uses metrics JSONB.
 * This needs to be re-implemented to store progress events in project_runs.metrics field.
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { ProgressCallback, ProgressEvent } from './progress'
import { updateRunMetrics, setRunRunning, setRunSucceeded, setRunFailed } from '@/lib/data/projectRuns'
import { logger } from '@/lib/logger'

/**
 * Create a progress callback that writes events to the database
 * 
 * NOTE: Currently disabled - needs re-implementation for project_runs
 * Events should be stored in project_runs.metrics JSONB field
 */
export function createProgressWriter(
  supabase: TypedSupabaseClient,
  runId: string
): ProgressCallback {
  return async (event: ProgressEvent) => {
    try {
      // TODO: Re-implement progress tracking using project_runs.metrics
      // Store events as an array in metrics.events or similar
      
      // For now, just update run status based on event
      if (event.status === 'failed' || event.status === 'blocked') {
        await setRunFailed(supabase, runId, {
          error_code: 'PROGRESS_EVENT_FAILED',
          error_message: event.message || 'Progress event indicated failure',
          error_detail: event.detail || undefined,
        })
      } else if (event.status === 'completed' && event.phase === 'finalize') {
        await setRunSucceeded(supabase, runId, {})
      } else if (event.status === 'started' && event.phase === 'load_input') {
        await setRunRunning(supabase, runId)
      } else if (event.percent !== undefined) {
        // Update progress in metrics
        await updateRunMetrics(supabase, runId, {
          percent: event.percent,
          current_phase: event.phase || undefined,
        })
      }
    } catch (error) {
      // Log but don't throw - progress writing should not break generation
      logger.error('Failed to write progress event', {
        runId,
        phase: event.phase,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
}

/**
 * Initialize a run in the database
 * 
 * NOTE: This has been adapted to use project_runs instead of analysis_runs
 * Derives inputVersion from project_inputs (defaults to 1 if none exists)
 * Uses runId as idempotencyKey since runId should be unique
 */
export async function initializeRun(
  supabase: TypedSupabaseClient,
  projectId: string,
  runId: string
): Promise<void> {
  const { getProjectRunById, createProjectRun } = await import('@/lib/data/projectRuns')
  const { getLatestProjectInput } = await import('@/lib/data/projectInputs')
  
  // Check if run already exists
  const existingResult = await getProjectRunById(supabase, runId)
  if (existingResult.ok && existingResult.data) {
    return // Run already exists, skip creation
  }
  
  // Get latest input version (default to 1 if none exists)
  let inputVersion = 1
  const latestInputResult = await getLatestProjectInput(supabase, projectId)
  if (latestInputResult.ok && latestInputResult.data) {
    inputVersion = latestInputResult.data.version
  }
  
  // Use runId as idempotency key (runId should be unique)
  const idempotencyKey = runId
  
  // Create new run
  const createResult = await createProjectRun(supabase, {
    projectId,
    inputVersion,
    idempotencyKey,
  })
  
  if (!createResult.ok) {
    throw new Error(`Failed to create project run: ${createResult.error.message}`)
  }
}
