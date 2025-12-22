/**
 * Progress tracking for Results v2 generation
 * Provides real-time status updates during artifact generation
 */

// Import from centralized constants to prevent drift
import { RESULTS_V2_PHASES, RESULTS_V2_PHASE_LIST, type ResultsV2Phase } from '@/lib/constants/types'
export { RESULTS_V2_PHASES, RESULTS_V2_PHASE_LIST, type ResultsV2Phase }

export type ProgressStatus = 'started' | 'progress' | 'completed' | 'failed' | 'blocked'

export interface ProgressEvent {
  runId: string
  phase: ResultsV2Phase
  status: ProgressStatus // Phase status: started (phase begins), progress (substep update), completed (phase done), failed/blocked (error)
  message: string // User-facing status line
  detail?: string // Optional secondary line for context
  percent?: number // 0-100 (only if meaningful)
  timestamp: string
  // Meta is flexible to allow adding fields without breaking builds
  // Common fields: competitorCount, profilesCount, artifactCount, llmCallsDone, etc.
  meta?: Record<string, unknown>
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

