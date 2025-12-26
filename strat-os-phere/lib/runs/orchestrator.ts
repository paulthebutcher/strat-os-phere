/**
 * Run Orchestrator - Centralized run state machine and step management
 * 
 * This module provides:
 * - Idempotent run creation/retrieval
 * - Step-level status tracking
 * - State machine transitions
 * - Resumable execution
 * 
 * Step status is stored in run.metrics.step_status as:
 * {
 *   "evidence": { "status": "running|completed|failed", "startedAt": "...", "finishedAt": "...", "error": {...} },
 *   "analysis": { ... }
 * }
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import {
  createProjectRun,
  getProjectRunByIdempotencyKey,
  getLatestRunForProject,
  updateRunMetrics,
  setRunRunning,
  setRunSucceeded,
  setRunFailed,
  type ProjectRun,
} from '@/lib/data/projectRuns'
import { getLatestProjectInput } from '@/lib/data/projectInputs'
import { logger } from '@/lib/logger'
import { PIPELINE_VERSION } from '@/lib/analysis/runProjectAnalysis'

/**
 * Run state machine states
 */
export type RunState = 'created' | 'collecting' | 'analyzing' | 'completed' | 'failed'

/**
 * Step names
 */
export type StepName = 'context' | 'evidence' | 'analysis' | 'opportunities'

/**
 * Step status
 */
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed'

/**
 * Step status detail
 */
export interface StepStatusDetail {
  status: StepStatus
  startedAt?: string
  finishedAt?: string
  error?: {
    code: string
    message: string
    detail?: string
  }
}

/**
 * Step status map stored in metrics.step_status
 */
export interface StepStatusMap {
  [stepName: string]: StepStatusDetail
}

/**
 * Get step status from run metrics
 */
export function getStepStatus(run: ProjectRun, stepName: StepName): StepStatusDetail {
  const metrics = (run.metrics as Record<string, any>) || {}
  const stepStatus = (metrics.step_status as StepStatusMap) || {}
  return stepStatus[stepName] || { status: 'pending' }
}

/**
 * Set step status in run metrics
 */
