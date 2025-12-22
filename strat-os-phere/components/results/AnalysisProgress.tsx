'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalysisProgressProps {
  /**
   * If provided, will override the automatic time-based progression
   * and use this step index instead (0-based)
   */
  currentStepIndex?: number
  /**
   * Optional callback when all steps are complete
   */
  onComplete?: () => void
}

const STEPS = [
  'Identifying where competitors are vulnerable',
  'Scanning pricing, positioning, and hiring signals',
  'Extracting real customer struggles',
  'Stress-testing opportunity defensibility',
  'Synthesizing signals into strategic options',
] as const

/**
 * Step duration in milliseconds - each step takes about 3-4 seconds
 */
const STEP_DURATION_MS = 3500

/**
 * Total duration for all steps (about 15-18 seconds)
 */
const TOTAL_DURATION_MS = STEPS.length * STEP_DURATION_MS

export function AnalysisProgress({
  currentStepIndex: controlledStepIndex,
  onComplete,
}: AnalysisProgressProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // If controlled from parent, use that value
    if (controlledStepIndex !== undefined) {
      if (controlledStepIndex >= STEPS.length) {
        setIsComplete(true)
        onComplete?.()
      } else {
        setCurrentStepIndex(controlledStepIndex)
        setIsComplete(false)
      }
      return
    }

    // Otherwise, use time-based progression
    let intervalId: NodeJS.Timeout
    let timeoutId: NodeJS.Timeout

    const advanceStep = () => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1
        if (next >= STEPS.length) {
          setIsComplete(true)
          onComplete?.()
          return prev
        }
        return next
      })
    }

    // Advance to next step every STEP_DURATION_MS
    intervalId = setInterval(advanceStep, STEP_DURATION_MS)

    // Complete after total duration
    timeoutId = setTimeout(() => {
      setIsComplete(true)
      onComplete?.()
      clearInterval(intervalId)
    }, TOTAL_DURATION_MS)

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [controlledStepIndex, onComplete])

  return (
    <div className="panel flex flex-col gap-6 p-6" role="status" aria-live="polite">
      {/* Header with expectation-setting copy */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">
          Generating your analysis
        </h2>
        <p className="text-sm text-muted-foreground">
          This usually takes 15–30 seconds.
        </p>
        <p className="text-xs text-muted-foreground">
          We analyze live signals like reviews, pricing, and recent product updates.
        </p>
      </div>

      {/* Step list */}
      <ol className="space-y-4">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex || isComplete
          const isCurrent = index === currentStepIndex && !isComplete
          const isUpcoming = index > currentStepIndex && !isComplete

          return (
            <li
              key={index}
              className={cn(
                'flex items-start gap-3',
                isUpcoming && 'opacity-50'
              )}
            >
              {/* Icon */}
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                {isCompleted ? (
                  <Check
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                ) : isCurrent ? (
                  <Loader2
                    className="h-5 w-5 animate-spin text-primary"
                    aria-hidden="true"
                  />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-border" />
                )}
              </div>

              {/* Step text */}
              <div className="flex-1">
                <span
                  className={cn(
                    'text-sm',
                    isCompleted && 'font-medium text-foreground',
                    isCurrent && 'font-medium text-foreground',
                    isUpcoming && 'text-muted-foreground'
                  )}
                >
                  {step}
                </span>
              </div>
            </li>
          )
        })}
      </ol>

      {/* Screen reader status */}
      <div className="sr-only" aria-atomic="true">
        {isComplete
          ? 'Analysis complete'
          : `Step ${currentStepIndex + 1} of ${STEPS.length}: ${STEPS[currentStepIndex]}`}
      </div>
    </div>
  )
}

