/**
 * Run Telemetry Schema - Zod validation for metrics.telemetry
 * 
 * Comprehensive observability data stored in run.metrics.telemetry.
 * Includes timeline, counters, upstream events, and debug information.
 * 
 * Safety rules:
 * - Keep JSON small (cap arrays, truncate strings)
 * - Don't store secrets
 * - Don't store full raw evidence/HTML/LLM prompts
 */

import { z } from 'zod'

// Maximum lengths and counts to keep telemetry JSON small
const MAX_STRING_LENGTH = 1000
const MAX_ARRAY_LENGTH = 20
const MAX_NOTES_LENGTH = 10

/**
 * Helper to truncate strings to max length
 */
function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength - 3) + '...'
}

/**
 * Helper to cap array length
 */
function capArray<T>(arr: T[], maxLength: number): T[] {
  return arr.slice(0, maxLength)
}

/**
 * Step timeline entry - tracks individual step execution
 */
const StepTimelineEntrySchema = z.object({
  status: z.enum(['running', 'completed', 'failed']),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  durationMs: z.number().optional(),
  attempts: z.number().default(0),
})

export type StepTimelineEntry = z.infer<typeof StepTimelineEntrySchema>

/**
 * Evidence counters
 */
const EvidenceCountersSchema = z.object({
  sourcesFound: z.number().optional(),
  sourcesFetched: z.number().optional(),
  sourcesSaved: z.number().optional(),
})

export type EvidenceCounters = z.infer<typeof EvidenceCountersSchema>

/**
 * LLM counters
 */
const LLMCountersSchema = z.object({
  calls: z.number().optional(),
  tokensIn: z.number().optional(),
  tokensOut: z.number().optional(),
  repairs: z.number().optional(),
  retries: z.number().optional(),
})

export type LLMCounters = z.infer<typeof LLMCountersSchema>

/**
 * Upstream service counters (Tavily, OpenAI, etc.)
 */
const UpstreamCountersSchema = z.object({
  requests: z.number().optional(),
  timeouts: z.number().optional(),
  rateLimits: z.number().optional(),
})

export type UpstreamCounters = z.infer<typeof UpstreamCountersSchema>

/**
 * Upstream services tracking
 */
const UpstreamsSchema = z.object({
  tavily: UpstreamCountersSchema.optional(),
  openai: UpstreamCountersSchema.optional(),
})

export type Upstreams = z.infer<typeof UpstreamsSchema>

/**
 * Last event tracking
 */
const LastEventSchema = z.object({
  at: z.string(),
  name: z.string(),
  step: z.string().optional(),
  requestId: z.string().optional(),
})

export type LastEvent = z.infer<typeof LastEventSchema>

/**
 * Sanitized error information (dev-safe, capped size)
 */
const TelemetryErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  requestId: z.string().optional(),
  at: z.string(),
  step: z.string().optional(),
  upstream: z.string().optional(), // e.g., 'tavily', 'openai'
  details: z.record(z.unknown()).optional(),
})

export type TelemetryError = z.infer<typeof TelemetryErrorSchema>

/**
 * Debug information (dev-safe, capped size)
 */
const DebugSchema = z.object({
  notes: z.array(z.string()).max(MAX_NOTES_LENGTH).optional(),
  lastError: TelemetryErrorSchema.optional(),
})

export type Debug = z.infer<typeof DebugSchema>

/**
 * Counters object
 */
const CountersSchema = z.object({
  evidence: EvidenceCountersSchema.optional(),
  llm: LLMCountersSchema.optional(),
})

export type Counters = z.infer<typeof CountersSchema>

/**
 * Timeline object
 */
const TimelineSchema = z.object({
  createdAt: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  steps: z.record(StepTimelineEntrySchema).optional(), // keyed by step name
})

export type Timeline = z.infer<typeof TimelineSchema>

/**
 * Complete telemetry schema
 */
const RunTelemetrySchema = z.object({
  timeline: TimelineSchema,
  counters: CountersSchema.optional(),
  upstreams: UpstreamsSchema.optional(),
  lastEvent: LastEventSchema.optional(),
  debug: DebugSchema.optional(),
})

