/**
 * Result type for operations that can succeed or fail with structured errors
 * Always includes a traceId for observability
 */

export type Result<T> =
  | { ok: true; data: T; traceId: string }
  | { ok: false; error: { code: string; message: string; details?: any }; traceId: string }

/**
 * Generate a unique trace ID for request tracking
 */
export function makeTraceId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Create a successful result
 */
export function ok<T>(data: T, traceId: string): Result<T> {
  return { ok: true, data, traceId }
}

/**
 * Create a failed result
 */
export function fail<T = never>(
  code: string,
  message: string,
  traceId: string,
  details?: any
): Result<T> {
  return {
    ok: false,
    error: { code, message, details },
    traceId,
  }
}

