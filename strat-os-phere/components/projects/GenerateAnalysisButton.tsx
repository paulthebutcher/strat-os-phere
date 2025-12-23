'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToastContext } from '@/components/toast/toast-provider'
import { Loader2 } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

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
 * Handles API call, loading states, error handling, and navigation
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
  const router = useRouter()
  const { showAnalysisRunToast } = useToastContext()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleClick = async () => {
    if (!canGenerate || isGenerating) return

    // If there are missing requirements, scroll to checklist and show message
    if (missingReasons.length > 0) {
      const checklistElement = document.getElementById('readiness-checklist')
      if (checklistElement) {
        checklistElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      // Show alert for now - could be enhanced with toast
      alert(`Please complete the requirements:\n\n${missingReasons.join('\n')}`)
      return
    }

    setIsGenerating(true)
    onStarted?.()

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
          setIsGenerating(false)
          return
        }
      }

      // Start generation
      const response = await fetch(`/api/projects/${projectId}/generate`, {
        method: 'POST',
      })

      const result = await response.json()

      if (response.ok && result.ok && result.runId) {
        // Success: navigate to results and show toast
        const resultsUrl = `/projects/${projectId}/results?runId=${result.runId}`
        router.push(resultsUrl)

        showAnalysisRunToast({
          projectId,
          runId: result.runId,
          resultsUrl,
        })
      } else {
        // Error: show error message
        const errorMessage = result.message || 'Failed to start analysis. Please try again.'
        
        // Check if it's a validation error (like missing competitors)
        // The API returns error messages that mention competitors, so check for that
        if (result.message?.toLowerCase().includes('competitor') || 
            result.message?.toLowerCase().includes('at least')) {
          // Scroll to checklist for validation errors
          const checklistElement = document.getElementById('readiness-checklist')
          if (checklistElement) {
            checklistElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }

        alert(errorMessage)
        setIsGenerating(false)
      }
    } catch (error) {
      console.error('Error starting analysis:', error)
      alert('Failed to start analysis. Please try again.')
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
          <span>Generating...</span>
        </>
      ) : (
        label
      )}
    </Button>
  )
}

