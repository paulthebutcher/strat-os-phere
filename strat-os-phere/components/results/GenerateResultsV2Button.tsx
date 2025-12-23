'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { startEvidenceRun } from '@/lib/runs/startEvidenceRun'
import { addActiveRun, getActiveRuns, isRunActive } from '@/lib/runs/runToastStore'

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
        setIsStarting(false)
      } else {
        // Error: show error message
        const errorMessage =
          result.message || 'Failed to start analysis. Please try again.'
        alert(errorMessage)
        setIsStarting(false)
      }
    } catch (error) {
      console.error('Error starting analysis:', error)
      alert('Failed to start analysis. Please try again.')
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

