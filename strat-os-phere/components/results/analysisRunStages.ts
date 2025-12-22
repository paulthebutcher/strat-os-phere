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
    label: 'Identifying where competitors are vulnerable',
    description:
      "Mapping each competitor's current positioning, capabilities, and gaps.",
    signals: [
      'Competitor positioning claims',
      'Implicit optimization patterns',
      'Information gaps and ambiguities',
    ],
  },
  {
    id: 'gathering_inputs',
    label: 'Scanning pricing, positioning, and hiring signals',
    description:
      'Collecting live evidence from recent product updates, reviews, and market activity.',
    signals: [
      'Competitor positioning claims',
      'Implicit optimization patterns',
      'Information gaps and ambiguities',
    ],
  },
  {
    id: 'analyzing_competitors',
    label: 'Mapping competitor capabilities',
    description:
      'Evaluating what each competitor can and cannot do, and where they overlap.',
    signals: [
      'Capability overlaps versus true differences',
      'Feature gaps masked by similar language',
      'Convergence patterns in the market',
    ],
  },
  {
    id: 'deriving_jobs',
    label: 'Extracting real customer struggles',
    description:
      'Translating competitive behavior into concrete jobs customers need to accomplish.',
    signals: [
      'Customer workarounds in use',
      'Partially-served jobs',
      'Compromise moments',
    ],
  },
  {
    id: 'scoring_positioning',
    label: 'Stress-testing opportunity defensibility',
    description:
      'Evaluating which opportunities are defensible and which competitors can easily copy.',
    signals: [
      'Assumed but unsupported strengths',
      'Compounding friction points',
      'Differentiating criteria',
    ],
  },
  {
    id: 'ranking_opportunities',
    label: 'Synthesizing signals into strategic options',
    description:
      'Ranking opportunities by impact, effort, and competitive moat strength.',
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
      'Converting opportunities into decision-ready commitments with explicit tradeoffs.',
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

