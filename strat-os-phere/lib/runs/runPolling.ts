/**
 * Polling utilities for checking run status
 */

import type { RunStatusResponse } from './types'
import { fetchApi, ApiError } from '@/lib/api/fetchApi'

const POLL_INTERVAL_MS = 4000 // Poll every 4 seconds

/**
 * Poll a single run's status
 * Returns queued status if run doesn't exist yet (graceful fallback)
 */
export async function pollRunStatus(
  runId: string
): Promise<RunStatusResponse> {
  try {
    return await fetchApi<RunStatusResponse>(`/api/runs/${runId}/status`)
  } catch (error) {
    // Gracefully handle errors for polling - return queued status
    if (error instanceof ApiError) {
      // If run not found or access denied, treat as queued (might be transient)
      if (error.code === 'NOT_FOUND' || error.code === 'FORBIDDEN' || error.code === 'UNAUTHENTICATED') {
        return {
          runId,
          status: 'queued',
          updatedAt: new Date().toISOString(),
        }
      }
    }
    
    // For other errors, also fallback to queued (transient network issues)
    return {
      runId,
      status: 'queued',
      updatedAt: new Date().toISOString(),
    }
  }
}

/**
 * Get the poll interval in milliseconds
 */
export function getPollInterval(): number {
  return POLL_INTERVAL_MS
}

