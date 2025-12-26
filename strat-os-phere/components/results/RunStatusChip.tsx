'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { UiRun } from '@/lib/data/projectRuns'

interface RunStatusChipProps {
  projectId: string
}

/**
 * Global status chip shown in header when a run is in progress
 * Polls for latest run status and shows progress
 */
export function RunStatusChip({ projectId }: RunStatusChipProps) {
  const [run, setRun] = useState<UiRun | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  useEffect(() => {
    async function checkRunStatus() {
      try {
        const response = await fetch(`/api/projects/${projectId}/runs/latest`)
        const data = await response.json()
        
        if (data.ok && data.run) {
          const isRunning = data.run.status === 'running' || data.run.status === 'queued'
          setRun(data.run)
          setIsPolling(isRunning)
        } else {
          setIsPolling(false)
        }
      } catch (error) {
        console.error('Failed to check run status', error)
        setIsPolling(false)
      }
    }

    checkRunStatus()

    if (isPolling) {
      const interval = setInterval(checkRunStatus, 5000) // Poll every 5 seconds
      return () => clearInterval(interval)
    }
  }, [projectId, isPolling])

  // Don't show if no run or run is not running
  if (!run || (run.status !== 'running' && run.status !== 'queued')) {
    return null
  }

  const percent = run.percent ?? 0
  const phase = run.currentPhase ?? 'Starting...'

  return (
    <Link href={`/projects/${projectId}/results?runId=${run.id}`}>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-xs font-medium">
          Running • {percent}%
        </span>
      </Button>
    </Link>
  )
}

