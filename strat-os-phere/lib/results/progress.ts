/**
 * Progress tracking for Results v2 generation
 * Provides real-time status updates during artifact generation
 */

export type ResultsV2Phase =
  | 'load_input'
  | 'evidence_quality_check'
  | 'jobs_generate'
  | 'jobs_validate'
  | 'scorecard_generate'
  | 'scorecard_validate'
  | 'opportunities_generate'
  | 'opportunities_validate'
  | 'strategic_bets_generate'
  | 'strategic_bets_validate'
  | 'scoring_compute'
  | 'save_artifacts'
  | 'finalize'

export type ProgressStatus = 'started' | 'progress' | 'completed' | 'failed' | 'blocked'

export interface ProgressEvent {
  runId: string
  phase: ResultsV2Phase
  status: ProgressStatus // Phase status: started (phase begins), progress (substep update), completed (phase done), failed/blocked (error)
  message: string // User-facing status line
  detail?: string // Optional secondary line for context
  percent?: number // 0-100 (only if meaningful)
  timestamp: string
  meta?: {
    competitorCount?: number
    artifactCount?: number
    llmCallsDone?: number
    llmCallsTotal?: number
    repairsUsed?: number
    writesDone?: number
    writesTotal?: number
    durationMs?: number
    // Substep tracking for phases with multiple steps (e.g., processing multiple competitors)
    substep?: string // e.g., 'pricing', 'reviews', 'changelog', 'jobs', 'docs', 'status'
    current?: number // Current item index (1-based)
    total?: number // Total items to process
    competitorId?: string // ID of competitor being processed
    competitorName?: string // Name of competitor being processed
  }
}

export interface ProgressCallback {
  (event: ProgressEvent): void
}

/**
 * Create a progress event with consistent formatting
 * Defaults to 'started' status unless explicitly set
 */
export function makeProgressEvent(
  runId: string,
  phase: ResultsV2Phase,
  message: string,
  options?: {
    status?: ProgressStatus
    detail?: string
    percent?: number
    meta?: ProgressEvent['meta']
  }
): ProgressEvent {
  return {
    runId,
    phase,
    status: options?.status ?? 'started',
    message,
    detail: options?.detail,
    percent: options?.percent,
    timestamp: new Date().toISOString(),
    meta: options?.meta,
  }
}

/**
 * Format progress event as SSE data
 */
export function formatProgressEventSSE(event: ProgressEvent): string {
  return `event: progress\ndata: ${JSON.stringify(event)}\n\n`
}

/**
 * Format final completion event as SSE
 */
export function formatCompletionEventSSE(
  runId: string,
  artifactIds: string[],
  signals: unknown
): string {
  const event = {
    runId,
    phase: 'finalize' as ResultsV2Phase,
    message: 'Results generated successfully',
    timestamp: new Date().toISOString(),
    meta: {
      artifactCount: artifactIds.length,
    },
    artifactIds,
    signals,
  }
  return `event: complete\ndata: ${JSON.stringify(event)}\n\n`
}

/**
 * Format error event as SSE
 */
export function formatErrorEventSSE(
  runId: string,
  error: { code: string; message: string },
  status: ProgressStatus = 'failed'
): string {
  const event = {
    runId,
    phase: 'finalize' as ResultsV2Phase,
    status,
    message: status === 'blocked' ? 'Generation paused' : 'Generation failed',
    detail: error.message,
    timestamp: new Date().toISOString(),
    error,
  }
  return `event: error\ndata: ${JSON.stringify(event)}\n\n`
}

