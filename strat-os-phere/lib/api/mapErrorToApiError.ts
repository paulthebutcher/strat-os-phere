/**
 * Centralized Error Mapping to API Error Responses
 * 
 * Maps various error types (AppError, Zod errors, generic errors) to canonical
 * ApiError responses with requestId for debugging.
 */

import { z } from 'zod'
import type { AppError } from '@/lib/errors/errors'
import { toAppError, SchemaMismatchError, UnauthorizedError } from '@/lib/errors/errors'
import { appErrorToCode, errorCodeToStatus, type ErrorCode } from '@/lib/contracts/errors'
import { fail } from '@/lib/contracts/api'
import type { ApiError } from '@/lib/contracts/api.types'
import { logger } from '@/lib/logger'

/**
 * Map any error to an ApiError response
 * Includes requestId for debugging and uses canonical error codes
 */
export function mapErrorToApiError(
  error: unknown,
  requestId: string,
  context?: Record<string, unknown>
): {
  code: ErrorCode
  message: string
  details?: Record<string, unknown>
  statusCode: number
} {
  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    logger.warn('[mapErrorToApiError] Zod validation error', {
      requestId,
      errors: error.errors,
    })
    return {
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: {
        errors: error.errors,
        ...context,
      },
      statusCode: 400,
    }
  }

  // Convert to AppError if needed
  const appError = toAppError(error, context)

  // Map AppError to ErrorCode
  const code = appErrorToCode(appError)
  const statusCode = errorCodeToStatus(code)

  // Log with requestId
  logger.warn('[mapErrorToApiError] Error mapped', {
    requestId,
    code,
    appErrorCode: appError.code,
    message: appError.message,
    context,
  })

  return {
    code,
    message: appError.userMessage,
    details: {
      ...appError.details,
      ...context,
    },
    statusCode,
  }
}

/**
 * Map error to ApiError response envelope (for NextResponse.json)
 */
export function mapErrorToApiResponse(
  error: unknown,
  requestId: string,
  context?: Record<string, unknown>
): {
  response: ApiError
  statusCode: number
} {
  const mapped = mapErrorToApiError(error, requestId, context)

  return {
    response: fail(mapped.code, mapped.message, mapped.details, requestId),
    statusCode: mapped.statusCode,
  }
}

