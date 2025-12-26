'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { paths } from '@/lib/routes'

interface AnalysisRunToastProps {
  projectId: string
  runId: string
  resultsUrl: string
  onDismiss: () => void
}

type RunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'unknown'

interface RunStatusResponse {
  status: RunStatus
  progress?: number
  updatedAt?: string
}

const ROTATING_STATUSES = [
  'Collecting sources…',
  'Reading pricing pages…',
  'Scanning docs & changelogs…',
  'Comparing competitors…',
  'Synthesizing opportunities…',
  'Finalizing…',
]

const POLL_INTERVAL_MS = 3000 // Poll every 3 seconds
const PROGRESS_INCREASE_INTERVAL_MS = 12000 // Increase local progress every 12 seconds
const STATUS_ROTATE_INTERVAL_MS = 10000 // Rotate status every 10 seconds

export function AnalysisRunToast({
  projectId,
  runId,
  resultsUrl,
  onDismiss,
}: AnalysisRunToastProps) {
  const router = useRouter()
  const [status, setStatus] = useState<RunStatus>('unknown')
  const [reportedProgress, setReportedProgress] = useState<number | null>(null)
  const [localProgress, setLocalProgress] = useState(5)
  const [currentStatusMessage, setCurrentStatusMessage] = useState(ROTATING_STATUSES[0])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const statusMessageIndexRef = useRef(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const statusRotateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate effective progress
  const effectiveProgress = Math.min(
    90,
    Math.max(localProgress, reportedProgress ?? 0)
  )

  // Poll for run status
  const pollStatus = useCallback(async () => {
    try {
      const { fetchApi } = await import('@/lib/api/fetchApi')
      const data = await fetchApi<RunStatusResponse>(`/api/runs/${runId}/status`)
      
      setStatus(data.status)
      
      if (data.progress !== undefined) {
        setReportedProgress(data.progress)
      }

      // If completed, animate to 100% and auto-dismiss
      if (data.status === 'completed') {
        setLocalProgress(100)
        setTimeout(() => {
          onDismiss()
        }, 2000)
        return
      }

      // If failed, stop polling
      if (data.status === 'failed') {
        // Try to get error message from response if available
        return
      }

      // Continue polling if still running/queued
      if (data.status === 'running' || data.status === 'queued') {
        pollTimeoutRef.current = setTimeout(pollStatus, POLL_INTERVAL_MS)
      }
    } catch (error) {
      console.error('Error polling run status:', error)
      // Continue polling on error (might be transient) - keep current status
      // Status polling should be resilient to transient errors
      pollTimeoutRef.current = setTimeout(pollStatus, POLL_INTERVAL_MS)
    }
  }, [runId, onDismiss])

  // Start local progress increase
  useEffect(() => {
    if (status === 'completed' || status === 'failed') {
      return
    }

    progressIntervalRef.current = setInterval(() => {
      setLocalProgress((prev) => {
        // Increase by 1% every 12s, cap at 85%
        const next = Math.min(85, prev + 1)
        return next
      })
    }, PROGRESS_INCREASE_INTERVAL_MS)

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [status])

  // Rotate status messages
  useEffect(() => {
    if (status === 'completed' || status === 'failed') {
      return
    }

    statusRotateIntervalRef.current = setInterval(() => {
      statusMessageIndexRef.current =
        (statusMessageIndexRef.current + 1) % ROTATING_STATUSES.length
      setCurrentStatusMessage(
        ROTATING_STATUSES[statusMessageIndexRef.current]
      )
    }, STATUS_ROTATE_INTERVAL_MS)

    return () => {
      if (statusRotateIntervalRef.current) {
        clearInterval(statusRotateIntervalRef.current)
      }
    }
  }, [status])

  // Start polling on mount
  useEffect(() => {
    pollStatus()

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current)
      }
    }
  }, [pollStatus])

  // Handle retry
  const handleRetry = useCallback(async () => {
    setIsRetrying(true)
    try {
      const { fetchApi } = await import('@/lib/api/fetchApi')
      const result = await fetchApi<{ runId: string }>(
        `/api/projects/${projectId}/generate`,
        { method: 'POST' }
      )

      if (result.runId) {
        // Navigate to results and update toast
        router.push(`${paths.decision(projectId)}?runId=${result.runId}`)
        // Toast will be updated by the button that triggered this
        onDismiss()
      } else {
        setErrorMessage('Failed to start analysis')
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to start analysis'
      )
    } finally {
      setIsRetrying(false)
    }
  }, [projectId, router, onDismiss])

  const handleViewResults = useCallback(() => {
    router.push(resultsUrl)
  }, [router, resultsUrl])

  const displayProgress = status === 'completed' ? 100 : effectiveProgress
  const isCompleted = status === 'completed'
  const isFailed = status === 'failed'

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md animate-in slide-in-from-bottom-5">
      <div className="rounded-lg border border-border bg-background shadow-lg">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Analysis running
              </h3>
              <p className="text-xs text-muted-foreground">
                {isFailed
                  ? errorMessage || 'Analysis failed. Please try again.'
                  : isCompleted
                    ? 'Analysis complete!'
                    : 'This may take a few minutes. You can keep browsing.'}
              </p>
            </div>
            {!isCompleted && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Status message */}
          {!isFailed && !isCompleted && (
            <div className="text-xs text-muted-foreground mb-3">
              {currentStatusMessage}
            </div>
          )}

          {/* Progress bar */}
          {!isFailed && (
            <div className="mb-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${displayProgress}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground text-right">
                {displayProgress}%
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isFailed ? (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Starting…
                    </>
                  ) : (
                    'Retry'
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={onDismiss}>
                  Dismiss
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewResults}
                >
                  View results
                </Button>
                {!isCompleted && (
                  <Button variant="ghost" size="sm" onClick={onDismiss}>
                    Dismiss
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

