/**
 * Safe query helpers for graceful error handling of database schema drift.
 * 
 * These utilities detect and handle "missing column" errors from PostgREST
 * to prevent hard crashes when the code references columns that don't exist
 * in the deployed database schema.
 */

import { isMissingColumnError, formatDbError } from './safeDb'

// Re-export for backward compatibility
export { isMissingColumnError, formatDbError }

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

