'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { startEvidenceRun } from '@/lib/runs/startEvidenceRun'
import { addActiveRun } from '@/lib/runs/runToastStore'

interface RegenerateButtonProps {
  projectId: string
  label?: string
  competitorCount?: number
  onStart?: () => void
}

/**
 * Button that triggers analysis regeneration
 * Uses the global run toast system for non-blocking progress tracking
 */
export function RegenerateButton({
  projectId,
  label = 'Regenerate analysis',
  competitorCount = 0,
  onStart,
}: RegenerateButtonProps) {
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
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isStarting}
      onClick={handleClick}
    >
      {isStarting ? 'Starting...' : label}
    </Button>
  )
}


