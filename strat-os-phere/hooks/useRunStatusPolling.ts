/**
 * Client hook for polling run status
 * Automatically stops when status is terminal or timeout is reached
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  fetchLatestRunStatus,
  type RunStatusStep,
} from '@/lib/runs/runStatusClient'

export type PollingRunStatus =
  | 'idle'
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'unknown'

export interface PollingRunData {
  status: PollingRunStatus
  runId?: string
  updatedAt?: string
  message?: string
  steps?: RunStatusStep[]
}

const DEFAULT_POLL_INTERVAL_MS = 3000 // 3 seconds
const DEFAULT_MAX_TIMEOUT_MS = 120000 // 2 minutes

interface UseRunStatusPollingOptions {
  projectId: string
  runId?: string
  pollIntervalMs?: number
  maxTimeoutMs?: number
  enabled?: boolean
}

interface UseRunStatusPollingResult {
  status: PollingRunStatus
  run: PollingRunData | null
  isPolling: boolean
  error: Error | null
  startPolling: () => void
  stopPolling: () => void
}

/**
 * Hook for polling run status
 * Automatically stops when status is terminal (succeeded/failed) or timeout is reached
 */
export function useRunStatusPolling({
  projectId,
  runId,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  maxTimeoutMs = DEFAULT_MAX_TIMEOUT_MS,
  enabled = true,
}: UseRunStatusPollingOptions): UseRunStatusPollingResult {
  const [status, setStatus] = useState<PollingRunStatus>('idle')
  const [run, setRun] = useState<PollingRunData | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const isPollingRef = useRef(false)

  const stopPolling = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    isPollingRef.current = false
    setIsPolling(false)
    startTimeRef.current = null
  }, [])

  const poll = useCallback(async () => {
    if (!isPollingRef.current) {
      return
    }

    // Check timeout
    if (startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current
      if (elapsed >= maxTimeoutMs) {
        stopPolling()
        setError(new Error('Polling timeout reached'))
        return
      }
    }

    try {
      const result = await fetchLatestRunStatus(projectId, runId)

      if (result.ok) {
        const newStatus = result.status
        setStatus(newStatus)
        setRun({
          status: newStatus,
          runId: result.runId,
          updatedAt: result.updatedAt,
          message: result.message,
          steps: result.steps,
        })
        setError(null)

        // Stop polling if status is terminal
        if (newStatus === 'succeeded' || newStatus === 'failed') {
          stopPolling()
        }
      } else {
        // Tolerant: keep existing status, just mark as unknown if we don't have one
        if (!run) {
          setStatus('unknown')
          setRun({
            status: 'unknown',
            message: result.message,
          })
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      // Don't stop polling on error - might be temporary network issue
      // But do mark as unknown if we don't have a status yet
      if (!run) {
        setStatus('unknown')
        setRun({
          status: 'unknown',
          message: error.message,
        })
      }
    }
  }, [projectId, runId, maxTimeoutMs, stopPolling, run])

  const startPolling = useCallback(() => {
    if (isPollingRef.current) {
      return
    }

    // Reset state
    setError(null)
    setIsPolling(true)
    isPollingRef.current = true
    startTimeRef.current = Date.now()

    // Set timeout
    timeoutRef.current = setTimeout(() => {
      stopPolling()
      setError(new Error('Polling timeout reached'))
    }, maxTimeoutMs)

    // Start polling immediately
    poll()

    // Set up interval
    intervalRef.current = setInterval(() => {
      poll()
    }, pollIntervalMs)
  }, [pollIntervalMs, maxTimeoutMs, poll, stopPolling])

  // Auto-start if enabled and runId is provided
  useEffect(() => {
    if (enabled && runId && !isPolling) {
      startPolling()
    }

    return () => {
      stopPolling()
    }
  }, [enabled, runId, isPolling, startPolling, stopPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  return {
    status,
    run,
    isPolling,
    error,
    startPolling,
    stopPolling,
  }
}

