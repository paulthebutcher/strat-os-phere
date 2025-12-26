'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { startEvidenceRun } from '@/lib/runs/startEvidenceRun'
import { addActiveRun, getActiveRuns, isRunActive } from '@/lib/runs/runToastStore'
import { toastSuccess, toastError } from '@/lib/toast/toast'

interface GenerateResultsV2ButtonProps {
  projectId: string
  label?: string
  onStart?: () => void
}

/**
 * Button that triggers analysis generation
 * Starts evidence collection run and shows non-blocking progress toast
 */
export function GenerateResultsV2Button({
  projectId,
  label = 'Generate Results',
  onStart,
}: GenerateResultsV2ButtonProps) {
  const [isStarting, setIsStarting] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    if (isStarting) return

    setIsStarting(true)
    onStart?.()

    // Clear the progressive reveal flag so animation plays again for new results
    try {
      sessionStorage.removeItem('progressive-reveal-shown')
    } catch {
      // Ignore sessionStorage errors
    }

    try {
      // Check for active runs first (lightweight duplicate prevention)
      const activeRuns = getActiveRuns()
      const projectActiveRun = activeRuns.find(
        (run) => run.projectId === projectId && isRunActive(run.lastSeenStatus || 'queued')
      )

      if (projectActiveRun) {
        // Run already active - the RunToasts component will handle displaying it
        // Optionally show a message that it's already running
        setIsStarting(false)
        return
      }

      // Check server-side for active runs
      try {
        const statusResponse = await fetch(`/api/projects/${projectId}/latest-run`)
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          if (statusData.runId && (statusData.status === 'running' || statusData.status === 'queued')) {
            // Run already active - add it to tracking so RunToasts shows it
            addActiveRun({
              runId: statusData.runId,
              projectId,
              analysisId: projectId,
              createdAt: statusData.updatedAt || new Date().toISOString(),
            })
            setIsStarting(false)
            return
          }
        }
      } catch (error) {
        // If status check fails, continue with starting new run
        console.warn('Failed to check run status:', error)
      }

      // Start new run
      toastSuccess('Starting analysis…', 'Your analysis is being prepared.')
      const result = await startEvidenceRun({ analysisId: projectId })

      if (result.ok) {
        // Register the run with the global toast manager
        addActiveRun({
          runId: result.runId,
          projectId,
          analysisId: projectId,
          createdAt: new Date().toISOString(),
        })

        // Navigate to project opportunities page to show generating state
        // This provides a deterministic project-scoped page that can show:
        // - run progress (if available)
        // - "Generating results" state
        // - eventual committed results when ready
        router.push(`/projects/${projectId}/opportunities`)
        
        // Toast will appear automatically via RunToasts component
        // User can continue navigating - toast persists
        setIsStarting(false)
      } else {
        // Handle structured errors
        const errorMessage = result.message || 'Failed to start analysis. Please try again.'
        const errorDetails = result.details || {}
        
        // Check for specific error codes
        if (errorDetails.code === 'UNAUTHENTICATED' || errorMessage.includes('401')) {
          toastError('Session expired', 'Please sign in to continue.')
          router.push(`/login?next=${encodeURIComponent(`/projects/${projectId}/opportunities`)}`)
        } else if (errorDetails.code === 'FORBIDDEN' || errorMessage.includes('403')) {
          toastError('Access denied', "You don't have access to this project.")
        } else {
          toastError('Failed to start analysis', errorMessage)
        }
        
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
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isStarting}
      onClick={handleClick}
    >
      {isStarting ? (
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

