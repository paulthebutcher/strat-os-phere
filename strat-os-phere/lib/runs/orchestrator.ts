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
import {
  parseStepStatus,
  serializeStepStatus,
  validateStepStatusEntry,
  type StepName,
  type StepStatusMap,
  type StepStatusEntry,
} from '@/lib/runs/stepStatusSchema'
import { tryMarkStepRunning } from '@/lib/runs/runPersistence'
import {
  parseTelemetry,
  mergeTelemetry,
  serializeTelemetry,
  sanitizeTelemetryError,
  type RunTelemetry,
  type Counters,
  type Upstreams,
} from '@/lib/runs/telemetrySchema'

// Re-export StepName for backward compatibility
export type { StepName } from '@/lib/runs/stepStatusSchema'

/**
 * Run state machine states
 */
export type RunState = 'created' | 'collecting' | 'analyzing' | 'completed' | 'failed'

/**
 * Step status detail (re-exported from schema for backward compatibility)
 */
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed'

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
 * Get step status from run metrics
 * Uses schema validation to prevent drift
 */
export function getStepStatus(run: ProjectRun, stepName: StepName): StepStatusDetail {
  const metrics = (run.metrics as Record<string, any>) || {}
  const stepStatus = parseStepStatus(metrics.step_status)
  const entry = stepStatus[stepName]
  
  if (!entry) {
    return { status: 'pending' }
  }

  // Validate entry shape
  const validated = validateStepStatusEntry(entry)
  if (!validated) {
    // Invalid entry - return pending as safe default
    return { status: 'pending' }
  }

  // Map to StepStatusDetail format
  return {
    status: validated.status,
    startedAt: validated.startedAt,
    finishedAt: validated.finishedAt,
    error: validated.error ? {
      code: validated.error.code,
      message: validated.error.message,
      detail: validated.error.detail,
    } : undefined,
  }
}

/**
 * Get telemetry from run metrics
 */
export function getTelemetry(run: ProjectRun): RunTelemetry {
  const metrics = (run.metrics as Record<string, any>) || {}
  return parseTelemetry(metrics.telemetry, run.created_at)
}

/**
 * Update telemetry in run metrics
 */
