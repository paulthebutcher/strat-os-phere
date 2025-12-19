'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { InlineStatusPanel } from '@/components/common/InlineStatusPanel'
import { InlineError } from '@/components/common/InlineError'
import type { GenerateAnalysisResult } from '@/app/projects/[projectId]/results/actions'
import { generateAnalysis } from '@/app/projects/[projectId]/results/actions'

interface GenerateAnalysisButtonProps {
  projectId: string
  disabled?: boolean
  competitorCount?: number
}

type ProgressPhase = 'starting' | 'analyzing' | 'synthesizing' | 'finalizing'

export function GenerateAnalysisButton({
  projectId,
  disabled,
  competitorCount = 0,
}: GenerateAnalysisButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<Record<string, unknown> | undefined>()
  const [progressPhase, setProgressPhase] = useState<ProgressPhase | null>(null)
  const [currentCompetitor, setCurrentCompetitor] = useState<number>(0)
  const [cancelled, setCancelled] = useState(false)
  const cancelledRef = useRef(false)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (isPending && !startTimeRef.current) {
      startTimeRef.current = Date.now()
    } else if (!isPending) {
      startTimeRef.current = null
    }
  }, [isPending])

  useEffect(() => {
    if (!isPending) {
      setProgressPhase(null)
      setCurrentCompetitor(0)
      setCancelled(false)
      cancelledRef.current = false
      return
    }

    // Simulate progress phases
    const phases: ProgressPhase[] = ['starting', 'analyzing', 'synthesizing', 'finalizing']
    let phaseIndex = 0
    let competitorIndex = 0

    const updateProgress = () => {
      if (cancelledRef.current) return

      if (phaseIndex < phases.length) {
        setProgressPhase(phases[phaseIndex])

        if (phases[phaseIndex] === 'analyzing' && competitorCount > 0) {
          competitorIndex++
          setCurrentCompetitor(Math.min(competitorIndex, competitorCount))
        }

        phaseIndex++
        if (phaseIndex < phases.length) {
          setTimeout(updateProgress, 2000)
        }
      }

      // Show timeout message after 25 seconds
      if (startTimeRef.current && Date.now() - startTimeRef.current > 25000) {
        // This will be handled in the render
      }
    }

    updateProgress()
  }, [isPending, competitorCount])

  const handleCancel = () => {
    setCancelled(true)
    cancelledRef.current = true
    // Note: This doesn't actually cancel the server action, just stops UI updates
  }

  const handleClick = () => {
    if (disabled || isPending) return

    setError(null)
    setErrorDetails(undefined)
    setCancelled(false)
    cancelledRef.current = false

    startTransition(async () => {
      let result: GenerateAnalysisResult

      try {
        result = await generateAnalysis(projectId)
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unexpected error while starting analysis.'
        setError(message)
        return
      }

      if (result.ok) {
        router.push(`/projects/${projectId}/results`)
      } else {
        setError(result.message)
        setErrorDetails(result.details)
      }
    })
  }

  const showTimeoutMessage =
    isPending && startTimeRef.current && Date.now() - startTimeRef.current > 25000

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        size="sm"
        disabled={disabled || isPending}
        className="mt-1"
        onClick={handleClick}
      >
        {isPending ? 'Generating…' : 'Generate analysis'}
      </Button>
      {isPending && progressPhase && !cancelled && (
        <div className="w-full max-w-xs">
          <InlineStatusPanel
            phase={progressPhase}
            currentCompetitor={progressPhase === 'analyzing' ? currentCompetitor : undefined}
            totalCompetitors={progressPhase === 'analyzing' ? competitorCount : undefined}
            onCancel={handleCancel}
          />
          {showTimeoutMessage && (
            <p className="mt-2 text-xs text-text-secondary">
              Still working… Large competitor sets can take a minute.
            </p>
          )}
        </div>
      )}
      {error && (
        <div className="w-full max-w-xs">
          <InlineError message={error} details={errorDetails} />
        </div>
      )}
    </div>
  )
}


