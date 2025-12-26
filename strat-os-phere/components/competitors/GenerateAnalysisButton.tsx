'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { paths } from '@/lib/routes'
import { startEvidenceRun } from '@/lib/runs/startEvidenceRun'
import { addActiveRun } from '@/lib/runs/runToastStore'
import { toastSuccess, toastError } from '@/lib/toast/toast'

interface GenerateAnalysisButtonProps {
  projectId: string
  disabled?: boolean
  competitorCount?: number
  compact?: boolean // If true, uses compact styling for status bar
}

/**
 * Button that triggers unified analysis generation (including Strategic Bets)
 * Uses the global run toast system for non-blocking progress tracking
 */
export function GenerateAnalysisButton({
  projectId,
  disabled,
  competitorCount = 0,
  compact = false,
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

        // Redirect to opportunities page with runId and justGenerated flag
        router.push(`${paths.opportunities(projectId)}?run=${result.runId}&justGenerated=1`)

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

  const buttonContent = (
    <Button
      type="button"
      size={compact ? "sm" : "sm"}
      disabled={disabled || isStarting}
      className={compact ? "" : "mt-1"}
      onClick={handleClick}
      title={disabled && competitorCount < 3 ? "Add 3+ competitors to generate" : undefined}
    >
      {isStarting ? 'Starting...' : compact ? 'Generate' : 'Generate ranked opportunities'}
    </Button>
  )

  if (compact) {
    return buttonContent
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {buttonContent}
    </div>
  )
}


