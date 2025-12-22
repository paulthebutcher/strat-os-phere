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
import type { RunErrorState } from '@/lib/results/runTypes'
import { getErrorKindFromCode } from '@/lib/results/runTypes'
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

          // Handle blocked or failed status - transition to error state
          if (status === 'blocked' || status === 'failed') {
            const mappedState = mapProgressPhaseToState(phase)
            if (mappedState) {
              // Transition to the blocked/failed phase first, then error
              setMachine((m) => {
                const withState = transitionTo(m, mappedState)
                // Determine error kind from phase and code
                const isProfileError = phase === 'competitor_profiles' || 
                  data.error?.code === 'SNAPSHOT_VALIDATION_FAILED' ||
                  data.error?.code === 'NO_COMPETITORS'
                const errorKind = status === 'blocked' || isProfileError ? 'blocked' as const : 'failed' as const
                const error: RunErrorState = {
                  kind: errorKind,
                  message: data.message || (status === 'blocked' ? 'Generation paused' : 'Generation failed'),
                  technicalDetails: data.error?.code || phase,
                  code: data.error?.code,
                }
                return setError(withState, error)
              })
            }
            return
          }

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
            // Determine error kind from status or error code
            const kind = data.status === 'blocked' 
              ? 'blocked' as const
              : getErrorKindFromCode(data.error?.code)
            
            eventSource.close()
            eventSourceRef.current = null
            if (simulatorIntervalRef.current) {
              clearInterval(simulatorIntervalRef.current)
            }
            // Format diagnostic details for display
            const details = data.error?.details || {}
            let diagnosticInfo: string | undefined
            const errorCode = data.error?.code
            if (kind === 'blocked' && (
              errorCode === 'MISSING_COMPETITOR_PROFILES' || 
              errorCode === 'NO_SNAPSHOTS' ||
              errorCode === 'SNAPSHOT_VALIDATION_FAILED' ||
              errorCode === 'NO_COMPETITORS'
            )) {
              if (errorCode === 'SNAPSHOT_VALIDATION_FAILED') {
                const competitorName = details.competitorName as string | undefined
                diagnosticInfo = competitorName 
                  ? `Failed to validate snapshot for "${competitorName}". Check competitor evidence.`
                  : 'Failed to validate competitor snapshot. Check competitor evidence.'
              } else if (errorCode === 'NO_COMPETITORS') {
                diagnosticInfo = 'No competitors found. Add at least one competitor to run analysis.'
              } else {
                const competitorCount = details.competitorCount as number | undefined
                const profilesCount = details.profilesFoundCount as number | undefined
                const foundTypes = details.foundTypes as string[] | undefined
                diagnosticInfo = `Found ${competitorCount ?? '?'} competitors, ${profilesCount ?? 0} profile artifact(s)${foundTypes && foundTypes.length > 0 ? `. Types found: ${foundTypes.join(', ')}` : ''}`
              }
            }
            
            const error: RunErrorState = {
              kind,
              message: data.error?.message || (kind === 'blocked' ? 'Generation paused' : 'Generation failed'),
              technicalDetails: diagnosticInfo || data.error?.code,
              code: data.error?.code,
            }
            setMachine((m) => setError(m, error))
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
        const kind = getErrorKindFromCode(result.error?.code)
        const error: RunErrorState = {
          kind,
          message: result.error?.message || (kind === 'blocked' ? 'Generation paused' : 'Generation failed'),
          technicalDetails: result.error?.code,
          code: result.error?.code,
        }
        setMachine((m) => setError(m, error))
      }
    } catch (err) {
      const error: RunErrorState = {
        kind: 'failed',
        message:
          err instanceof Error
            ? err.message
            : 'Unexpected error while generating results.',
      }
      setMachine((m) => setError(m, error))
    }
  }

  // Time-based simulator for stages (fallback if EventSource fails)
  const startSimulator = () => {
    const stages: AnalysisRunState[] = [
      'starting',
      'checking_profiles',
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
    const error = machine.error
    if (!error) {
      // Should not happen, but handle defensively
      return null
    }

    const errorCode = error.technicalDetails || error.code
    const isProfileGenerationError = 
      errorCode === 'MISSING_COMPETITOR_PROFILES' || 
      errorCode === 'NO_SNAPSHOTS' ||
      errorCode === 'SNAPSHOT_VALIDATION_FAILED' ||
      errorCode === 'NO_COMPETITORS'
    const isBlocked = error.kind === 'blocked' || errorCode === 'SNAPSHOT_VALIDATION_FAILED' || errorCode === 'NO_COMPETITORS'
    
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
                    {isBlocked && isProfileGenerationError
                      ? 'You're partway there'
                      : hasPartialResults
                      ? 'You're partway there'
                      : 'Something interrupted the analysis'}
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {isBlocked && isProfileGenerationError
                      ? 'We\'ve identified the opportunity space and initial signals. Add competitor profiles to pressure-test defensibility and confidence.'
                      : hasPartialResults
                      ? 'We\'ve completed some phases of the analysis. Review what\'s ready below, then retry to finish the remaining steps.'
                      : error.message ||
                        `We weren't able to complete this run. Your inputs are safe, and nothing was lost.`}
                  </p>
                </div>

                {hasPartialResults && !isBlocked && (
                  <div className="rounded-md border border-border bg-muted/50 p-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                      ✓ What's already complete:
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
                    <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                      <span className="font-medium text-foreground">What's needed next:</span> Retry to complete the remaining analysis phases.
                    </p>
                  </div>
                )}

                {/* Diagnostic details for profile generation error */}
                {isBlocked && isProfileGenerationError && error.technicalDetails && (
                  <div className="rounded-md border border-border bg-muted/50 p-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Why this step matters:
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Competitor profiles help us identify vulnerabilities and defensibility gaps. Without them, we can't fully assess which opportunities are worth pursuing.
                    </p>
                    <p className="text-sm font-medium text-foreground mb-2">
                      Diagnostic information:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {error.technicalDetails.includes('Found') 
                        ? error.technicalDetails 
                        : error.code === 'SNAPSHOT_VALIDATION_FAILED'
                        ? 'Failed to validate competitor snapshot. Check competitor evidence and try again.'
                        : error.code === 'NO_COMPETITORS'
                        ? 'No competitors found. Add at least one competitor to run analysis.'
                        : 'Profile generation failed. Check competitor data and try again.'}
                    </p>
                  </div>
                )}

                {/* Dev-only debug panel */}
                {process.env.NODE_ENV === 'development' && error.technicalDetails && (
                  <details className="rounded-md border border-border bg-muted/50 p-3">
                    <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                      Debug details (dev only)
                    </summary>
                    <div className="mt-2 space-y-2">
                      <p className="text-xs font-mono text-muted-foreground">
                        Code: {error.code || 'N/A'}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">
                        Details: {error.technicalDetails}
                      </p>
                    </div>
                  </details>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  {isBlocked && isProfileGenerationError ? (
                    <>
                      <Button
                        onClick={startGeneration}
                      >
                        Retry profile generation
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          router.push(`/projects/${projectId}/competitors`)
                          router.refresh()
                        }}
                      >
                        Edit competitors
                      </Button>
                      <Button
                        variant="ghost"
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
                  Strategic bets, opportunities, scorecard, and jobs are ready for review. Each insight includes citation-backed evidence and confidence-weighted scores.
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
 * This ensures the UI progress list matches the backend pipeline phases
 */
function mapProgressPhaseToState(
  phase: string
): AnalysisRunState | null {
  const phaseLower = phase.toLowerCase()
  
  // Exact phase matches take precedence
  if (phaseLower === 'load_input') {
    return 'starting'
  }
  if (phaseLower === 'competitor_profiles') {
    return 'checking_profiles'
  }
  if (phaseLower === 'evidence_quality_check') {
    return 'gathering_inputs'
  }
  if (phaseLower === 'jobs_generate' || phaseLower === 'jobs_validate') {
    return 'deriving_jobs'
  }
  if (phaseLower === 'scorecard_generate' || phaseLower === 'scorecard_validate') {
    return 'scoring_positioning'
  }
  if (phaseLower === 'opportunities_generate' || phaseLower === 'opportunities_validate') {
    return 'ranking_opportunities'
  }
  if (phaseLower === 'strategic_bets_generate' || phaseLower === 'strategic_bets_validate') {
    return 'forming_strategic_bets'
  }
  if (phaseLower === 'scoring_compute') {
    return 'validating_outputs'
  }
  if (phaseLower === 'save_artifacts') {
    return 'saving_artifacts'
  }
  if (phaseLower === 'finalize') {
    return 'finalizing'
  }
  
  // Fallback to fuzzy matching for backwards compatibility
  if (phaseLower.includes('starting') || phaseLower.includes('load')) {
    return 'starting'
  }
  if (phaseLower.includes('profiles')) {
    return 'checking_profiles'
  }
  if (phaseLower.includes('evidence')) {
    return 'gathering_inputs'
  }
  if (phaseLower.includes('competitor') || phaseLower.includes('snapshot')) {
    return 'analyzing_competitors'
  }
  if (phaseLower.includes('jobs')) {
    return 'deriving_jobs'
  }
  if (phaseLower.includes('scorecard') || phaseLower.includes('scoring')) {
    return 'scoring_positioning'
  }
  if (phaseLower.includes('opportunities')) {
    return 'ranking_opportunities'
  }
  if (phaseLower.includes('strategic_bets') || phaseLower.includes('bets')) {
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

