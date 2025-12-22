'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { generateAnalysis } from '@/app/projects/[projectId]/results/actions'

interface RerunAnalysisButtonProps {
  projectId: string
  disabled?: boolean
}

/**
 * Button that triggers a new analysis run
 * After starting, navigates to results page to show progress
 */
export function RerunAnalysisButton({
  projectId,
  disabled,
}: RerunAnalysisButtonProps) {
  const router = useRouter()
  const [isRunning, setIsRunning] = useState(false)

  const handleClick = async () => {
    if (disabled || isRunning) return

    setIsRunning(true)

    try {
      const result = await generateAnalysis(projectId)
      
      if (result.ok) {
        // Navigate to results page with the new runId to show progress
        router.push(`/projects/${projectId}/results?runId=${result.runId}`)
        // The page will show progress if the run is still running
      } else {
        // Show error (could be enhanced with toast)
        console.error('Failed to start analysis:', result.message)
        setIsRunning(false)
      }
    } catch (error) {
      console.error('Error starting analysis:', error)
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

