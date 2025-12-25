'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { startEvidenceRun } from '@/lib/runs/startEvidenceRun'
import { addActiveRun } from '@/lib/runs/runToastStore'
import { toastSuccess, toastError } from '@/lib/toast/toast'

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
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  const handleClick = async () => {
    if (disabled || isStarting) return

    setIsStarting(true)

    // Immediate feedback toast
    toastSuccess('Starting analysis…', 'Your analysis is being prepared.')

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

        // Redirect to opportunities page with justGenerated flag
        router.push(`/projects/${projectId}/opportunities?justGenerated=true`)

        // Toast will appear automatically via RunToasts component
        // User can continue navigating - toast persists
        // Re-enable button - don't lock the page
        setIsStarting(false)
      } else {
        console.error('Failed to start analysis:', result.message)
        toastError(
          'Failed to start analysis',
          result.message || 'Please try again.'
        )
        setIsStarting(false)
      }
    } catch (error) {
      console.error('Error starting analysis:', error)
      toastError(
        'Failed to start analysis',
        'An unexpected error occurred. Please try again.'
      )
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
        {isStarting ? 'Starting...' : 'Generate ranked opportunities'}
      </Button>
    </div>
  )
}