async function updateTelemetry(
  supabase: TypedSupabaseClient,
  runId: string,
  updater: (currentTelemetry: RunTelemetry) => RunTelemetry
): Promise<{ ok: boolean; error?: { code: string; message: string } }> {
  try {
    // Get current metrics
    const { data: currentRunData, error: fetchRunError } = await supabase
      .from('project_runs')
      .select('metrics, created_at')
      .eq('id', runId)
      .single()

    if (fetchRunError) {
      logger.error('[orchestrator] Failed to fetch run for telemetry update', {
        runId,
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

    type RunWithMetrics = { metrics: Record<string, any>; created_at: string }
    const currentRunTyped = currentRunData as RunWithMetrics | null
    const currentMetrics = currentRunTyped?.metrics || {}
    const createdAt = currentRunTyped?.created_at || new Date().toISOString()
    
    // Parse current telemetry
    const currentTelemetry = parseTelemetry(currentMetrics.telemetry, createdAt)
    
    // Apply update
    const updatedTelemetry = updater(currentTelemetry)
    
    // Validate and serialize
    const serialized = serializeTelemetry(updatedTelemetry)

    // Write back
    const updatedMetrics = {
      ...currentMetrics,
      telemetry: serialized,
    }

    const result = await updateRunMetrics(supabase, runId, updatedMetrics)
    if (!result.ok) {
      return result
    }

    return { ok: true }
  } catch (error) {
    logger.error('[orchestrator] Exception updating telemetry', {
      runId,
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
 * Update step status in run metrics with schema validation
 * 
 * This is the single place that "knows" the structure of metrics.step_status.
 * It reads, parses, updates, validates, and writes back.
 */
async function updateStepStatus(
  supabase: TypedSupabaseClient,
  runId: string,
  updater: (currentStatus: StepStatusMap) => StepStatusMap
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
    
    // Parse current step status (validates shape)
    const currentStepStatus = parseStepStatus(currentMetrics.step_status)
    
    // Apply update
    const updatedStepStatus = updater(currentStepStatus)
    
    // Validate and serialize the updated status
    const serialized = serializeStepStatus(updatedStepStatus)

    // Write back validated structure
    const updatedMetrics = {
      ...currentMetrics,
      step_status: serialized,
    }

    const result = await updateRunMetrics(supabase, runId, updatedMetrics)
    if (!result.ok) {
      return result
    }

    return { ok: true }
  } catch (error) {
    logger.error('[orchestrator] Exception updating step status', {
      runId,
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
 * Set step status in run metrics
 * Uses updateStepStatus for schema-validated updates
 */
async function setStepStatus(
  supabase: TypedSupabaseClient,
  runId: string,
  stepName: StepName,
  status: StepStatus,
  error?: { code: string; message: string; detail?: string }
): Promise<{ ok: boolean; error?: { code: string; message: string } }> {
  const now = new Date().toISOString()
  
  return updateStepStatus(supabase, runId, (currentStatus) => {
    const currentEntry = currentStatus[stepName]
    
    const updatedEntry: StepStatusEntry = {
      status,
      // Preserve startedAt if already set, otherwise set it for running status
      startedAt: currentEntry?.startedAt || (status === 'running' ? now : undefined),
      // Set finishedAt for terminal states
      finishedAt: (status === 'completed' || status === 'failed') ? now : currentEntry?.finishedAt,
      // Include error if provided
      error: error ? {
        code: error.code,
        message: error.message,
        detail: error.detail,
      } : undefined,
    }

    return {
      ...currentStatus,
      [stepName]: updatedEntry,
    }
  })
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

    // Initialize telemetry for new run
    const createdAt = createResult.data.created_at
    const initialTelemetry = {
      timeline: {
        createdAt,
      },
    }
    await updateTelemetry(supabase, createResult.data.id, () => initialTelemetry as RunTelemetry)

    logger.info('[orchestrator] run.created', {
      event: 'run.created',
      runId: createResult.data.id,
      projectId,
      inputVersion,
      requestId: options?.runId,
      createdAt: createResult.data.created_at,
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

    // Atomically mark step as running (race-condition safe)
    const now = new Date().toISOString()
    const atomicResult = await tryMarkStepRunning(supabase, runId, targetStep, now)

    if (!atomicResult.ok) {
      // Step was already running or completed by another request
      if (atomicResult.reason === 'already_running' || atomicResult.reason === 'already_completed') {
        // Re-fetch to get current status
        const { data: currentRunData, error: refetchError } = await supabase
          .from('project_runs')
          .select('*')
          .eq('id', runId)
          .single()

        if (refetchError || !currentRunData) {
          return {
            ok: false,
            error: {
              code: 'FETCH_ERROR',
              message: 'Failed to fetch current run status',
            },
          }
        }

        const currentStatus = getStepStatus(currentRunData as ProjectRun, targetStep)
        return {
          ok: true,
          action: 'noop',
          stepStatus: currentStatus,
        }
      }

      // Update failed
      return {
        ok: false,
        error: {
          code: 'UPDATE_ERROR',
          message: `Failed to mark step as running: ${atomicResult.reason}`,
        },
      }
    }

    // Record telemetry for step start (after step status is successfully updated)
    // Use a synthetic requestId if none provided (advanceRun doesn't take requestId)
    // This is ok - the telemetry will still track the step start
    await recordStepStart(supabase, runId, targetStep, undefined).catch((err) => {
      // Log but don't fail - telemetry recording is best-effort
      logger.warn('[orchestrator] Failed to record step start telemetry', {
        runId,
        step: targetStep,
        error: err instanceof Error ? err.message : String(err),
      })
    })

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
  // Get run to compute duration
  const { data: runData } = await supabase
    .from('project_runs')
    .select('created_at, started_at')
    .eq('id', runId)
    .single()

  const result = await setRunSucceeded(supabase, runId, { output })
  if (!result.ok) {
    return result
  }

  type RunData = { created_at: string; started_at: string | null } | null
  const typedRunData = runData as RunData
  const createdAt = typedRunData?.created_at ? new Date(typedRunData.created_at) : new Date()
  const startedAt = typedRunData?.started_at ? new Date(typedRunData.started_at) : new Date()
  const finishedAt = new Date()
  const totalDurationMs = finishedAt.getTime() - createdAt.getTime()

  // Log run completion
  logger.info('[orchestrator] run.completed', {
    event: 'run.completed',
    runId,
    createdAt: typedRunData?.created_at,
    startedAt: typedRunData?.started_at,
    finishedAt: finishedAt.toISOString(),
    totalDurationMs,
  })

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

/**
 * Record step start - updates both step_status and telemetry
 */
export async function recordStepStart(
  supabase: TypedSupabaseClient,
  runId: string,
  step: StepName,
  requestId?: string
): Promise<{ ok: boolean; error?: { code: string; message: string } }> {
  const now = new Date().toISOString()
  
  // Update step status (this also increments attempts via setStepStatus logic)
  const stepResult = await setStepStatus(supabase, runId, step, 'running')
  if (!stepResult.ok) {
    return stepResult
  }

  // Log step start
  logger.info('[orchestrator] run.step.start', {
    event: 'run.step.start',
    runId,
    step,
    requestId,
    startedAt: now,
  })

  // Update telemetry
  const telemetryResult = await updateTelemetry(supabase, runId, (current) => {
    const stepTimeline = current.timeline.steps || {}
    const currentStepEntry = stepTimeline[step]
    
    const updatedStepEntry = {
      status: 'running' as const,
      startedAt: now,
      attempts: (currentStepEntry?.attempts || 0) + 1,
    }

    return mergeTelemetry(current, {
      timeline: {
        createdAt: current.timeline.createdAt,
        startedAt: current.timeline.startedAt || now,
        steps: {
          ...stepTimeline,
          [step]: updatedStepEntry,
        },
      },
      lastEvent: {
        at: now,
        name: 'step.start',
        step,
        requestId,
      },
    })
  })

  return telemetryResult
}

/**
 * Record step completion - updates both step_status and telemetry
 */
export async function recordStepComplete(
  supabase: TypedSupabaseClient,
  runId: string,
  step: StepName,
  requestId?: string,
  counters?: Partial<Counters>
): Promise<{ ok: boolean; error?: { code: string; message: string } }> {
  const now = new Date().toISOString()
  
  // Update step status
  const stepResult = await setStepStatus(supabase, runId, step, 'completed')
  if (!stepResult.ok) {
    return stepResult
  }

  // Get current run to compute duration
  const { data: currentRunData } = await supabase
    .from('project_runs')
    .select('metrics, created_at')
    .eq('id', runId)
    .single()

  type RunDataWithMetrics = { metrics: Record<string, any>; created_at: string } | null
  const typedRunData = currentRunData as RunDataWithMetrics
  const currentMetrics = typedRunData?.metrics || {}
  const telemetry = parseTelemetry(currentMetrics.telemetry, typedRunData?.created_at)
  const stepTimeline = telemetry.timeline.steps || {}
  const stepEntry = stepTimeline[step]
  
  const startedAt = stepEntry?.startedAt ? new Date(stepEntry.startedAt) : new Date(now)
  const finishedAt = new Date(now)
  const durationMs = finishedAt.getTime() - startedAt.getTime()

  // Log step completion
  logger.info('[orchestrator] run.step.complete', {
    event: 'run.step.complete',
    runId,
    step,
    requestId,
    startedAt: stepEntry?.startedAt,
    finishedAt: now,
    durationMs,
  })

  // Update telemetry
  const telemetryResult = await updateTelemetry(supabase, runId, (current) => {
    const updatedStepTimeline = current.timeline.steps || {}
    updatedStepTimeline[step] = {
      status: 'completed' as const,
      startedAt: stepEntry?.startedAt || now,
      finishedAt: now,
      durationMs,
      attempts: stepEntry?.attempts || 0,
    }

    return mergeTelemetry(current, {
      timeline: {
        createdAt: current.timeline.createdAt,
        steps: updatedStepTimeline,
      },
      counters: counters ? {
        evidence: {
          ...current.counters?.evidence,
          ...(counters.evidence || {}),
        },
        llm: {
          ...current.counters?.llm,
          ...(counters.llm || {}),
        },
      } : current.counters,
      lastEvent: {
        at: now,
        name: 'step.complete',
        step,
        requestId,
      },
    })
  })

  return telemetryResult
}

/**
 * Record step failure - updates both step_status and telemetry
 */
export async function recordStepFailure(
  supabase: TypedSupabaseClient,
  runId: string,
  step: StepName,
  error: { code: string; message: string; detail?: string; upstream?: string },
  requestId?: string
): Promise<{ ok: boolean; error?: { code: string; message: string } }> {
  const now = new Date().toISOString()
  
  // Update step status
  const stepResult = await setStepStatus(supabase, runId, step, 'failed', {
    code: error.code,
    message: error.message,
    detail: error.detail,
  })
  if (!stepResult.ok) {
    return stepResult
  }

  // Get current run to compute duration
  const { data: currentRunData } = await supabase
    .from('project_runs')
    .select('metrics, created_at')
    .eq('id', runId)
    .single()

  type RunDataWithMetrics = { metrics: Record<string, any>; created_at: string } | null
  const typedRunData = currentRunData as RunDataWithMetrics
  const currentMetrics = typedRunData?.metrics || {}
  const telemetry = parseTelemetry(currentMetrics.telemetry, typedRunData?.created_at)
  const stepTimeline = telemetry.timeline.steps || {}
  const stepEntry = stepTimeline[step]
  
  const startedAt = stepEntry?.startedAt ? new Date(stepEntry.startedAt) : new Date(now)
  const finishedAt = new Date(now)
  const durationMs = finishedAt.getTime() - startedAt.getTime()

  // Log step failure
  logger.error('[orchestrator] run.step.fail', {
    event: 'run.step.fail',
    runId,
    step,
    requestId,
    errorCode: error.code,
    errorMessage: error.message,
    startedAt: stepEntry?.startedAt,
    finishedAt: now,
    durationMs,
    upstream: error.upstream,
  })

  // Sanitize error for telemetry
  const sanitizedError = sanitizeTelemetryError({
    code: error.code,
    message: error.message,
    requestId,
    step,
    upstream: error.upstream,
    details: error.detail ? { detail: error.detail } : undefined,
  })

  // Update telemetry
  const telemetryResult = await updateTelemetry(supabase, runId, (current) => {
    const updatedStepTimeline = current.timeline.steps || {}
    updatedStepTimeline[step] = {
      status: 'failed' as const,
      startedAt: stepEntry?.startedAt || now,
      finishedAt: now,
      durationMs,
      attempts: stepEntry?.attempts || 0,
    }

    return mergeTelemetry(current, {
      timeline: {
        createdAt: current.timeline.createdAt,
        steps: updatedStepTimeline,
      },
      debug: {
        lastError: sanitizedError,
      },
      lastEvent: {
        at: now,
        name: 'step.fail',
        step,
        requestId,
      },
    })
  })

  return telemetryResult
}

/**
 * Increment counters (evidence, llm, upstream)
 * Only increments values that are provided in patch
 */
export async function incrementCounters(
  supabase: TypedSupabaseClient,
  runId: string,
  patch: {
    evidence?: Partial<Counters['evidence']>
    llm?: Partial<Counters['llm']>
    upstreams?: Partial<Upstreams>
  }
): Promise<{ ok: boolean; error?: { code: string; message: string } }> {
  return updateTelemetry(supabase, runId, (current) => {
    const evidencePatch: Partial<Counters['evidence']> = {}
    if (patch.evidence?.sourcesFound !== undefined) {
      evidencePatch.sourcesFound = (current.counters?.evidence?.sourcesFound || 0) + patch.evidence.sourcesFound
    }
    if (patch.evidence?.sourcesFetched !== undefined) {
      evidencePatch.sourcesFetched = (current.counters?.evidence?.sourcesFetched || 0) + patch.evidence.sourcesFetched
    }
    if (patch.evidence?.sourcesSaved !== undefined) {
      evidencePatch.sourcesSaved = (current.counters?.evidence?.sourcesSaved || 0) + patch.evidence.sourcesSaved
    }

    const llmPatch: Partial<Counters['llm']> = {}
    if (patch.llm?.calls !== undefined) {
      llmPatch.calls = (current.counters?.llm?.calls || 0) + patch.llm.calls
    }
    if (patch.llm?.tokensIn !== undefined) {
      llmPatch.tokensIn = (current.counters?.llm?.tokensIn || 0) + patch.llm.tokensIn
    }
    if (patch.llm?.tokensOut !== undefined) {
      llmPatch.tokensOut = (current.counters?.llm?.tokensOut || 0) + patch.llm.tokensOut
    }
    if (patch.llm?.repairs !== undefined) {
      llmPatch.repairs = (current.counters?.llm?.repairs || 0) + patch.llm.repairs
    }
    if (patch.llm?.retries !== undefined) {
      llmPatch.retries = (current.counters?.llm?.retries || 0) + patch.llm.retries
    }

    const upstreamsPatch: Partial<Upstreams> = {}
    if (patch.upstreams?.tavily) {
      upstreamsPatch.tavily = {}
      if (patch.upstreams.tavily.requests !== undefined) {
        upstreamsPatch.tavily.requests = (current.upstreams?.tavily?.requests || 0) + patch.upstreams.tavily.requests
      }
      if (patch.upstreams.tavily.timeouts !== undefined) {
        upstreamsPatch.tavily.timeouts = (current.upstreams?.tavily?.timeouts || 0) + patch.upstreams.tavily.timeouts
      }
      if (patch.upstreams.tavily.rateLimits !== undefined) {
        upstreamsPatch.tavily.rateLimits = (current.upstreams?.tavily?.rateLimits || 0) + patch.upstreams.tavily.rateLimits
      }
    }
    if (patch.upstreams?.openai) {
      upstreamsPatch.openai = {}
      if (patch.upstreams.openai.requests !== undefined) {
        upstreamsPatch.openai.requests = (current.upstreams?.openai?.requests || 0) + patch.upstreams.openai.requests
      }
      if (patch.upstreams.openai.timeouts !== undefined) {
        upstreamsPatch.openai.timeouts = (current.upstreams?.openai?.timeouts || 0) + patch.upstreams.openai.timeouts
      }
      if (patch.upstreams.openai.rateLimits !== undefined) {
        upstreamsPatch.openai.rateLimits = (current.upstreams?.openai?.rateLimits || 0) + patch.upstreams.openai.rateLimits
      }
    }

    return mergeTelemetry(current, {
      counters: Object.keys(evidencePatch).length > 0 || Object.keys(llmPatch).length > 0 ? {
        evidence: Object.keys(evidencePatch).length > 0 ? {
          ...current.counters?.evidence,
          ...evidencePatch,
        } : current.counters?.evidence,
        llm: Object.keys(llmPatch).length > 0 ? {
          ...current.counters?.llm,
          ...llmPatch,
        } : current.counters?.llm,
      } : current.counters,
      upstreams: Object.keys(upstreamsPatch).length > 0 ? {
        ...current.upstreams,
        ...upstreamsPatch,
      } : current.upstreams,
    })
  })
}

