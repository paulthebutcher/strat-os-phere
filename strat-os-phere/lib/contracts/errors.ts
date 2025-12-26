import { z } from './z'
import type { AppError } from '@/lib/errors/errors'
import {
  NotReadyError,
  SchemaMismatchError,
  UnauthorizedError,
  NotFoundError,
  ExternalFetchError,
  AnalysisFailedError,
  UnknownAppError,
} from '@/lib/errors/errors'

/**
 * Error Codes - Stable error code taxonomy
 * 
 * Maps to existing AppError types where possible.
 * Used in API responses for consistent error handling.
 */

export const ErrorCodeSchema = z.enum([
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION_ERROR',
  'SCHEMA_MISMATCH',
  'NOT_READY',
  'UPSTREAM_TIMEOUT',
  'UPSTREAM_RATE_LIMIT',
  'INTERNAL_ERROR',
])

export type ErrorCode = z.infer<typeof ErrorCodeSchema>

/**
 * Map AppError to ErrorCode
 * Thin adapter to bridge existing error system with contracts
 */
export function appErrorToCode(error: AppError): ErrorCode {
  if (error instanceof UnauthorizedError) {
    return 'UNAUTHENTICATED'
  }
  if (error instanceof NotFoundError) {
    return 'NOT_FOUND'
  }
  if (error instanceof SchemaMismatchError) {
    return 'SCHEMA_MISMATCH'
  }
  if (error instanceof NotReadyError) {
    return 'NOT_READY'
  }
  if (error instanceof ExternalFetchError) {
    // Check if it's a timeout/rate limit
    const message = error.message.toLowerCase()
    if (message.includes('timeout')) {
      return 'UPSTREAM_TIMEOUT'
    }
    if (message.includes('rate limit') || message.includes('rate_limit')) {
      return 'UPSTREAM_RATE_LIMIT'
    }
    return 'UPSTREAM_TIMEOUT' // Default for external fetch errors
  }
  if (error instanceof AnalysisFailedError) {
    return 'INTERNAL_ERROR' // Analysis failures are internal errors
  }
  
  // Default to INTERNAL_ERROR for unknown errors
  return 'INTERNAL_ERROR'
}

/**
 * Map ErrorCode to HTTP status code
 */
export function errorCodeToStatus(code: ErrorCode): number {
  switch (code) {
    case 'UNAUTHENTICATED':
      return 401
    case 'FORBIDDEN':
      return 403
    case 'NOT_FOUND':
      return 404
    case 'VALIDATION_ERROR':
    case 'SCHEMA_MISMATCH':
      return 400
    case 'NOT_READY':
      return 422
    case 'UPSTREAM_TIMEOUT':
    case 'UPSTREAM_RATE_LIMIT':
      return 504
    case 'INTERNAL_ERROR':
    default:
      return 500
  }
}

