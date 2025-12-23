'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { startEvidenceRun } from '@/lib/runs/startEvidenceRun'
import { addActiveRun } from '@/lib/runs/runToastStore'

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
        alert(result.message || 'Failed to start analysis. Please try again.')
        setIsRunning(false)
      }
    } catch (error) {
      console.error('Error starting analysis:', error)
      alert('Failed to start analysis. Please try again.')
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

