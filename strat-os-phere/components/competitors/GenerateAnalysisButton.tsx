'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

interface GenerateAnalysisButtonProps {
  projectId: string
  disabled?: boolean
  competitorCount?: number
}

/**
 * Button that triggers unified analysis generation (including Strategic Bets)
 * When clicked, navigates to results page with generating=true to show AnalysisRunExperience
 */
export function GenerateAnalysisButton({
  projectId,
  disabled,
  competitorCount = 0,
}: GenerateAnalysisButtonProps) {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  const handleClick = () => {
    if (disabled || isStarting) return

    setIsStarting(true)

    // Clear the progressive reveal flag so animation plays again for new results
    try {
      sessionStorage.removeItem('progressive-reveal-shown')
    } catch {
      // Ignore sessionStorage errors
    }

    // Navigate to results page with generating flag to show AnalysisRunExperience
    // This will generate everything including Strategic Bets
    router.push(`/projects/${projectId}/results?generating=true`)
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


