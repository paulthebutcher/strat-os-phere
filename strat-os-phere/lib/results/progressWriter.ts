/**
 * Progress event writer that persists events to the database
 * Wraps the existing progress callback system to add database persistence
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { ProgressCallback, ProgressEvent } from './progress'
import { createAnalysisRunEvent, updateAnalysisRun } from '@/lib/data/runs'
import { logger } from '@/lib/logger'

/**
 * Create a progress callback that writes events to the database
 * Also updates the run's current_phase and percent
 */
export function createProgressWriter(
  supabase: TypedSupabaseClient,
  runId: string
): ProgressCallback {
  return async (event: ProgressEvent) => {
    try {
      // Map progress status to event level
      const level =
        event.status === 'failed' || event.status === 'blocked'
          ? 'error'
          : event.status === 'completed'
          ? 'info'
          : 'info'

      // Write event to database
      await createAnalysisRunEvent(supabase, {
        run_id: runId,
        level,
        phase: event.phase,
        message: event.message,
        meta: event.detail || event.meta ? {
          detail: event.detail,
          ...event.meta,
        } : null,
      })

      // Update run status with current phase and percent
      const updates: Parameters<typeof updateAnalysisRun>[2] = {
        current_phase: event.phase,
        last_heartbeat_at: new Date().toISOString(),
      }

      if (event.percent !== undefined) {
        updates.percent = event.percent
      }

      // Update status based on event status
      if (event.status === 'failed' || event.status === 'blocked') {
        updates.status = 'failed'
        if (event.detail) {
          updates.error_message = event.detail
        }
      } else if (event.status === 'completed' && event.phase === 'finalize') {
        updates.status = 'completed'
        updates.completed_at = new Date().toISOString()
        updates.percent = 100
      } else if (event.status === 'started' && event.phase === 'load_input') {
        // Mark as running when generation actually starts
        updates.status = 'running'
        updates.started_at = new Date().toISOString()
      }

      await updateAnalysisRun(supabase, runId, updates)
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
 */
export async function initializeRun(
  supabase: TypedSupabaseClient,
  projectId: string,
  runId: string
): Promise<void> {
  const { createAnalysisRun } = await import('@/lib/data/runs')
  // Check if run already exists
  const { getAnalysisRunById } = await import('@/lib/data/runs')
  const existing = await getAnalysisRunById(supabase, runId)
  if (existing) {
    return // Run already exists, skip creation
  }
  await createAnalysisRun(supabase, {
    project_id: projectId,
    id: runId,
    status: 'queued',
  } as Parameters<typeof createAnalysisRun>[1])
}

