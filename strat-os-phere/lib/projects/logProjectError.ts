/**
 * Helper to log project-related errors with consistent format.
 * Includes route, projectId, and Supabase error details.
 */

interface SupabaseError {
  message?: string
  code?: string
  details?: string
  hint?: string
}

interface LogProjectErrorOptions {
  route: string
  projectId?: string
  queryName: string
  error: unknown
  digest?: string
}

/**
 * Logs a project error with all relevant context for debugging.
 * Always logs errors (even in production) as they indicate real issues.
 */
export function logProjectError({
  route,
  projectId,
  queryName,
  error,
  digest,
}: LogProjectErrorOptions): void {
  const errorObj = error as SupabaseError | Error
  const message = errorObj?.message || String(error)
  const code = 'code' in errorObj ? errorObj.code : undefined
  const details = 'details' in errorObj ? errorObj.details : undefined
  const hint = 'hint' in errorObj ? errorObj.hint : undefined

  const logData: Record<string, unknown> = {
    route,
    queryName,
    error: message,
    timestamp: new Date().toISOString(),
  }

  if (projectId) {
    logData.projectId = projectId
  }

  if (code) {
    logData.code = code
  }

  if (details) {
    logData.details = details
  }

  if (hint) {
    logData.hint = hint
  }

  if (digest) {
    logData.digest = digest
  }

  // Always log errors - they're important for debugging production issues
  console.error(`[PROJECT_ERROR] ${queryName} failed on ${route}`, logData)
}

