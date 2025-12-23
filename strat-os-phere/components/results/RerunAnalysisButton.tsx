'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { startEvidenceRun } from '@/lib/runs/startEvidenceRun'
import { addActiveRun } from '@/lib/runs/runToastStore'
import { toastSuccess, toastError } from '@/lib/toast/toast'

interface RerunAnalysisButtonProps {
  projectId: string
  disabled?: boolean
}

/**
 * Button that triggers a new analysis run
 * Uses the global run toast system for non-blocking progress tracking
 */
export function RerunAnalysisButton({
  projectId,
  disabled,
}: RerunAnalysisButtonProps) {
  const [isRunning, setIsRunning] = useState(false)

  const handleClick = async () => {
    if (disabled || isRunning) return

    setIsRunning(true)

    // Immediate feedback toast
    toastSuccess('Starting analysis…', 'Your analysis is being prepared.')

    try {
      const result = await startEvidenceRun({ analysisId: projectId })

      if (result.ok) {
        // Register the run with the global toast manager
        addActiveRun({
          runId: result.runId,
          projectId,
          analysisId: projectId,
          createdAt: new Date().toISOString(),
        })

        // Toast will appear automatically via RunToasts component
        // User can continue navigating - toast persists
        // Re-enable button - don't lock the page
        setIsRunning(false)
      } else {
        console.error('Failed to start analysis:', result.message)
        toastError(
          'Failed to start analysis',
          result.message || 'Please try again.'
        )
        setIsRunning(false)
      }
    } catch (error) {
      console.error('Error starting analysis:', error)
      toastError(
        'Failed to start analysis',
        'An unexpected error occurred. Please try again.'
      )
      setIsRunning(false)
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      disabled={disabled || isRunning}
      onClick={handleClick}
    >
      {isRunning ? 'Starting...' : 'Re-run analysis'}
    </Button>
  )
}

