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
    label: 'Preparing your analysis',
    description:
      'We're setting up the analytical framework and validating your inputs before diving in.',
  },
  {
    id: 'gathering_inputs',
    label: 'Grounding in your context',
    description:
      'We're anchoring the analysis in your goals, competitors, and the evidence you've provided.',
    signals: [
      'What each competitor explicitly claims to do',
      'What they implicitly optimize for',
      'Where information is vague or missing',
    ],
  },
  {
    id: 'analyzing_competitors',
    label: 'Understanding what competitors actually offer',
    description:
      'We're separating positioning from reality by looking at features, constraints, pricing signals, and customer language.',
    signals: [
      'Capability overlaps vs. true differences',
      'Feature gaps hidden behind similar language',
      'Patterns competitors converge on',
    ],
  },
  {
    id: 'deriving_jobs',
    label: 'Deriving real Jobs to be Done',
    description:
      'We're translating competitor behavior into concrete jobs customers are trying to accomplish — without buzzwords or abstraction.',
    signals: [
      'Workarounds customers rely on',
      'Jobs competitors partially serve',
      'Moments where customers compromise',
    ],
  },
  {
    id: 'scoring_positioning',
    label: 'Scoring competitive positioning',
    description:
      'We're evaluating how well each competitor supports those jobs across key dimensions that actually matter in practice.',
    signals: [
      'Where strength is assumed but unsupported',
      'Where small gaps compound into real friction',
      'Which criteria truly differentiate outcomes',
    ],
  },
  {
    id: 'ranking_opportunities',
    label: 'Identifying differentiation opportunities',
    description:
      'We're isolating opportunities where a new or improved product could meaningfully outperform what exists today.',
    signals: [
      'Jobs that matter but are underserved',
      'Opportunities competitors can't easily copy',
      'Leverage points for first experiments',
    ],
  },
  {
    id: 'validating_outputs',
    label: 'Pressure-testing the results',
    description:
      'We're checking for internal consistency, specificity, and actionability — and removing anything hand-wavy.',
  },
  {
    id: 'saving_artifacts',
    label: 'Saving your analysis',
    description:
      'This ensures your results stay consistent and reusable.',
  },
  {
    id: 'finalizing',
    label: 'Preparing your highlights',
    description:
      "We're organizing the findings so you can quickly understand what matters — and what to do next.",
  },
]

/**
 * Sub-steps for saving_artifacts stage
 */
export const SAVING_SUB_STEPS = [
  'Saving Jobs to your workspace…',
  'Saving Scorecard…',
  'Saving Opportunities…',
  'Linking evidence and citations…',
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

