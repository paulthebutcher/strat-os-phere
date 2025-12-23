/**
 * Server-side error logging utility.
 * 
 * Logs errors with context without leaking secrets.
 */

type ErrorContext = Record<string, unknown>

/**
 * Log a server error with scope and context.
 * Does not leak secrets (filters out sensitive fields).
 */
export function logServerError(
  scope: string,
  error: unknown,
  context: ErrorContext = {}
): void {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined
  
  // Filter out potentially sensitive fields
  const safeContext = { ...context }
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'cookie']
  for (const key of Object.keys(safeContext)) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      safeContext[key] = '[REDACTED]'
    }
  }
  
  // Log to console (in production, this would go to a logging service)
  console.error(`[${scope}] Error:`, {
    message: errorMessage,
    stack: errorStack,
    context: safeContext,
    timestamp: new Date().toISOString(),
  })
}

