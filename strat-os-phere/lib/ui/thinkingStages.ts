import type { AnalysisRunState } from '@/lib/results/runState'

/**
 * User-facing thinking stages for the "Thinking Mode" overlay
 * Maps backend phases to narrative stages
 */
export type ThinkingStageId =
  | 'gathering_inputs'
  | 'fetching_evidence'
  | 'extracting_facts'
  | 'comparing_competitors'
  | 'scoring_defensibility'
  | 'drafting_opportunities'
  | 'finalizing'

export interface ThinkingStage {
  id: ThinkingStageId
  title: string
  subtitle: string
}

export const THINKING_STAGES: ThinkingStage[] = [
  {
    id: 'gathering_inputs',
    title: 'Gathering inputs',
    subtitle: 'Scanning pricing, changelogs, reviews, and docs…',
  },
  {
    id: 'fetching_evidence',
    title: 'Fetching evidence',
    subtitle: 'Pulling out what competitors actually do today…',
  },
  {
    id: 'extracting_facts',
    title: 'Extracting key facts',
    subtitle: 'Identifying patterns and gaps in the market…',
  },
  {
    id: 'comparing_competitors',
    title: 'Comparing competitors',
    subtitle: 'Mapping capabilities and positioning…',
  },
  {
    id: 'scoring_defensibility',
    title: 'Scoring defensibility',
    subtitle: 'Evaluating which opportunities are defensible…',
  },
  {
    id: 'drafting_opportunities',
    title: 'Drafting opportunities',
    subtitle: 'Turning signals into defensible opportunities…',
  },
  {
    id: 'finalizing',
    title: 'Finalizing and saving',
    subtitle: 'Organizing findings for review…',
  },
]

/**
 * Map backend analysis phase to user-facing thinking stage
 * Returns null if phase cannot be mapped
 */
export function mapBackendPhaseToStage(
  phase: string | undefined,
  currentState?: AnalysisRunState
): ThinkingStageId | null {
  if (!phase && !currentState) return null

  const phaseLower = phase?.toLowerCase() || ''
  const state = currentState || ''

  // Direct mapping from backend phases/states to thinking stages
  if (
    phaseLower.includes('starting') ||
    phaseLower.includes('preparing') ||
    state === 'starting'
  ) {
    return 'gathering_inputs'
  }

  if (
    phaseLower.includes('gathering') ||
    phaseLower.includes('inputs') ||
    phaseLower.includes('evidence') ||
    phaseLower.includes('profiles') ||
    state === 'gathering_inputs' ||
    state === 'checking_profiles'
  ) {
    return 'fetching_evidence'
  }

  if (
    phaseLower.includes('extracting') ||
    phaseLower.includes('jobs') ||
    phaseLower.includes('deriving') ||
    state === 'deriving_jobs'
  ) {
    return 'extracting_facts'
  }

  if (
    phaseLower.includes('analyzing') ||
    phaseLower.includes('competitor') ||
    state === 'analyzing_competitors'
  ) {
    return 'comparing_competitors'
  }

  if (
    phaseLower.includes('scoring') ||
    phaseLower.includes('positioning') ||
    phaseLower.includes('defensibility') ||
    state === 'scoring_positioning'
  ) {
    return 'scoring_defensibility'
  }

  if (
    phaseLower.includes('ranking') ||
    phaseLower.includes('opportunities') ||
    phaseLower.includes('forming') ||
    phaseLower.includes('strategic') ||
    state === 'ranking_opportunities' ||
    state === 'forming_strategic_bets'
  ) {
    return 'drafting_opportunities'
  }

  if (
    phaseLower.includes('validating') ||
    phaseLower.includes('saving') ||
    phaseLower.includes('finalizing') ||
    phaseLower.includes('artifacts') ||
    state === 'validating_outputs' ||
    state === 'saving_artifacts' ||
    state === 'finalizing'
  ) {
    return 'finalizing'
  }

  // Default to first stage if unknown
  return 'gathering_inputs'
}

/**
 * Get thinking stage by ID
 */
export function getThinkingStage(id: ThinkingStageId): ThinkingStage {
  return THINKING_STAGES.find((stage) => stage.id === id) || THINKING_STAGES[0]
}

/**
 * Get stage index (0-based)
 */
export function getThinkingStageIndex(id: ThinkingStageId): number {
  return THINKING_STAGES.findIndex((stage) => stage.id === id)
}

/**
 * Get progress percentage based on stage index
 */
export function getStageProgress(id: ThinkingStageId): number {
  const index = getThinkingStageIndex(id)
  if (index === -1) return 0
  // Rough estimate: each stage is ~14% (100/7)
  return Math.min(95, Math.round(((index + 1) / THINKING_STAGES.length) * 100))
}

