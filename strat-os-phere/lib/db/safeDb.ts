/**
 * Safe database helpers for graceful error handling of schema drift.
 * 
 * These utilities detect and handle "missing column" errors from PostgREST
 * to prevent hard crashes when the code references columns that don't exist
 * in the deployed database schema.
 */

/**
 * Checks if an error is a "column does not exist" error from PostgREST.
 */
export function isMissingColumnError(e: unknown): boolean {
  if (!e || typeof e !== 'object') {
    return false
  }

  const message = 'message' in e ? String((e as any).message) : ''
  const code = 'code' in e ? String((e as any).code) : ''

  // PostgREST error patterns
  const messagePattern = /column.*does not exist/i
  const codePattern = /PGRST\d+/ // PostgREST error codes

  return (
    (typeof message === 'string' && messagePattern.test(message)) ||
    (typeof code === 'string' && codePattern.test(code) && messagePattern.test(message))
  )
}

/**
 * Formats a database error into a user-friendly message.
 */
export function formatDbError(e: unknown): string {
  if (typeof e === 'object' && e && 'message' in e) {
    return String((e as any).message)
  }
  return 'Unknown database error'
}

