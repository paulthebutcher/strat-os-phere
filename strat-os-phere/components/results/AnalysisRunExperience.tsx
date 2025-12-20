'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { AnalysisRunState } from '@/lib/results/runState'
import {
  createStateMachine,
  transitionTo,
  setError,
  getStateIndex,
} from '@/lib/results/runState'
import {
  ANALYSIS_STAGES,
  SAVING_SUB_STEPS,
  getStageConfig,
} from './analysisRunStages'

interface AnalysisRunExperienceProps {
  projectId: string
  onComplete?: () => void
  onViewResults?: () => void
}

/**
 * Full-screen analysis generation experience
 * Replaces results view during generation
 */
export function AnalysisRunExperience({
  projectId,
  onComplete,
  onViewResults,
}: AnalysisRunExperienceProps) {
  const router = useRouter()
  const [machine, setMachine] = useState(createStateMachine())
  const [currentSavingSubStep, setCurrentSavingSubStep] = useState(0)
  const [currentSignalIndex, setCurrentSignalIndex] = useState(0)
  const [signalOpacity, setSignalOpacity] = useState(1)
  const prefersReducedMotion = useRef(false)
  const simulatorIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (simulatorIntervalRef.current) {
        clearInterval(simulatorIntervalRef.current)
      }
    }
  }, [])

  // Start generation on mount
  useEffect(() => {
    startGeneration()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startGeneration = async () => {
    // Transition to starting
    setMachine((m) => transitionTo(m, 'starting'))

    // Start time-based simulator
    startSimulator()

    // Call the generation API
    try {
      const streamUrl = `/api/results/generate-v2/stream?projectId=${encodeURIComponent(projectId)}`
      const eventSource = new EventSource(streamUrl)
      eventSourceRef.current = eventSource

      eventSource.addEventListener('progress', (event) => {
        try {
          const data = JSON.parse(event.data)
          // Map backend progress phases to our states
          const mappedState = mapProgressPhaseToState(data.phase)
          if (mappedState) {
            setMachine((m) => transitionTo(m, mappedState))
          }
        } catch (err) {
          console.error('Failed to parse progress event:', err)
        }
      })

      eventSource.addEventListener('complete', () => {
        eventSource.close()
        eventSourceRef.current = null
        if (simulatorIntervalRef.current) {
          clearInterval(simulatorIntervalRef.current)
        }
        setMachine((m) => transitionTo(m, 'complete'))
        onComplete?.()
      })

      eventSource.addEventListener('error', (event) => {
        try {
          const messageEvent = event as MessageEvent
          if (messageEvent.data) {
            const data = JSON.parse(messageEvent.data)
            eventSource.close()
            eventSourceRef.current = null
            if (simulatorIntervalRef.current) {
              clearInterval(simulatorIntervalRef.current)
            }
            setMachine((m) =>
              setError(m, {
                message: data.error?.message || 'Generation failed',
                technicalDetails: data.error?.code,
              })
            )
          }
        } catch (err) {
          // Connection error - fallback to POST
          eventSource.close()
          eventSourceRef.current = null
          if (simulatorIntervalRef.current) {
            clearInterval(simulatorIntervalRef.current)
          }
          fallbackToPost()
        }
      })

      eventSource.onerror = () => {
        if (eventSource.readyState === EventSource.CLOSED) {
          // Connection closed - might be normal completion
          return
        }
        eventSource.close()
        eventSourceRef.current = null
        if (simulatorIntervalRef.current) {
          clearInterval(simulatorIntervalRef.current)
        }
        fallbackToPost()
      }
    } catch (err) {
      // EventSource not supported, fallback to POST
      fallbackToPost()
    }
  }

  const fallbackToPost = async () => {
    try {
      const response = await fetch('/api/results/generate-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      })

      const result = await response.json()

      if (result.ok) {
        setMachine((m) => transitionTo(m, 'complete'))
        onComplete?.()
      } else {
        setMachine((m) =>
          setError(m, {
            message: result.error?.message || 'Generation failed',
            technicalDetails: result.error?.code,
          })
        )
      }
    } catch (err) {
      setMachine((m) =>
        setError(m, {
          message:
            err instanceof Error
              ? err.message
              : 'Unexpected error while generating results.',
        })
      )
    }
  }

  // Time-based simulator for stages
  const startSimulator = () => {
    const stages: AnalysisRunState[] = [
      'starting',
      'gathering_inputs',
      'analyzing_competitors',
      'deriving_jobs',
      'scoring_positioning',
      'ranking_opportunities',
      'validating_outputs',
      'saving_artifacts',
      'finalizing',
    ]

    let currentIndex = 0

    simulatorIntervalRef.current = setInterval(() => {
      if (currentIndex < stages.length - 1) {
        currentIndex++
        setMachine((m) => {
          // Only advance if we haven't already moved past this stage
          const currentIndex = getStateIndex(m.currentState)
          const targetIndex = getStateIndex(stages[currentIndex])
          if (targetIndex > currentIndex) {
            return transitionTo(m, stages[currentIndex])
          }
          return m
        })
      }
    }, 12000) // ~12 seconds per stage
  }

  // Handle saving sub-steps
  useEffect(() => {
    if (machine.currentState === 'saving_artifacts') {
      const interval = setInterval(() => {
        setCurrentSavingSubStep((prev) => {
          if (prev < SAVING_SUB_STEPS.length - 1) {
            return prev + 1
          }
          return prev
        })
      }, 2000) // 2 seconds per sub-step

      return () => clearInterval(interval)
    } else {
      setCurrentSavingSubStep(0)
    }
  }, [machine.currentState])

  // Handle signal rotation
  useEffect(() => {
    if (machine.currentState === 'error' || machine.currentState === 'complete') {
      return
    }

    const currentStage = getStageConfig(machine.currentState)
    if (!currentStage?.signals || currentStage.signals.length === 0) {
      return
    }

    const rotateSignal = () => {
      setSignalOpacity(0)
      setTimeout(() => {
        setCurrentSignalIndex((prev) => (prev + 1) % currentStage.signals!.length)
        setSignalOpacity(1)
      }, prefersReducedMotion.current ? 0 : 200)
    }

    const interval = setInterval(rotateSignal, 3500)
    return () => clearInterval(interval)
  }, [machine.currentState])

  const currentStage = getStageConfig(machine.currentState)
  const currentStateIndex = getStateIndex(machine.currentState)

  // Error state
  if (machine.currentState === 'error') {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-background px-4">
        <main className="flex w-full max-w-2xl flex-col gap-6">
          <div className="panel flex flex-col gap-6 p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">
                    Something interrupted the analysis
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {machine.error?.message ||
                      'We weren't able to complete this run. Your inputs are safe, and nothing was lost.'}
                  </p>
                </div>

                {machine.error?.technicalDetails && process.env.NODE_ENV === 'development' && (
                  <details className="rounded-md border border-border bg-muted/50 p-3">
                    <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                      Technical details
                    </summary>
                    <p className="mt-2 text-xs font-mono text-muted-foreground">
                      {machine.error.technicalDetails}
                    </p>
                  </details>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={startGeneration}>Try again</Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push(`/projects/${projectId}`)}
                  >
                    Back to projects
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Complete state
  if (machine.currentState === 'complete') {
    const completedAt = machine.completedAt
      ? new Date(machine.completedAt).toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Just now'

    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-background px-4">
        <main className="flex w-full max-w-2xl flex-col gap-6">
          <div className="panel flex flex-col gap-6 p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">
                    Your analysis is ready
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We've generated Jobs to be Done, a competitive scorecard, and ranked
                    opportunities based on current market signals.
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Last generated: <span className="font-medium">{completedAt}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => {
                      onViewResults?.()
                      router.push(`/projects/${projectId}/results?view=results`)
                      router.refresh()
                    }}
                  >
                    View analysis
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMachine(createStateMachine())
                      setCurrentSavingSubStep(0)
                      setCurrentSignalIndex(0)
                      startGeneration()
                    }}
                  >
                    Regenerate analysis
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                  >
                    Back to projects
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // In-progress state
  const activeStageIndex = ANALYSIS_STAGES.findIndex(
    (s) => s.id === machine.currentState
  )

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-background px-4">
      <main className="flex w-full max-w-4xl flex-col gap-8 py-10">
        {/* Header */}
        <header className="space-y-3 text-center">
          <h1 className="text-3xl font-semibold text-foreground">
            Analyzing your market
          </h1>
          <p className="text-base text-muted-foreground">
            Synthesizing live signals into differentiation you can act on.
          </p>
          <p className="text-xs text-muted-foreground">
            This usually takes 1–2 minutes depending on market complexity.
          </p>
        </header>

        {/* Progress timeline */}
        <div className="panel flex flex-col gap-8 p-8">
          <ol className="relative space-y-6" aria-label="Analysis progress">
            {ANALYSIS_STAGES.map((stage, index) => {
              const isCompleted = index < activeStageIndex
              const isCurrent = index === activeStageIndex
              const isUpcoming = index > activeStageIndex

              return (
                <li
                  key={stage.id}
                  className={cn(
                    'relative flex items-start gap-4 transition-opacity',
                    isUpcoming && 'opacity-50',
                    !prefersReducedMotion.current &&
                      isCurrent &&
                      'animate-pulse'
                  )}
                >
                  {/* Vertical line connector */}
                  {index < ANALYSIS_STAGES.length - 1 && (
                    <div
                      className={cn(
                        'absolute left-[11px] top-8 w-0.5 transition-colors',
                        isCompleted ? 'bg-primary' : 'bg-border'
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
                      {stage.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stage.description}
                    </div>
                    {isCurrent && machine.currentState === 'saving_artifacts' && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {SAVING_SUB_STEPS[currentSavingSubStep]}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>

          {/* "What's happening now" panel */}
          {currentStage && currentStage.signals && currentStage.signals.length > 0 && (
            <div className="border-t border-border pt-6">
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Signals we're looking for
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
                  {currentStage.signals[currentSignalIndex]}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Screen reader status */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {currentStage
            ? `Step ${activeStageIndex + 1} of ${ANALYSIS_STAGES.length}: ${currentStage.label}. ${currentStage.description}`
            : 'Analysis in progress'}
        </div>
      </main>
    </div>
  )
}

/**
 * Map backend progress phases to our state machine states
 */
function mapProgressPhaseToState(
  phase: string
): AnalysisRunState | null {
  const phaseLower = phase.toLowerCase()
  
  if (phaseLower.includes('load_input') || phaseLower.includes('starting')) {
    return 'starting'
  }
  if (phaseLower.includes('gathering') || phaseLower.includes('input')) {
    return 'gathering_inputs'
  }
  if (phaseLower.includes('competitor') || phaseLower.includes('snapshot')) {
    return 'analyzing_competitors'
  }
  if (phaseLower.includes('jobs') && !phaseLower.includes('validate')) {
    return 'deriving_jobs'
  }
  if (phaseLower.includes('scorecard') || phaseLower.includes('scoring')) {
    return 'scoring_positioning'
  }
  if (phaseLower.includes('opportunities') && !phaseLower.includes('validate')) {
    return 'ranking_opportunities'
  }
  if (phaseLower.includes('validate')) {
    return 'validating_outputs'
  }
  if (phaseLower.includes('save')) {
    return 'saving_artifacts'
  }
  if (phaseLower.includes('finalize')) {
    return 'finalizing'
  }
  
  return null
}

