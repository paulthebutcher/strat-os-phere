'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

interface GenerateResultsV2ButtonProps {
  projectId: string
  label?: string
  onStart?: () => void
}

/**
 * Button that triggers analysis generation
 * When clicked, navigates to results page with generating=true to show AnalysisRunExperience
 */
export function GenerateResultsV2Button({
  projectId,
  label = 'Generate Results',
  onStart,
}: GenerateResultsV2ButtonProps) {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  const handleClick = () => {
    if (isStarting) return

    setIsStarting(true)
    onStart?.()

    // Clear the progressive reveal flag so animation plays again for new results
    try {
      sessionStorage.removeItem('progressive-reveal-shown')
    } catch {
      // Ignore sessionStorage errors
    }

    // Navigate to results page with generating flag
    router.push(`/projects/${projectId}/results?generating=true`)
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

