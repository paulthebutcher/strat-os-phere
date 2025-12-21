/**
 * Stage configuration for analysis generation
 * Contains labels, descriptions, and signal templates for each stage
 */

import type { AnalysisRunState } from '@/lib/results/runState'

export interface StageConfig {
  id: AnalysisRunState
  label: string
  description: string
  signals?: string[] // Rotating signal templates for "What's happening now" panel
}

export const ANALYSIS_STAGES: StageConfig[] = [
  {
    id: 'starting',
    label: 'Preparing analysis',
    description:
      'Validating inputs and preparing analytical framework.',
  },
  {
    id: 'checking_profiles',
    label: 'Generating competitor profiles',
    description:
      'Summarizing what each competitor offers today, with citations.',
  },
  {
    id: 'gathering_inputs',
    label: 'Reviewing live competitor signals',
    description:
      'Collecting and organizing evidence from competitors, market data, and customer signals.',
    signals: [
      'Competitor positioning claims',
      'Implicit optimization patterns',
      'Information gaps and ambiguities',
    ],
  },
  {
    id: 'analyzing_competitors',
    label: 'Analyzing competitive landscape',
    description:
      'Evaluating capabilities, constraints, and differentiation across competitors.',
    signals: [
      'Capability overlaps versus true differences',
      'Feature gaps masked by similar language',
      'Convergence patterns in the market',
    ],
  },
  {
    id: 'deriving_jobs',
    label: 'Extracting customer jobs and struggles',
    description:
      'Translating competitive behavior into concrete customer jobs.',
    signals: [
      'Customer workarounds in use',
      'Partially-served jobs',
      'Compromise moments',
    ],
  },
  {
    id: 'scoring_positioning',
    label: 'Scoring competitive capabilities',
    description:
      'Evaluating competitive positioning across dimensions that matter.',
    signals: [
      'Assumed but unsupported strengths',
      'Compounding friction points',
      'Differentiating criteria',
    ],
  },
  {
    id: 'ranking_opportunities',
    label: 'Identifying differentiation opportunities',
    description:
      'Identifying and scoring opportunities for meaningful differentiation.',
    signals: [
      'Underserved high-importance jobs',
      'Opportunities with competitive moats',
      'First experiment leverage points',
    ],
  },
  {
    id: 'forming_strategic_bets',
    label: 'Forming strategic bets',
    description:
      'Converting opportunities into decision-ready commitments.',
    signals: [
      'Explicit tradeoffs and constraints',
      'Required capabilities',
      'Falsifiable experiments',
    ],
  },
  {
    id: 'validating_outputs',
    label: 'Validating outputs',
    description:
      'Checking consistency, specificity, and actionability.',
  },
  {
    id: 'saving_artifacts',
    label: 'Saving artifacts',
    description:
      'Persisting analysis results to your workspace.',
  },
  {
    id: 'finalizing',
    label: 'Finalizing recommendations',
    description:
      'Organizing findings for review.',
  },
]

/**
 * Sub-steps for saving_artifacts stage
 */
export const SAVING_SUB_STEPS = [
  'Saving Jobs…',
  'Saving Scorecard…',
  'Saving Opportunities…',
  'Saving Strategic Bets…',
] as const

/**
 * Get stage config by state ID
 */
export function getStageConfig(state: AnalysisRunState): StageConfig | undefined {
  return ANALYSIS_STAGES.find((stage) => stage.id === state)
}

/**
 * Get all stages up to and including the current state
 */
export function getStagesUpTo(state: AnalysisRunState): StageConfig[] {
  const stateIndex = ANALYSIS_STAGES.findIndex((s) => s.id === state)
  if (stateIndex === -1) return []
  return ANALYSIS_STAGES.slice(0, stateIndex + 1)
}

