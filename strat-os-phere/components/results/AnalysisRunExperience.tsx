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
import { ThinkingModeOverlay } from '@/components/thinking/ThinkingModeOverlay'
import {
  mapBackendPhaseToStage,
  getStageProgress,
} from '@/lib/ui/thinkingStages'
import { paths } from '@/lib/routes'

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

  // Get latest progress message for display
  const latestProgressEntry = Array.from(latestProgressByPhase.values()).pop()
  const primaryMessage = latestProgressEntry?.message || undefined
  const secondaryMessage = latestProgressEntry?.detail || undefined

  // Map current state to thinking stage
  const thinkingStageId = mapBackendPhaseToStage(primaryMessage, machine.currentState)

  // Error state - use ThinkingModeOverlay
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

    // Build error message
    let errorMessage = error.message || 'Try again, or reduce competitors / evidence to speed things up.'
    if (isBlocked && isProfileGenerationError) {
      errorMessage = 'Add competitor profiles to continue. Check competitor evidence and try again.'
    } else if (hasPartialResults) {
      errorMessage = 'Some phases completed. Try again to finish the remaining steps.'
    }

    return (
      <ThinkingModeOverlay
        isOpen={true}
        error={{
          message: errorMessage,
          actionLabel: isBlocked && isProfileGenerationError ? 'Retry profile generation' : hasPartialResults ? 'Retry failed phase' : 'Try again',
          onAction: startGeneration,
        }}
      />
    )
  }

  // Complete state - use ThinkingModeOverlay
  if (machine.currentState === 'complete') {
    return (
      <ThinkingModeOverlay
        isOpen={true}
        completed={true}
        onViewResults={() => {
          onViewResults?.()
          router.push(`${paths.decision(projectId)}?new=true`)
          router.refresh()
        }}
      />
    )
  }

  // In-progress state - use ThinkingModeOverlay
  return (
    <ThinkingModeOverlay
      isOpen={true}
      stageId={thinkingStageId || undefined}
      currentState={machine.currentState}
      primaryMessage={primaryMessage}
      secondaryMessage={secondaryMessage}
      startedAt={machine.startedAt}
    />
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

