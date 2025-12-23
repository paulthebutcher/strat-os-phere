'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getActiveRuns,
  updateActiveRunStatus,
  removeActiveRun,
  addActiveRun,
  isRunActive,
} from '@/lib/runs/runToastStore'
import { pollRunStatus, getPollInterval } from '@/lib/runs/runPolling'
import type { ActiveRun, RunStatus, RunStatusResponse } from '@/lib/runs/types'
import { startEvidenceRun } from '@/lib/runs/startEvidenceRun'

interface RunToastData extends ActiveRun {
  status: RunStatus
  progress?: {
    step?: string
    completed?: number
    total?: number
  }
  errorMessage?: string
  isRetrying?: boolean
}

const COMPLETED_DISMISS_MS = 60000 // 60 seconds
const STATUS_MESSAGES: Record<RunStatus, string> = {
  queued: 'Queued…',
  running: 'Collecting evidence…',
  completed: 'Evidence ready',
  failed: 'Evidence collection failed',
}

/**
 * Global component that manages all active run toasts
 * Persists across navigation via localStorage
 */
export function RunToasts() {
  const router = useRouter()
  const [runs, setRuns] = useState<RunToastData[]>([])
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const completedTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Load active runs from localStorage on mount
  useEffect(() => {
    const activeRuns = getActiveRuns()
    const initialRuns: RunToastData[] = activeRuns.map((run) => ({
      ...run,
      status: run.lastSeenStatus || 'queued',
    }))
    setRuns(initialRuns)
  }, [])

  // Poll all active runs
  const pollRuns = useCallback(async () => {
    const activeRuns = getActiveRuns()
    if (activeRuns.length === 0) {
      setRuns([])
      return
    }

    const updatedRuns: RunToastData[] = []

    for (const run of activeRuns) {
      try {
        const statusData = await pollRunStatus(run.runId)
        updateActiveRunStatus(run.runId, statusData.status)

        updatedRuns.push({
          ...run,
          status: statusData.status,
          progress: statusData.progress,
          errorMessage: statusData.errorMessage,
        })

        // Handle completed runs - auto-dismiss after delay
        if (statusData.status === 'completed') {
          // Clear any existing timeout for this run
          const existingTimeout = completedTimeoutsRef.current.get(run.runId)
          if (existingTimeout) {
            clearTimeout(existingTimeout)
          }

          // Set new timeout to remove after delay
          const timeout = setTimeout(() => {
            removeActiveRun(run.runId)
            setRuns((prev) => prev.filter((r) => r.runId !== run.runId))
            completedTimeoutsRef.current.delete(run.runId)
          }, COMPLETED_DISMISS_MS)

          completedTimeoutsRef.current.set(run.runId, timeout)
        }

        // Remove failed runs from active tracking (but keep toast until dismissed)
        if (statusData.status === 'failed') {
          removeActiveRun(run.runId)
        }
      } catch (error) {
        console.error(`Error polling run ${run.runId}:`, error)
        // Keep the run in the list with its last known status
        updatedRuns.push({
          ...run,
          status: run.lastSeenStatus || 'queued',
        })
      }
    }

    setRuns(updatedRuns)

    // Continue polling if there are any active runs
    const hasActiveRuns = updatedRuns.some((run) => isRunActive(run.status))
    if (hasActiveRuns) {
      pollTimeoutRef.current = setTimeout(pollRuns, getPollInterval())
    }
  }, [])

  // Start polling when there are active runs
  useEffect(() => {
    const activeRuns = getActiveRuns()
    if (activeRuns.length === 0) {
      return
    }

    // Start polling immediately
    pollRuns()

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current)
      }
    }
  }, [pollRuns])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      completedTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      completedTimeoutsRef.current.clear()
    }
  }, [])

  const handleDismiss = useCallback((runId: string) => {
    removeActiveRun(runId)
    setRuns((prev) => prev.filter((r) => r.runId !== runId))
    const timeout = completedTimeoutsRef.current.get(runId)
    if (timeout) {
      clearTimeout(timeout)
      completedTimeoutsRef.current.delete(runId)
    }
  }, [])

  const handleViewResults = useCallback(
    (projectId: string, runId: string) => {
      router.push(`/projects/${projectId}/results?runId=${runId}`)
    },
    [router]
  )

  const handleRetry = useCallback(
    async (run: RunToastData) => {
      if (!run.projectId) {
        return
      }

      setRuns((prev) =>
        prev.map((r) =>
          r.runId === run.runId ? { ...r, isRetrying: true } : r
        )
      )

      try {
        const result = await startEvidenceRun({
          analysisId: run.projectId,
        })

        if (result.ok) {
          // Remove old run and add new one
          removeActiveRun(run.runId)
          handleDismiss(run.runId)

          // Add the new run to tracking
          addActiveRun({
            runId: result.runId,
            projectId: run.projectId,
            analysisId: run.analysisId,
            createdAt: new Date().toISOString(),
          })

          // Trigger a poll to update the UI
          setTimeout(() => {
            pollRuns()
          }, 500)
        } else {
          setRuns((prev) =>
            prev.map((r) =>
              r.runId === run.runId
                ? {
                    ...r,
                    isRetrying: false,
                    errorMessage: result.message,
                  }
                : r
            )
          )
        }
      } catch (error) {
        setRuns((prev) =>
          prev.map((r) =>
            r.runId === run.runId
              ? {
                  ...r,
                  isRetrying: false,
                  errorMessage:
                    error instanceof Error
                      ? error.message
                      : 'Failed to start analysis',
                }
              : r
          )
        )
      }
    },
    [handleDismiss, pollRuns]
  )

  if (runs.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 w-full max-w-md">
      {runs.map((run) => {
        const isCompleted = run.status === 'completed'
        const isFailed = run.status === 'failed'
        const isActive = isRunActive(run.status)

        const progressPercent = run.progress
          ? run.progress.completed && run.progress.total
            ? Math.round(
                (run.progress.completed / run.progress.total) * 100
              )
            : undefined
          : undefined

        const statusMessage = run.progress?.step
          ? run.progress.step
          : STATUS_MESSAGES[run.status]

        return (
          <div
            key={run.runId}
            className="rounded-lg border border-border bg-background shadow-lg animate-in slide-in-from-bottom-5"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : isFailed ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : null}
                    <h3 className="text-sm font-semibold text-foreground">
                      {isCompleted
                        ? 'Evidence ready'
                        : isFailed
                          ? 'Evidence collection failed'
                          : 'Starting evidence collection…'}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isFailed
                      ? run.errorMessage || 'Please try again.'
                      : isCompleted
                        ? 'Your analysis is ready to view.'
                        : "You can keep working — we'll notify you when it's ready."}
                  </p>
                </div>
                {!isCompleted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleDismiss(run.runId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Status message */}
              {isActive && (
                <div className="text-xs text-muted-foreground mb-3">
                  {statusMessage}
                </div>
              )}

              {/* Progress bar */}
              {!isFailed && isActive && (
                <div className="mb-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{
                        width: progressPercent
                          ? `${progressPercent}%`
                          : '10%',
                      }}
                    />
                  </div>
                  {progressPercent !== undefined && (
                    <div className="mt-1 text-xs text-muted-foreground text-right">
                      {progressPercent}%
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {isFailed ? (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleRetry(run)}
                      disabled={run.isRetrying}
                    >
                      {run.isRetrying ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Starting…
                        </>
                      ) : (
                        'Retry'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDismiss(run.runId)}
                    >
                      Dismiss
                    </Button>
                  </>
                ) : (
                  <>
                    {isCompleted && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          handleViewResults(run.projectId, run.runId)
                        }
                      >
                        View results
                      </Button>
                    )}
                    {isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleViewResults(run.projectId, run.runId)
                        }
                      >
                        View progress
                      </Button>
                    )}
                    {isCompleted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismiss(run.runId)}
                      >
                        Dismiss
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

