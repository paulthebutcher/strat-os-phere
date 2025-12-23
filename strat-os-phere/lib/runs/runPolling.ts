/**
 * Polling utilities for checking run status
 */

import type { RunStatusResponse } from './types'

const POLL_INTERVAL_MS = 4000 // Poll every 4 seconds

/**
 * Poll a single run's status
 */
export async function pollRunStatus(
  runId: string
): Promise<RunStatusResponse> {
  const response = await fetch(`/api/runs/${runId}/status`)
  
  if (!response.ok) {
    // If 404, run might not exist yet - treat as queued
    if (response.status === 404) {
      return {
        runId,
        status: 'queued',
        updatedAt: new Date().toISOString(),
      }
    }
    
    throw new Error(`Failed to fetch status: ${response.statusText}`)
  }

  const data = await response.json() as RunStatusResponse
  return data
}

/**
 * Get the poll interval in milliseconds
 */
export function getPollInterval(): number {
  return POLL_INTERVAL_MS
}

