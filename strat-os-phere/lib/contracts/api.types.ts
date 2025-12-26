import { z } from './z'
import { ErrorCodeSchema } from './errors'

/**
 * API Response Type Definitions
 */

/**
 * ApiSuccess - successful API response
 */
export interface ApiSuccess<T> {
  ok: true
  data: T
}

/**
 * ApiError - error API response
 */
export interface ApiError {
  ok: false
  error: {
    code: z.infer<typeof ErrorCodeSchema>
    message: string
    details?: Record<string, unknown>
    requestId?: string
  }
}

/**
 * ApiResponse - union of success and error responses
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError

