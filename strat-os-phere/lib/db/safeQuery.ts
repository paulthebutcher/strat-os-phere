/**
 * Safe query helpers for graceful error handling of database schema drift.
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

/**
 * Result type for safe query operations.
 */
export type SafeQueryResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; isSchemaDrift: boolean }

/**
 * Wraps a database query with error handling for schema drift.
 * 
 * @param queryName - Name of the query for logging (e.g., "getProjectById")
 * @param route - Route path where the query is executed (e.g., "/projects/[id]/overview")
 * @param queryFn - The async function that executes the query
 * @returns A SafeQueryResult with success/error information
 */
export async function safeQuery<T>(
  queryName: string,
  route: string,
  queryFn: () => Promise<T>
): Promise<SafeQueryResult<T>> {
  try {
    const data = await queryFn()
    return { success: true, data }
  } catch (error) {
    const isSchemaDrift = isMissingColumnError(error)
    const errorMessage = formatDbError(error)

    // Log high-signal error for monitoring
    if (isSchemaDrift) {
      console.error(
        `[SCHEMA_DRIFT] ${queryName} failed on ${route}: ${errorMessage}`,
        {
          queryName,
          route,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        }
      )
    } else {
      console.error(
        `[DB_ERROR] ${queryName} failed on ${route}: ${errorMessage}`,
        {
          queryName,
          route,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        }
      )
    }

    return {
      success: false,
      error: errorMessage,
      isSchemaDrift,
    }
  }
}

