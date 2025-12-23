/**
 * Tolerant client adapter for fetching run status
 * Degrades gracefully if endpoints are not available
 */

import type { RunStatusResponse } from './types'

export interface RunStatusStep {
  label: string
  completed: boolean
}

export interface TolerantRunStatusResponse {
  ok: true
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'unknown'
  runId?: string
  updatedAt?: string
  message?: string
  steps?: RunStatusStep[]
}

export interface TolerantRunStatusError {
  ok: false
  status: 'unknown'
  message?: string
}

export type RunStatusClientResponse =
  | TolerantRunStatusResponse
  | TolerantRunStatusError

/**
 * Fetch the latest run status for a project
 * Tolerant: returns unknown status if endpoint is not available
 */
export async function fetchLatestRunStatus(
  projectId: string,
  runId?: string
): Promise<RunStatusClientResponse> {
  // If we have a runId, try to fetch status by runId first
  if (runId) {
    try {
      const response = await fetch(`/api/runs/${runId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = (await response.json()) as RunStatusResponse
        return {
          ok: true,
          status: data.status === 'completed' ? 'succeeded' : data.status,
          runId: data.runId,
          updatedAt: data.updatedAt,
          message: data.errorMessage,
        }
      }

      // If 404, run might not exist yet - treat as queued
      if (response.status === 404) {
        return {
          ok: true,
          status: 'queued',
          runId,
          updatedAt: new Date().toISOString(),
        }
      }
    } catch (error) {
      // Network error or endpoint doesn't exist - degrade gracefully
      console.warn('Failed to fetch run status by runId:', error)
      // Continue to fallback below
    }
  }

  // Fallback: try project-specific latest run endpoint
  if (!runId) {
    try {
      const response = await fetch(`/api/projects/${projectId}/runs/latest`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = (await response.json()) as RunStatusResponse
        return {
          ok: true,
          status: data.status === 'completed' ? 'succeeded' : data.status,
          runId: data.runId,
          updatedAt: data.updatedAt,
          message: data.errorMessage,
        }
      }
    } catch (error) {
      // Endpoint doesn't exist or network error - degrade gracefully
      console.warn('Failed to fetch latest run status:', error)
    }

    return {
      ok: false,
      status: 'unknown',
      message: 'No run ID provided and latest run endpoint unavailable',
    }
  }

  // If we reach here, the endpoint exists but returned an error
  // Return unknown status to allow UI to remain stable
  return {
    ok: false,
    status: 'unknown',
    message: 'Unable to fetch run status',
  }
}

