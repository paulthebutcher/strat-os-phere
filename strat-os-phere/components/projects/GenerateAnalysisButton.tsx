'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { startEvidenceRun } from '@/lib/runs/startEvidenceRun'
import { addActiveRun } from '@/lib/runs/runToastStore'
import { toastSuccess, toastError } from '@/lib/toast/toast'

interface GenerateAnalysisButtonProps {
  projectId: string
  label?: string
  variant?: VariantProps<typeof Button>['variant']
  size?: VariantProps<typeof Button>['size']
  className?: string
  canGenerate?: boolean
  missingReasons?: string[]
  onStarted?: () => void
}

/**
 * Shared button component for triggering analysis generation
 * Uses the global run toast system for non-blocking progress tracking
 */
export function GenerateAnalysisButton({
  projectId,
  label = 'Generate analysis',
  variant = 'default',
  size = 'default',
  className,
  canGenerate = true,
  missingReasons = [],
  onStarted,
}: GenerateAnalysisButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleClick = async () => {
    if (!canGenerate || isGenerating) return

    // If there are missing requirements, scroll to checklist and show message
    if (missingReasons.length > 0) {
      const checklistElement = document.getElementById('readiness-checklist')
      if (checklistElement) {
        checklistElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      alert(`Please complete the requirements:\n\n${missingReasons.join('\n')}`)
      return
    }

    setIsGenerating(true)
    onStarted?.()

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

        // Toast will appear automatically via RunToasts component
        // User can continue navigating - toast persists
        // Re-enable button - don't lock the page
        setIsGenerating(false)
      } else {
        // Error: show error toast
        const errorMessage =
          result.message || 'Failed to start analysis. Please try again.'
        toastError('Failed to start analysis', errorMessage)

        // Check if it's a validation error (like missing competitors)
        if (
          result.message?.toLowerCase().includes('competitor') ||
          result.message?.toLowerCase().includes('at least')
        ) {
          // Scroll to checklist for validation errors
          const checklistElement = document.getElementById('readiness-checklist')
          if (checklistElement) {
            checklistElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }
        }

        setIsGenerating(false)
      }
    } catch (error) {
      console.error('Error starting analysis:', error)
      toastError(
        'Failed to start analysis',
        'An unexpected error occurred. Please try again.'
      )
      setIsGenerating(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      disabled={!canGenerate || isGenerating}
      onClick={handleClick}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Starting...</span>
        </>
      ) : (
        label
      )}
    </Button>
  )
}