export type RunTelemetry = z.infer<typeof RunTelemetrySchema>

/**
 * Parse telemetry from unknown value
 * Returns empty/default telemetry on null/undefined/invalid
 */
export function parseTelemetry(value: unknown, createdAt?: string): RunTelemetry {
  if (value === null || value === undefined) {
    return {
      timeline: {
        createdAt: createdAt || new Date().toISOString(),
      },
    }
  }

  const result = RunTelemetrySchema.safeParse(value)

  if (!result.success) {
    console.warn('[telemetrySchema] Invalid telemetry shape, normalizing to default', {
      errors: result.error.errors,
    })
    return {
      timeline: {
        createdAt: createdAt || new Date().toISOString(),
      },
    }
  }

  return result.data
}

/**
 * Validate and normalize telemetry error (sanitize for storage)
 */
export function sanitizeTelemetryError(error: {
  code: string
  message: string
  requestId?: string
  step?: string
  upstream?: string
  details?: Record<string, unknown>
}): TelemetryError {
  return {
    code: truncateString(error.code, 100),
    message: truncateString(error.message, MAX_STRING_LENGTH),
    requestId: error.requestId ? truncateString(error.requestId, 100) : undefined,
    at: new Date().toISOString(),
    step: error.step ? truncateString(error.step, 50) : undefined,
    upstream: error.upstream ? truncateString(error.upstream, 50) : undefined,
    details: error.details ? Object.fromEntries(
      Object.entries(error.details).slice(0, 5).map(([k, v]) => [
        truncateString(k, 50),
        typeof v === 'string' ? truncateString(v, 200) : v,
      ])
    ) : undefined,
  }
}

/**
 * Merge telemetry with a patch (deep merge, validates result)
 */
export function mergeTelemetry(
  current: RunTelemetry,
  patch: Partial<RunTelemetry>
): RunTelemetry {
  const merged: RunTelemetry = {
    timeline: {
      ...current.timeline,
      ...(patch.timeline || {}),
      steps: {
        ...current.timeline.steps,
        ...(patch.timeline?.steps || {}),
      },
      // Preserve createdAt from current if not in patch
      createdAt: patch.timeline?.createdAt || current.timeline.createdAt,
    },
    counters: {
      evidence: {
        ...current.counters?.evidence,
        ...(patch.counters?.evidence || {}),
      },
      llm: {
        ...current.counters?.llm,
        ...(patch.counters?.llm || {}),
      },
    },
    upstreams: {
      tavily: {
        ...current.upstreams?.tavily,
        ...(patch.upstreams?.tavily || {}),
      },
      openai: {
        ...current.upstreams?.openai,
        ...(patch.upstreams?.openai || {}),
      },
    },
    lastEvent: patch.lastEvent || current.lastEvent,
    debug: {
      notes: capArray(
        [...(current.debug?.notes || []), ...(patch.debug?.notes || [])],
        MAX_NOTES_LENGTH
      ),
      lastError: patch.debug?.lastError || current.debug?.lastError,
    },
  }

  // Validate the merged result
  const result = RunTelemetrySchema.safeParse(merged)
  if (!result.success) {
    console.error('[telemetrySchema] Merged telemetry validation failed', {
      errors: result.error.errors,
    })
    // Return current if merge validation fails (fail-safe)
    return current
  }

  return result.data
}

/**
 * Serialize telemetry for storage (ensures valid structure)
 */
export function serializeTelemetry(telemetry: RunTelemetry): RunTelemetry {
  const result = RunTelemetrySchema.safeParse(telemetry)
  if (!result.success) {
    console.error('[telemetrySchema] Telemetry serialization validation failed', {
      errors: result.error.errors,
    })
    // Return minimal valid telemetry as fallback
    return {
      timeline: {
        createdAt: telemetry.timeline.createdAt || new Date().toISOString(),
      },
    }
  }

  return result.data
}

// Export schema for use in validation
export { RunTelemetrySchema }

