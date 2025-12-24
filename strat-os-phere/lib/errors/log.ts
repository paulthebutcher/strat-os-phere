/**
 * Structured error logging helper
 * 
 * Provides consistent, structured logging for application errors
 * to aid debugging and monitoring.
 */

import type { AppError } from './errors'
import { isAppError } from './errors'
import { logger } from '@/lib/logger'

export interface ErrorLogContext {
  scope: string
  [key: string]: unknown
}

/**
 * Log an application error with structured output.
 * 
 * @param scope - The scope/context where the error occurred (e.g., "dashboard.loadProjects")
 * @param err - The error to log (will be converted to AppError if needed)
 * @param context - Additional context to include in logs
 */
export function logAppError(
  scope: string,
  err: unknown,
  context?: Record<string, unknown>
): void {
  const appError: AppError = isAppError(err) ? err : {
    code: 'UNKNOWN',
    message: err instanceof Error ? err.message : String(err),
    userMessage: 'Something went wrong.',
    isRetryable: true,
    cause: err,
  }

  const logData = {
    scope,
    code: appError.code,
    isRetryable: appError.isRetryable,
    message: appError.message,
    userMessage: appError.userMessage,
    ...(appError.details && { details: appError.details }),
    ...(context && { context }),
  }

  // Use logger.error which always logs errors
  logger.error(`[${scope}] ${appError.code}: ${appError.message}`, logData)

  // In development, also log the full error for stack traces
  if (process.env.NODE_ENV !== 'production' && appError.cause) {
    console.error('Error cause:', appError.cause)
  }
}

