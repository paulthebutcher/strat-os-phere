'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

interface RegenerateButtonProps {
  projectId: string
  label?: string
  competitorCount?: number
  onStart?: () => void
}

/**
 * Button that triggers analysis regeneration
 * When clicked, navigates to results page with generating=true to show AnalysisRunExperience
 */
export function RegenerateButton({
  projectId,
  label = 'Regenerate analysis',
  competitorCount = 0,
  onStart,
}: RegenerateButtonProps) {
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


