'use client'

import { useEffect, useState, useRef } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThinkingModeProps {
  /**
   * If provided, will override the automatic time-based progression
   * and use this step index instead (0-based)
   */
  currentStepIndex?: number
  /**
   * Whether the analysis is complete
   */
  isComplete?: boolean
  /**
   * Optional callback when all steps are complete
   */
  onComplete?: () => void
}

const TIMELINE_STEPS = [
  {
    id: 'framing',
    label: 'Framing the competitive landscape',
    description: 'Mapping market structure and positioning',
  },
  {
    id: 'behavior',
    label: 'Examining competitor behavior',
    description: 'Analyzing capabilities and strategic moves',
  },
  {
    id: 'pain',
    label: 'Listening to customer pain',
    description: 'Extracting struggles from reviews and feedback',
  },
  {
    id: 'differentiation',
    label: 'Stress-testing differentiation',
    description: 'Evaluating opportunities and competitive gaps',
  },
  {
    id: 'recommendations',
    label: 'Forming strategic recommendations',
    description: 'Synthesizing insights into actionable strategy',
  },
] as const

/**
 * Pre-written signal templates that rotate during analysis
 * These are high-level summaries, not raw evidence
 */
const SIGNAL_TEMPLATES = [
  'Pricing shifts detected across multiple competitors',
  'Customer reviews highlight integration gaps',
  'Recent product updates suggest focus on enterprise features',
  'Support forums reveal common workflow frustrations',
  'Documentation changes indicate new positioning strategy',
  'Changelog patterns show acceleration in feature velocity',
  'Review sentiment trending toward specific pain points',
  'Competitive messaging converging on similar value props',
] as const

/**
 * Step duration in milliseconds - each step takes about 4-5 seconds
 */
const STEP_DURATION_MS = 4500

/**
 * Signal rotation interval in milliseconds
 */
const SIGNAL_ROTATION_MS = 3500

export function ThinkingMode({
  currentStepIndex: controlledStepIndex,
  isComplete: controlledIsComplete,
  onComplete,
}: ThinkingModeProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [currentSignalIndex, setCurrentSignalIndex] = useState(0)
  const [signalOpacity, setSignalOpacity] = useState(1)
  const prefersReducedMotion = useRef(false)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.current = mediaQuery.matches

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Handle step progression
  useEffect(() => {
    // If controlled from parent, use that value
    if (controlledStepIndex !== undefined) {
      if (controlledStepIndex >= TIMELINE_STEPS.length) {
        setIsComplete(true)
        onComplete?.()
      } else {
        setCurrentStepIndex(controlledStepIndex)
        setIsComplete(false)
      }
      return
    }

    // If explicitly marked complete, set state
    if (controlledIsComplete === true) {
      setIsComplete(true)
      // Complete all steps visually
      setCurrentStepIndex(TIMELINE_STEPS.length)
      onComplete?.()
      return
    }

    // Otherwise, use time-based progression
    let intervalId: NodeJS.Timeout
    let timeoutId: NodeJS.Timeout

    const advanceStep = () => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1
        if (next >= TIMELINE_STEPS.length) {
          setIsComplete(true)
          onComplete?.()
          return prev
        }
        return next
      })
    }

    // Advance to next step every STEP_DURATION_MS
    intervalId = setInterval(advanceStep, STEP_DURATION_MS)

    // Complete after all steps
    timeoutId = setTimeout(() => {
      setIsComplete(true)
      onComplete?.()
      clearInterval(intervalId)
    }, TIMELINE_STEPS.length * STEP_DURATION_MS)

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [controlledStepIndex, controlledIsComplete, onComplete])

  // Handle signal rotation with fade animation
  useEffect(() => {
    if (isComplete) return

    const rotateSignal = () => {
      // Fade out
      setSignalOpacity(0)
      
      // After fade out, change signal and fade in
      setTimeout(() => {
        setCurrentSignalIndex((prev) => (prev + 1) % SIGNAL_TEMPLATES.length)
        setSignalOpacity(1)
      }, prefersReducedMotion.current ? 0 : 200) // Instant if reduced motion
    }

    const intervalId = setInterval(rotateSignal, SIGNAL_ROTATION_MS)
    return () => clearInterval(intervalId)
  }, [isComplete])

  const currentSignal = SIGNAL_TEMPLATES[currentSignalIndex]

  return (
    <div
      className="panel flex flex-col gap-8 p-8"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {isComplete ? 'Strategy Ready' : 'Thinking Mode'}
          </h2>
          {isComplete && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Analysis complete</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {isComplete
            ? 'Your strategic analysis is ready to review.'
            : 'Live market analysis in progress. We examine reviews, pricing, recent updates, and competitive signals to build your strategy.'}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Timeline - takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <ol className="relative space-y-6" aria-label="Analysis progress">
            {TIMELINE_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex || isComplete
              const isCurrent = index === currentStepIndex && !isComplete
              const isUpcoming = index > currentStepIndex && !isComplete

              return (
                <li
                  key={step.id}
                  className={cn(
                    'relative flex items-start gap-4 transition-opacity',
                    isUpcoming && 'opacity-50',
                    !prefersReducedMotion.current &&
                      isCurrent &&
                      'animate-pulse-subtle'
                  )}
                >
                  {/* Vertical line connector */}
                  {index < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={cn(
                        'absolute left-[11px] top-8 w-0.5 transition-colors',
                        isCompleted
                          ? 'bg-primary'
                          : 'bg-border'
                      )}
                      style={{
                        height: 'calc(100% + 1.5rem)',
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {/* Icon */}
                  <div className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                    {isCompleted ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check
                          className="h-4 w-4 text-primary-foreground"
                          aria-hidden="true"
                        />
                      </div>
                    ) : isCurrent ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                        <Loader2
                          className={cn(
                            'h-4 w-4 text-primary',
                            !prefersReducedMotion.current && 'animate-spin'
                          )}
                          aria-hidden="true"
                        />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-border bg-background" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 space-y-1 pb-6">
                    <div
                      className={cn(
                        'text-sm font-medium',
                        isCompleted && 'text-foreground',
                        isCurrent && 'text-foreground',
                        isUpcoming && 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Signals panel - takes 1 column on large screens */}
        {!isComplete && (
          <div className="lg:col-span-1">
            <div className="panel-muted rounded-lg border p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Signals we're seeing
              </h3>
              <div
                className={cn(
                  'min-h-[60px] text-sm text-foreground transition-opacity',
                  !prefersReducedMotion.current && 'duration-200'
                )}
                style={{ opacity: signalOpacity }}
                aria-live="polite"
                aria-atomic="true"
              >
                {currentSignal}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trust microcopy */}
      <div className="space-y-2 border-t border-border pt-6">
        <div className="grid gap-4 text-xs text-muted-foreground sm:grid-cols-3">
          <div>
            <span className="font-medium text-foreground">Typical duration:</span>{' '}
            15–30 seconds
          </div>
          <div>
            <span className="font-medium text-foreground">Source types:</span>{' '}
            Reviews, pricing, changelogs, documentation
          </div>
          <div>
            <span className="font-medium text-foreground">Privacy:</span>{' '}
            Analysis is private to your project
          </div>
        </div>
      </div>

      {/* Screen reader status */}
      <div className="sr-only" aria-atomic="true">
        {isComplete
          ? 'Analysis complete. Strategy ready to review.'
          : `Step ${currentStepIndex + 1} of ${TIMELINE_STEPS.length}: ${TIMELINE_STEPS[currentStepIndex].label}. ${currentSignal}`}
      </div>
    </div>
  )
}

