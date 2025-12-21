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
  const [latestProgressByPhase, setLatestProgressByPhase] = useState<
    Map<string, { message: string; detail?: string; meta?: unknown }>
  >(new Map())
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
          const phase = data.phase as string
          const status = data.status as 'started' | 'progress' | 'completed' | 'failed' | 'blocked' | undefined

          // Store latest progress event per phase for substep display
          setLatestProgressByPhase((prev) => {
            const next = new Map(prev)
            next.set(phase, {
              message: data.message || '',
              detail: data.detail,
              meta: data.meta,
            })
            return next
          })

          // Only transition state machine on phase start or completion
          // For 'progress' status, we update the display but don't create duplicate phases
          if (status === 'started' || status === 'completed') {
            const mappedState = mapProgressPhaseToState(phase)
            if (mappedState) {
              setMachine((m) => transitionTo(m, mappedState))
            }
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
            const isBlocked = data.status === 'blocked' || 
                            data.error?.code === 'MISSING_COMPETITOR_PROFILES' ||
                            data.error?.code === 'NO_SNAPSHOTS'
            eventSource.close()
            eventSourceRef.current = null
            if (simulatorIntervalRef.current) {
              clearInterval(simulatorIntervalRef.current)
            }
            setMachine((m) =>
              setError(m, {
                message: data.error?.message || (isBlocked ? 'Generation paused' : 'Generation failed'),
                technicalDetails: data.error?.code,
                isBlocked,
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
        const isBlocked = result.error?.code === 'MISSING_COMPETITOR_PROFILES' ||
                         result.error?.code === 'NO_SNAPSHOTS'
        setMachine((m) =>
          setError(m, {
            message: result.error?.message || (isBlocked ? 'Generation paused' : 'Generation failed'),
            technicalDetails: result.error?.code,
            isBlocked,
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
      'forming_strategic_bets',
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
    const isBlocked = machine.error?.isBlocked ?? false
    const errorCode = machine.error?.technicalDetails
    const isMissingProfiles = errorCode === 'MISSING_COMPETITOR_PROFILES' || errorCode === 'NO_SNAPSHOTS'
    
    // Determine which phases completed based on timestamps
    const completedPhases = machine.timestamps
      .filter((ts) => ts.state !== 'error' && ts.state !== 'idle')
      .map((ts) => ts.state)
    
    const hasPartialResults = completedPhases.length > 0

    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-background px-4">
        <main className="flex w-full max-w-2xl flex-col gap-6">
          <div className="panel flex flex-col gap-6 p-8">
            <div className="flex items-start gap-4">
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                isBlocked ? "bg-orange-500/10" : "bg-destructive/10"
              )}>
                <AlertCircle className={cn(
                  "h-5 w-5",
                  isBlocked ? "text-orange-600" : "text-destructive"
                )} />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">
                    {isBlocked && isMissingProfiles
                      ? 'Analysis paused — competitor profiles missing'
                      : hasPartialResults
                      ? 'Analysis partially completed'
                      : 'Something interrupted the analysis'}
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {machine.error?.message ||
                      `We weren't able to complete this run. Your inputs are safe, and nothing was lost.`}
                  </p>
                  {isBlocked && isMissingProfiles && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Competitor profiles are the foundation for analysis. Please generate profiles before running the full pipeline.
                    </p>
                  )}
                </div>

                {hasPartialResults && !isBlocked && (
                  <div className="rounded-md border border-border bg-muted/50 p-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Completed phases:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {completedPhases.map((phase, idx) => {
                        const stage = getStageConfig(phase)
                        return (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-primary" />
                            {stage?.label || phase}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

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
                  {isBlocked && isMissingProfiles ? (
                    <>
                      <Button
                        onClick={() => {
                          router.push(`/projects/${projectId}/competitors`)
                          router.refresh()
                        }}
                      >
                        Generate competitor profiles
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/projects/${projectId}`)}
                      >
                        Back to project
                      </Button>
                    </>
                  ) : (
                    <>
                      {hasPartialResults && !isBlocked && (
                        <Button
                          onClick={() => {
                            router.push(`/projects/${projectId}/results?view=results`)
                            router.refresh()
                          }}
                        >
                          Continue with partial results
                        </Button>
                      )}
                      {!isBlocked && (
                        <Button onClick={startGeneration}>
                          {hasPartialResults ? 'Retry failed phase' : 'Try again'}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => router.push(`/projects/${projectId}`)}
                      >
                        Back to project
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Complete state - Intentional action required
  if (machine.currentState === 'complete') {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-background px-4">
        <main className="flex w-full max-w-2xl flex-col gap-8">
          <div className="border border-border bg-surface p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-foreground">
                  Analysis complete
                </h1>
                <p className="text-sm text-muted-foreground">
                  Strategic bets, opportunities, scorecard, and jobs are ready for review.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => {
                    onViewResults?.()
                    router.push(`/projects/${projectId}/results?view=results&tab=strategic_bets&new=true`)
                    router.refresh()
                  }}
                  className="w-full sm:w-auto"
                >
                  View full analysis
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="w-full sm:w-auto"
                >
                  Back to dashboard
                </Button>
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
      <main className="flex w-full max-w-3xl flex-col gap-10 py-12">
        {/* Header - Minimal, progress is the main event */}
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Generating analysis
          </h1>
          <p className="text-sm text-muted-foreground">
            This usually takes 1–2 minutes.
          </p>
        </header>

        {/* Progress timeline - Main event */}
        <div className="border border-border bg-surface">
          <ol className="divide-y divide-border" aria-label="Analysis progress">
            {ANALYSIS_STAGES.map((stage, index) => {
              const isCompleted = index < activeStageIndex
              const isCurrent = index === activeStageIndex
              const isUpcoming = index > activeStageIndex

              return (
                <li
                  key={stage.id}
                  className={cn(
                    'relative flex items-start gap-4 px-6 py-5 transition-colors',
                    isCurrent && 'bg-surface-muted/50',
                    isUpcoming && 'opacity-60'
                  )}
                >
                  {/* Status indicator */}
                  <div className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                    {isCompleted ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check
                          className="h-3 w-3 text-primary-foreground"
                          aria-hidden="true"
                        />
                      </div>
                    ) : isCurrent ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary">
                        <Loader2
                          className={cn(
                            'h-3 w-3 text-primary',
                            !prefersReducedMotion.current && 'animate-spin'
                          )}
                          aria-hidden="true"
                        />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-border bg-background" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 space-y-1">
                    <div
                      className={cn(
                        'text-sm font-semibold',
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
  if (phaseLower.includes('evidence_quality_check') || phaseLower.includes('evidence_quality')) {
    return 'gathering_inputs'
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
  if (phaseLower.includes('strategic_bets') && !phaseLower.includes('validate')) {
    return 'forming_strategic_bets'
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

