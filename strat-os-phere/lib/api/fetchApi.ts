/**
 * Client-side API fetching with automatic ApiResponse unwrapping
 * 
 * Provides a typed, safe way to call API endpoints that return ApiResponse<T>.
 * Automatically unwraps responses and throws typed errors with code + requestId.
 */

'use client'

import type { ApiResponse } from '@/lib/contracts/api.types'

/**
 * Typed error thrown when API returns ok: false
 */
export class ApiError extends Error {
  code: string
  requestId?: string
  details?: Record<string, unknown>

  constructor(
    code: string,
    message: string,
    requestId?: string,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.requestId = requestId
    this.details = details
  }
}

/**
 * Fetch an API endpoint and unwrap the ApiResponse
 * 
 * @param url - API endpoint URL
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns The data payload if ok: true, throws ApiError if ok: false
 * @throws ApiError if response is not ok
 */
export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  // Parse JSON response
  let data: ApiResponse<T>
  try {
    data = await response.json() as ApiResponse<T>
  } catch (parseError) {
    // If JSON parsing fails, treat as internal error
    throw new ApiError(
      'INTERNAL_ERROR',
      `Failed to parse response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      undefined,
      { status: response.status, statusText: response.statusText }
    )
  }

  // Check if response is ok
  if (!data.ok) {
    throw new ApiError(
      data.error.code,
      data.error.message,
      data.error.requestId,
      data.error.details
    )
  }

  return data.data
}

