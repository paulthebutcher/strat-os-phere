'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToastContext } from '@/components/toast/toast-provider'

interface RerunAnalysisButtonProps {
  projectId: string
  disabled?: boolean
}

/**
 * Button that triggers a new analysis run
 * After starting, immediately navigates to results and shows non-blocking toast
 */
export function RerunAnalysisButton({
  projectId,
  disabled,
}: RerunAnalysisButtonProps) {
  const router = useRouter()
  const { showAnalysisRunToast } = useToastContext()
  const [isRunning, setIsRunning] = useState(false)

  const handleClick = async () => {
    if (disabled || isRunning) return

    setIsRunning(true)

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
          setIsRunning(false)
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

