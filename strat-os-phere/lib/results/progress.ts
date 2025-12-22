/**
 * Progress tracking for Results v2 generation
 * Provides real-time status updates during artifact generation
 */

export type ResultsV2Phase =
  | 'load_input'
  | 'competitor_profiles'
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

/**
 * Canonical phase constants for ResultsV2Phase
 * Use these constants instead of raw strings to prevent typos and ensure type safety
 */
export const RESULTS_V2_PHASES = {
  LOAD_INPUT: 'load_input',
  COMPETITOR_PROFILES: 'competitor_profiles',
  EVIDENCE_QUALITY_CHECK: 'evidence_quality_check',
  JOBS_GENERATE: 'jobs_generate',
  JOBS_VALIDATE: 'jobs_validate',
  SCORECARD_GENERATE: 'scorecard_generate',
  SCORECARD_VALIDATE: 'scorecard_validate',
  OPPORTUNITIES_GENERATE: 'opportunities_generate',
  OPPORTUNITIES_VALIDATE: 'opportunities_validate',
  STRATEGIC_BETS_GENERATE: 'strategic_bets_generate',
  STRATEGIC_BETS_VALIDATE: 'strategic_bets_validate',
  SCORING_COMPUTE: 'scoring_compute',
  SAVE_ARTIFACTS: 'save_artifacts',
  FINALIZE: 'finalize',
} as const satisfies Record<string, ResultsV2Phase>

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
    profilesCount?: number
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
    // Allow additional meta fields for extensibility
    [key: string]: unknown
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
  error: { code: string; message: string; details?: Record<string, unknown> },
  status: ProgressStatus = 'failed'
): string {
  const event = {
    runId,
    phase: 'finalize' as ResultsV2Phase,
    status,
    message: status === 'blocked' ? 'Generation paused' : 'Generation failed',
    detail: error.message,
    timestamp: new Date().toISOString(),
    error: {
      ...error,
      details: error.details,
    },
  }
  return `event: error\ndata: ${JSON.stringify(event)}\n\n`
}

