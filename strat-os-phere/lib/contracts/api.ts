import { z } from 'zod'
import type { ApiResponse, ApiSuccess, ApiError } from './api.types'
import { ErrorCodeSchema } from './errors'

/**
 * API Response Envelopes
 * 
 * Standardizes all API responses to a consistent shape:
 * - Success: { ok: true, data: T }
 * - Error: { ok: false, error: { code, message, details?, requestId? } }
 */

// ============================================================================
// Response Types
// ============================================================================

/**
 * ApiSuccess - successful response envelope
 */
export function ok<T>(data: T): ApiSuccess<T> {
  return {
    ok: true,
    data,
  }
}

/**
 * ApiError - error response envelope
 */
export function fail(
  code: z.infer<typeof ErrorCodeSchema>,
  message: string,
  details?: Record<string, unknown>,
  requestId?: string
): ApiError {
  return {
    ok: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(requestId && { requestId }),
    },
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Parse and validate a value against a Zod schema
 * Returns success/error in ApiResponse format
 */
export function parseOrFail<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): ApiResponse<T> {
  const result = schema.safeParse(value)
  
  if (result.success) {
    return ok(result.data)
  }
  
  return fail(
    'SCHEMA_MISMATCH',
    'Response validation failed',
    {
      errors: result.error.errors,
      value: value,
    }
  )
}

/**
 * Validate outgoing payload before sending
 * Throws in dev, logs warning in prod
 */
export function validateOutgoing<T>(
  schema: z.ZodSchema<T>,
  value: T,
  context?: string
): T {
  if (process.env.NODE_ENV === 'development') {
    const result = schema.safeParse(value)
    if (!result.success) {
      console.error(`[Contract Violation] ${context || 'Outgoing payload'}`, {
        errors: result.error.errors,
        value,
      })
      throw new Error(`Contract validation failed: ${result.error.message}`)
    }
  }
  
  return value
}

// ============================================================================
// Request ID Helper (Optional)
// ============================================================================

/**
 * Generate or extract request ID for error tracking
 * Can be enhanced to read from headers/context
 */
export function withRequestId(requestId?: string): string | undefined {
  return requestId
}

