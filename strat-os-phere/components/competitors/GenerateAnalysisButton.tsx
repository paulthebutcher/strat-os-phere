'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useToastContext } from '@/components/toast/toast-provider'

interface GenerateAnalysisButtonProps {
  projectId: string
  disabled?: boolean
  competitorCount?: number
}

/**
 * Button that triggers unified analysis generation (including Strategic Bets)
 * When clicked, immediately navigates to results and shows non-blocking toast
 */
export function GenerateAnalysisButton({
  projectId,
  disabled,
  competitorCount = 0,
}: GenerateAnalysisButtonProps) {
  const router = useRouter()
  const { showAnalysisRunToast } = useToastContext()
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
      // Check if there's already a running run
      const statusResponse = await fetch(`/api/projects/${projectId}/latest-run`)
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        if (statusData?.status === 'running' || statusData?.status === 'queued') {
          // Navigate to results and show toast for existing run
          const resultsUrl = `/projects/${projectId}/results?runId=${statusData.runId}`
          router.push(resultsUrl)
          showAnalysisRunToast({
            projectId,
            runId: statusData.runId,
            resultsUrl,
          })
          setIsStarting(false)
          return
        }
      }

      // Start generation
      const response = await fetch(`/api/projects/${projectId}/generate`, {
        method: 'POST',
      })

      const result = await response.json()

      if (result.ok && result.runId) {
        // Immediately navigate to results
        const resultsUrl = `/projects/${projectId}/results?runId=${result.runId}`
        router.push(resultsUrl)

        // Show toast
        showAnalysisRunToast({
          projectId,
          runId: result.runId,
          resultsUrl,
        })
      } else {
        // Show error (could be enhanced with error toast)
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


