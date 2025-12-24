/**
 * Application error taxonomy - unified error types for consistent handling
 * 
 * This module provides a small set of typed errors that cover 90% of failures,
 * with standardized mapping from common error patterns to user-friendly states.
 */

export type ErrorAction = {
  label: string
  href: string
}

export interface AppError {
  code: string
  message: string // Developer message
  userMessage: string // Calm UI copy for users
  action?: ErrorAction
  details?: Record<string, unknown>
  isRetryable: boolean
  cause?: unknown
}

/**
 * NotReadyError - insufficient evidence / prerequisites not met
 */
export class NotReadyError extends Error implements AppError {
  code = 'NOT_READY'
  userMessage: string
  action?: ErrorAction
  details?: Record<string, unknown>
  isRetryable = false
  cause?: unknown

  constructor(
    message: string,
    options?: {
      userMessage?: string
      action?: ErrorAction
      details?: Record<string, unknown>
      cause?: unknown
    }
  ) {
    super(message)
    this.name = 'NotReadyError'
    this.userMessage = options?.userMessage || 'Not enough evidence to generate a credible analysis.'
    this.action = options?.action
    this.details = options?.details
    this.cause = options?.cause
  }
}

/**
 * SchemaMismatchError - missing column / app ahead of DB
 */
export class SchemaMismatchError extends Error implements AppError {
  code = 'SCHEMA_MISMATCH'
  userMessage: string
  action?: ErrorAction
  details?: Record<string, unknown>
  isRetryable = false
  cause?: unknown

  constructor(
    message: string,
    options?: {
      userMessage?: string
      action?: ErrorAction
      details?: Record<string, unknown>
      cause?: unknown
    }
  ) {
    super(message)
    this.name = 'SchemaMismatchError'
    this.userMessage = options?.userMessage || 'The app is ahead of the database schema. Run migrations or switch to safe selects.'
    this.action = options?.action
    this.details = options?.details
    this.cause = options?.cause
  }
}

/**
 * UnauthorizedError - no user / wrong owner
 */
export class UnauthorizedError extends Error implements AppError {
  code = 'UNAUTHORIZED'
  userMessage: string
  action?: ErrorAction
  details?: Record<string, unknown>
  isRetryable = false
  cause?: unknown

  constructor(
    message: string,
    options?: {
      userMessage?: string
      action?: ErrorAction
      details?: Record<string, unknown>
      cause?: unknown
    }
  ) {
    super(message)
    this.name = 'UnauthorizedError'
    this.userMessage = options?.userMessage || 'You need to sign in to access this page.'
    this.action = options?.action || { label: 'Sign in', href: '/login' }
    this.details = options?.details
    this.cause = options?.cause
  }
}

/**
 * NotFoundError - missing project/resource
 */
export class NotFoundError extends Error implements AppError {
  code = 'NOT_FOUND'
  userMessage: string
  action?: ErrorAction
  details?: Record<string, unknown>
  isRetryable = false
  cause?: unknown

  constructor(
    message: string,
    options?: {
      userMessage?: string
      action?: ErrorAction
      details?: Record<string, unknown>
      cause?: unknown
    }
  ) {
    super(message)
    this.name = 'NotFoundError'
    this.userMessage = options?.userMessage || 'The requested resource was not found.'
    this.action = options?.action || { label: 'Back to Projects', href: '/dashboard' }
    this.details = options?.details
    this.cause = options?.cause
  }
}

/**
 * ExternalFetchError - Tavily or web fetch failed
 */
export class ExternalFetchError extends Error implements AppError {
  code = 'EXTERNAL_FETCH'
  userMessage: string
  action?: ErrorAction
  details?: Record<string, unknown>
  isRetryable = true
  cause?: unknown

  constructor(
    message: string,
    options?: {
      userMessage?: string
      action?: ErrorAction
      details?: Record<string, unknown>
      cause?: unknown
    }
  ) {
    super(message)
    this.name = 'ExternalFetchError'
    this.userMessage = options?.userMessage || 'Failed to fetch external data. This may be a temporary issue.'
    this.action = options?.action
    this.details = options?.details
    this.cause = options?.cause
  }
}