async function setStepStatus(
  supabase: TypedSupabaseClient,
  runId: string,
  stepName: StepName,
  status: StepStatus,
  error?: { code: string; message: string; detail?: string }
): Promise<{ ok: boolean; error?: { code: string; message: string } }> {
  try {
    // Get current metrics
    const { data: currentRunData, error: fetchRunError } = await supabase
      .from('project_runs')
      .select('metrics')
      .eq('id', runId)
      .single()

    if (fetchRunError) {
      logger.error('[orchestrator] Failed to fetch run for step status update', {
        runId,
        stepName,
        error: fetchRunError.message,
      })
      return {
        ok: false,
        error: {
          code: fetchRunError.code || 'UNKNOWN',
          message: fetchRunError.message || 'Failed to fetch run',
        },
      }
    }

    type RunWithMetrics = { metrics: Record<string, any> }
    const currentMetrics = ((currentRunData as RunWithMetrics | null)?.metrics as Record<string, any>) || {}
    const stepStatus = (currentMetrics.step_status as StepStatusMap) || {}
    
    const now = new Date().toISOString()
    const stepDetail: StepStatusDetail = {
      status,
      ...(status === 'running' && !stepStatus[stepName]?.startedAt && { startedAt: now }),
      ...(status === 'completed' || status === 'failed' ? { finishedAt: now } : {}),
      ...(error ? { error } : {}),
    }

    stepStatus[stepName] = stepDetail

    const updatedMetrics = {
      ...currentMetrics,
      step_status: stepStatus,
    }

    const result = await updateRunMetrics(supabase, runId, updatedMetrics)
    if (!result.ok) {
      return result
    }

    return { ok: true }
  } catch (error) {
    logger.error('[orchestrator] Exception setting step status', {
      runId,
      stepName,
      error: error instanceof Error ? error.message : String(error),
    })
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
 * Get or create an active run for a project (idempotent)
 * 
 * Strategy:
 * 1. If explicit runId provided, fetch it
 * 2. Else, get latest run for project
 * 3. If none exists and allowCreate=true, create new run
 * 4. Returns the run and whether it was created
 */
export async function getOrCreateActiveRun(
  supabase: TypedSupabaseClient,
  projectId: string,
  userId: string,
  options?: {
    runId?: string
    allowCreate?: boolean
    pipelineVersion?: string
  }
): Promise<
  | { ok: true; run: ProjectRun; created: boolean }
  | { ok: false; error: { code: string; message: string } }
> {
  try {
    const pipelineVersion = options?.pipelineVersion || PIPELINE_VERSION

    // 1. If explicit runId provided, fetch it
    if (options?.runId) {
      const { data: run, error } = await supabase
        .from('project_runs')
        .select('*')
        .eq('id', options.runId)
        .eq('project_id', projectId)
        .single()

      if (error) {
        logger.error('[orchestrator] Failed to fetch run by ID', {
          runId: options.runId,
          projectId,
          error: error.message,
        })
        return {
          ok: false,
          error: {
            code: error.code || 'NOT_FOUND',
            message: error.message || 'Run not found',
          },
        }
      }

      if (run) {
        return { ok: true, run: run as ProjectRun, created: false }
      }
    }

    // 2. Get latest run for project
    const latestResult = await getLatestRunForProject(supabase, projectId)
    if (!latestResult.ok) {
      return latestResult
    }

    if (latestResult.data) {
      // Check if run is still active (not completed/failed)
      const run = latestResult.data
      if (run.status === 'queued' || run.status === 'running') {
        logger.debug('[orchestrator] Found active run', {
          runId: run.id,
          projectId,
          status: run.status,
        })
        return { ok: true, run, created: false }
      }
    }

    // 3. No active run - create if allowed
    if (!options?.allowCreate) {
      return {
        ok: false,
        error: {
          code: 'NO_ACTIVE_RUN',
          message: 'No active run found and creation not allowed',
        },
      }
    }

    // Create new run
    const inputResult = await getLatestProjectInput(supabase, projectId)
    if (!inputResult.ok || !inputResult.data) {
      return {
        ok: false,
        error: {
          code: 'NO_INPUTS',
          message: 'No project inputs found. Please complete project setup first.',
        },
      }
    }

    const inputVersion = inputResult.data.version
    const idempotencyKey = `${projectId}:${inputVersion}:${pipelineVersion}`

    const createResult = await createProjectRun(supabase, {
      projectId,
      inputVersion,
      idempotencyKey,
    })

    if (!createResult.ok) {
      return createResult
    }

    if (!createResult.data) {
      return {
        ok: false,
        error: {
          code: 'NO_DATA',
          message: 'Run created but no data returned',
        },
      }
    }

    logger.info('[orchestrator] Created new run', {
      runId: createResult.data.id,
      projectId,
      inputVersion,
    })

    return { ok: true, run: createResult.data, created: true }
  } catch (error) {
    logger.error('[orchestrator] Exception in getOrCreateActiveRun', {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    })
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
 * Advance run to a target step (idempotent, resumable)
 * 
 * Behavior:
 * - If step already completed, no-op (return success)
 * - If step is running, return current status (don't start another)
 * - If step failed, allow retry (reset and re-run)
 * - If step is pending, start it
 */
export async function advanceRun(
  supabase: TypedSupabaseClient,
  runId: string,
  targetStep: StepName
): Promise<
  | { ok: true; action: 'noop' | 'started' | 'resumed'; stepStatus: StepStatusDetail }
  | { ok: false; error: { code: string; message: string } }
> {
  try {
    // Get current run
    const { data: run, error: fetchError } = await supabase
      .from('project_runs')
      .select('*')
      .eq('id', runId)
      .single()

    if (fetchError || !run) {
      return {
        ok: false,
        error: {
          code: fetchError?.code || 'NOT_FOUND',
          message: fetchError?.message || 'Run not found',
        },
      }
    }

    const currentRun = run as ProjectRun
    const stepStatus = getStepStatus(currentRun, targetStep)

    // If step already completed, no-op
    if (stepStatus.status === 'completed') {
      logger.debug('[orchestrator] Step already completed', {
        runId,
        step: targetStep,
      })
      return { ok: true, action: 'noop', stepStatus }
    }

    // If step is running, return current status (don't start another)
    if (stepStatus.status === 'running') {
      logger.debug('[orchestrator] Step already running', {
        runId,
        step: targetStep,
      })
      return { ok: true, action: 'noop', stepStatus }
    }

    // If step failed, allow retry (reset status to pending, then start)
    if (stepStatus.status === 'failed') {
      logger.info('[orchestrator] Retrying failed step', {
        runId,
        step: targetStep,
      })
      // Reset step status to pending first
      await setStepStatus(supabase, runId, targetStep, 'pending')
    }

    // Start the step
    const setResult = await setStepStatus(supabase, runId, targetStep, 'running')
    if (!setResult.ok) {
      return {
        ok: false as const,
        error: setResult.error!,
      }
    }

    // If run is not yet running, transition it
    if (currentRun.status === 'queued') {
      const runningResult = await setRunRunning(supabase, runId)
      if (!runningResult.ok) {
        logger.warn('[orchestrator] Failed to transition run to running', {
          runId,
          error: runningResult.error.message,
        })
        // Continue anyway - step status is set
      }
    }

    // Fetch updated run to get new step status
    const { data: updatedRunData, error: fetchUpdatedError } = await supabase
      .from('project_runs')
      .select('*')
      .eq('id', runId)
      .single()

    if (fetchUpdatedError || !updatedRunData) {
      // If we can't fetch, return the status we just set
      return {
        ok: true,
        action: stepStatus.status === 'failed' ? 'resumed' : 'started',
        stepStatus: {
          status: 'running',
          startedAt: new Date().toISOString(),
        },
      }
    }

    const newStepStatus = getStepStatus(updatedRunData as ProjectRun, targetStep)

    return {
      ok: true,
      action: stepStatus.status === 'failed' ? 'resumed' : 'started',
      stepStatus: newStepStatus,
    }
  } catch (error) {
    logger.error('[orchestrator] Exception in advanceRun', {
      runId,
      step: targetStep,
      error: error instanceof Error ? error.message : String(error),
    })
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
 * Mark a step as completed
 */
export async function markStepCompleted(
  supabase: TypedSupabaseClient,
  runId: string,
  stepName: StepName
): Promise<{ ok: boolean; error?: { code: string; message: string } }> {
  return setStepStatus(supabase, runId, stepName, 'completed')
}

/**
 * Mark a step as failed
 */
export async function markStepFailed(
  supabase: TypedSupabaseClient,
  runId: string,
  stepName: StepName,
  error: { code: string; message: string; detail?: string }
): Promise<{ ok: boolean; error?: { code: string; message: string } }> {
  return setStepStatus(supabase, runId, stepName, 'failed', error)
}

/**
 * Mark run as completed (all steps done)
 */
export async function markRunCompleted(
  supabase: TypedSupabaseClient,
  runId: string,
  output?: Record<string, any>
): Promise<
  | { ok: true; run: ProjectRun }
  | { ok: false; error: { code: string; message: string } }
> {
  const result = await setRunSucceeded(supabase, runId, { output })
  if (!result.ok) {
    return result
  }
  return { ok: true, run: result.data }
}

/**
 * Mark run as failed
 */
export async function markRunFailed(
  supabase: TypedSupabaseClient,
  runId: string,
  error: { code: string; message: string; detail?: string }
): Promise<
  | { ok: true; run: ProjectRun }
  | { ok: false; error: { code: string; message: string } }
> {
  const result = await setRunFailed(supabase, runId, {
    error_code: error.code,
    error_message: error.message,
    error_detail: error.detail,
  })
  if (!result.ok) {
    return result
  }
  return { ok: true, run: result.data }
}

