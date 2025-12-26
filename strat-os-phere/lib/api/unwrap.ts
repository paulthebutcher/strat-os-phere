/**
 * API Response Unwrapping
 * 
 * Helper functions to unwrap ApiResponse<T> from contract-enabled endpoints.
 * Use these when calling endpoints that return ApiResponse envelopes.
 */

import type { ApiResponse } from '@/lib/contracts/api.types'

/**
 * Unwrap an ApiResponse, throwing on error
 * 
 * @throws Error if response is not ok
 */
export async function unwrapApiResponse<T>(
  response: Response
): Promise<T> {
  const data = await response.json() as ApiResponse<T>
  
  if (!data.ok) {
    const error = new Error(data.error.message)
    ;(error as any).code = data.error.code
    ;(error as any).details = data.error.details
    throw error
  }
  
  return data.data
}

/**
 * Unwrap an ApiResponse, returning null on error (graceful)
 * 
 * Returns null if response is not ok (logs error to console)
 */
export async function unwrapApiResponseOrNull<T>(
  response: Response
): Promise<T | null> {
  try {
    return await unwrapApiResponse<T>(response)
  } catch (error) {
    console.error('[unwrapApiResponseOrNull]', error)
    return null
  }
}

/**
 * Check if a response is an ApiResponse error
 */
export function isApiError(
  data: unknown
): data is { ok: false; error: { code: string; message: string; details?: Record<string, unknown> } } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'ok' in data &&
    data.ok === false &&
    'error' in data
  )
}