/**
 * AnalysisFailedError - LLM pipeline failure
 */
export class AnalysisFailedError extends Error implements AppError {
  code = 'ANALYSIS_FAILED'
  userMessage: string
  action?: ErrorAction
  details?: Record<string, unknown>
  isRetryable = true
  cause?: unknown

  constructor(
    message: string,
    options?: {
      userMessage?: string
      action?: ErrorAction
      details?: Record<string, unknown>
      cause?: unknown
    }
  ) {
    super(message)
    this.name = 'AnalysisFailedError'
    this.userMessage = options?.userMessage || 'Analysis generation failed. Please try again.'
    this.action = options?.action
    this.details = options?.details
    this.cause = options?.cause
  }
}

/**
 * UnknownAppError - catch-all for unexpected errors
 */
export class UnknownAppError extends Error implements AppError {
  code = 'UNKNOWN'
  userMessage: string
  action?: ErrorAction
  details?: Record<string, unknown>
  isRetryable = true
  cause?: unknown

  constructor(
    message: string,
    options?: {
      userMessage?: string
      action?: ErrorAction
      details?: Record<string, unknown>
      cause?: unknown
    }
  ) {
    super(message)
    this.name = 'UnknownAppError'
    this.userMessage = options?.userMessage || 'Something went wrong. Please try again.'
    this.action = options?.action
    this.details = options?.details
    this.cause = options?.cause
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    error instanceof NotReadyError ||
    error instanceof SchemaMismatchError ||
    error instanceof UnauthorizedError ||
    error instanceof NotFoundError ||
    error instanceof ExternalFetchError ||
    error instanceof AnalysisFailedError ||
    error instanceof UnknownAppError
  )
}

/**
 * Converts an unknown error to an AppError.
 * 
 * Detects common error patterns and maps them to appropriate error types:
 * - Supabase missing-column patterns → SchemaMismatchError
 * - Auth missing user → UnauthorizedError
 * - Network/timeouts → ExternalFetchError
 * - Default → UnknownAppError
 */
export function toAppError(e: unknown, context?: Record<string, unknown>): AppError {
  // If already an AppError, return as-is
  if (isAppError(e)) {
    return e
  }

  const error = e as any
  const message = error?.message ?? String(error ?? 'Unknown error')
  const lowerMessage = typeof message === 'string' ? message.toLowerCase() : ''

  // Detect Supabase missing-column patterns
  if (
    typeof message === 'string' &&
    (lowerMessage.includes('does not exist') ||
      lowerMessage.includes('column') ||
      lowerMessage.includes('missing column') ||
      error?.code?.startsWith('PGRST'))
  ) {
    return new SchemaMismatchError(
      `Schema mismatch: ${message}`,
      {
        details: context,
        cause: e,
      }
    )
  }

  // Detect auth errors (missing user)
  if (
    error?.code === 'UNAUTHENTICATED' ||
    lowerMessage.includes('authentication') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('user not found') ||
    lowerMessage.includes('not authenticated')
  ) {
    return new UnauthorizedError(
      `Authentication error: ${message}`,
      {
        details: context,
        cause: e,
      }
    )
  }

  // Detect network/timeout errors
  if (
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ETIMEDOUT' ||
    error?.code === 'ENOTFOUND' ||
    lowerMessage.includes('network') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('fetch failed') ||
    lowerMessage.includes('connection') ||
    error instanceof TypeError && message.includes('fetch')
  ) {
    return new ExternalFetchError(
      `External fetch failed: ${message}`,
      {
        details: context,
        cause: e,
      }
    )
  }

  // Default to UnknownAppError
  return new UnknownAppError(
    `Unexpected error: ${message}`,
    {
      details: context,
      cause: e,
    }
  )
}

