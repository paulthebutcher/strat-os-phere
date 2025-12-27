/**
 * Structured logging for telemetry with consistent prefixes
 * Always includes traceId for request tracking
 */

/**
 * Log an info-level event
 */
export function logInfo(event: string, payload: Record<string, any>) {
  const traceId = payload.traceId || 'unknown'
  console.log(`[plinth] ${event}`, { ...payload, traceId })
}

/**
 * Log a warning-level event
 */
export function logWarn(event: string, payload: Record<string, any>) {
  const traceId = payload.traceId || 'unknown'
  console.warn(`[plinth] ${event}`, { ...payload, traceId })
}

/**
 * Log an error-level event
 */
export function logError(event: string, payload: Record<string, any>) {
  const traceId = payload.traceId || 'unknown'
  console.error(`[plinth] ${event}`, { ...payload, traceId })
}

