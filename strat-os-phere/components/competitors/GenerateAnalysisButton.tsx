'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { startEvidenceRun } from '@/lib/runs/startEvidenceRun'
import { addActiveRun } from '@/lib/runs/runToastStore'

interface GenerateAnalysisButtonProps {
  projectId: string
  disabled?: boolean
  competitorCount?: number
}

/**
 * Button that triggers unified analysis generation (including Strategic Bets)
 * Uses the global run toast system for non-blocking progress tracking
 */
export function GenerateAnalysisButton({
  projectId,
  disabled,
  competitorCount = 0,
}: GenerateAnalysisButtonProps) {
  const [isStarting, setIsStarting] = useState(false)

  const handleClick = async () => {
    if (disabled || isStarting) return

    setIsStarting(true)

    // Clear the progressive reveal flag so animation plays again for new results
    try {
      sessionStorage.removeItem('progressive-reveal-shown')
    } catch {
      // Ignore sessionStorage errors
    }

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
        setIsStarting(false)
      } else {
        console.error('Failed to start analysis:', result.message)
        alert(result.message || 'Failed to start analysis. Please try again.')
        setIsStarting(false)
      }
    } catch (error) {
      console.error('Error starting analysis:', error)
      alert('Failed to start analysis. Please try again.')
      setIsStarting(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        size="sm"
        disabled={disabled || isStarting}
        className="mt-1"
        onClick={handleClick}
      >
        {isStarting ? 'Starting...' : 'Generate analysis'}
      </Button>
    </div>
  )
}


