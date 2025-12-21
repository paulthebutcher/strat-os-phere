/**
 * State machine for analysis generation flow
 * Tracks the current stage and manages transitions
 */

import type { RunErrorState } from './runTypes'

export type AnalysisRunState =
  | 'idle'
  | 'starting'
  | 'gathering_inputs'
  | 'analyzing_competitors'
  | 'deriving_jobs'
  | 'scoring_positioning'
  | 'ranking_opportunities'
  | 'forming_strategic_bets'
  | 'validating_outputs'
  | 'saving_artifacts'
  | 'finalizing'
  | 'complete'
  | 'error'

export interface StageTimestamp {
  state: AnalysisRunState
  enteredAt: number
  exitedAt?: number
}

export interface AnalysisRunStateMachine {
  currentState: AnalysisRunState
  timestamps: StageTimestamp[]
  error: RunErrorState | null
  startedAt?: number
  completedAt?: number
}

/**
 * Create a new state machine instance
 */
export function createStateMachine(): AnalysisRunStateMachine {
  return {
    currentState: 'idle',
    timestamps: [],
    error: null,
  }
}

/**
 * Transition to a new state
 */
export function transitionTo(
  machine: AnalysisRunStateMachine,
  newState: AnalysisRunState
): AnalysisRunStateMachine {
  const now = Date.now()

  // Mark current state as exited
  if (machine.timestamps.length > 0) {
    const lastTimestamp = machine.timestamps[machine.timestamps.length - 1]
    if (!lastTimestamp.exitedAt) {
      lastTimestamp.exitedAt = now
    }
  }

  // Add new state timestamp
  const newTimestamp: StageTimestamp = {
    state: newState,
    enteredAt: now,
  }

  return {
    ...machine,
    currentState: newState,
    timestamps: [...machine.timestamps, newTimestamp],
    startedAt: machine.startedAt || (newState !== 'idle' ? now : undefined),
    completedAt: newState === 'complete' ? now : machine.completedAt,
  }
}

/**
 * Set error state
 */
export function setError(
  machine: AnalysisRunStateMachine,
  error: RunErrorState
): AnalysisRunStateMachine {
  return {
    ...transitionTo(machine, 'error'),
    error,
  }
}

/**
 * Get the index of the current state in the ordered stage list
 */
export function getStateIndex(state: AnalysisRunState): number {
  const orderedStates: AnalysisRunState[] = [
    'idle',
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
    'complete',
    'error',
  ]
  return orderedStates.indexOf(state)
}

/**
 * Check if a state is terminal
 */
export function isTerminalState(state: AnalysisRunState): boolean {
  return state === 'complete' || state === 'error'
}

