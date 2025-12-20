// Prompt builder for Competitive Scoring Matrix generation.
// Used in the Results v2 pipeline to create weighted scoring of competitors on evaluation criteria.

import type { Message } from '@/lib/prompts/system'
import { getSystemStyleGuide } from '@/lib/prompts/system'
import type { ProjectContext } from '@/lib/prompts/snapshot'

export interface ScoringPromptInput {
  project: ProjectContext
  snapshotsJson: string
  synthesisJson?: string
}

export const SCORING_MATRIX_SCHEMA_SHAPE = {
  meta: {
    generated_at: 'string (ISO 8601)',
    model: 'string (optional)',
    run_id: 'string (optional)',
  },
  criteria: [
    {
      id: 'string (unique identifier)',
      name: 'string',
      description: 'string',
      weight: 1, // integer 1-5 (higher = more important)
      how_to_score: 'string (rubric for scoring 1-5)',
    },
  ],
  scores: [
    {
      competitor_id: 'string (optional)',
      competitor_name: 'string',
      criteria_id: 'string',
      score: 1, // integer 1-5
      evidence: 'string (optional, quote or reference)',
    },
  ],
  summary: [
    {
      competitor_id: 'string (optional)',
      competitor_name: 'string',
      total_weighted_score: 0.0, // number 0-100
      strengths: ['string'],
      weaknesses: ['string'],
    },
  ],
  notes: 'string (optional)',
} as const

function stringifySchemaForPrompt(schemaShape: unknown): string {
  return JSON.stringify(schemaShape, null, 2)
}

export function buildScoringMessages(input: ScoringPromptInput): Message[] {
  const { project, snapshotsJson, synthesisJson } = input

  const projectLines: string[] = [
    `Market: ${project.market}`,
    `Target customer: ${project.target_customer}`,
  ]

  if (project.your_product) {
    projectLines.push(`Your product: ${project.your_product}`)
  }

  if (project.business_goal) {
    projectLines.push(`Business goal: ${project.business_goal}`)
  }

  if (project.geography) {
    projectLines.push(`Geography: ${project.geography}`)
  }

  const userContent = [
    'TASK',
    'Generate a competitive scoring matrix that evaluates each competitor on 6-10 key criteria that actually matter for buyers.',
    'Criteria should reflect what buyers genuinely care about when evaluating solutions in this market.',
    '',
    'PROJECT CONTEXT',
    projectLines.join('\n'),
    '',
    'COMPETITOR SNAPSHOTS',
    'The following is a JSON array of validated CompetitorSnapshot objects.',
    'Use these to score each competitor on each criterion.',
    'SNAPSHOTS_JSON_START',
    snapshotsJson,
    'SNAPSHOTS_JSON_END',
    ...(synthesisJson
      ? [
          '',
          'MARKET SYNTHESIS (OPTIONAL)',
          'Additional market context:',
          'SYNTHESIS_JSON_START',
          synthesisJson,
          'SYNTHESIS_JSON_END',
        ]
      : []),
    '',
    'OUTPUT SCHEMA',
    'You must output a JSON object that matches the following Scoring Matrix schema shape (keys and nesting must match exactly):',
    stringifySchemaForPrompt(SCORING_MATRIX_SCHEMA_SHAPE),
    '',
    'OUTPUT RULES',
    '1) Output a single JSON object only. No surrounding prose, labels, or explanations.',
    '2) Do not use markdown or backticks. Do not wrap the JSON in any kind of code fence.',
    '3) Use exactly the schema keys shown above. Do not add, remove, or rename keys.',
    '4) Use standard JSON syntax with double-quoted keys and string values.',
    '5) Generate 6-10 criteria (no more, no less).',
    '',
    'CONTENT RULES',
    '',
    'Criteria (6-10 items):',
    '- Each criterion must be something buyers actually evaluate when choosing a solution',
    '- Examples: "Ease of setup", "Real-time collaboration", "Enterprise security features", "Integration ecosystem", "Pricing transparency"',
    '- Avoid criteria that are too generic or not decision-relevant',
    '',
    'Criterion structure:',
    '- id: Unique identifier (e.g., "ease_of_setup", "real_time_collab")',
    '- name: Short name for the criterion',
    '- description: Clear description of what this criterion measures',
    '- weight (1-5): How important is this criterion? 5 = critical, 1 = nice-to-have',
    '  * Typical distribution: 1-2 criteria at weight 5, 2-3 at weight 4, rest at 3 or below',
    '- how_to_score: Rubric explaining how to score 1-5',
    '  * Example: "1 = very difficult/complex, 2 = somewhat difficult, 3 = neutral, 4 = somewhat easy, 5 = very easy"',
    '  * Example: "1 = none/very limited, 2 = limited, 3 = basic, 4 = good, 5 = excellent"',
    '',
    'Scores:',
    '- One score object per competitor per criterion',
    '- competitor_name: Must match a competitor_name from the input snapshots',
    '- criteria_id: Must match an id from the criteria array',
    '- score (1-5): Score for this competitor on this criterion',
    '  * 1 = poor/weak',
    '  * 2 = below average',
    '  * 3 = average/neutral',
    '  * 4 = above average',
    '  * 5 = excellent/strong',
    '- evidence (optional): Quote or reference from snapshots that supports the score',
    '',
    'Summary:',
    '- One summary object per competitor',
    '- competitor_name: Must match a competitor_name from the input snapshots',
    '- total_weighted_score (0-100): Weighted average score (will be computed, but provide reasonable value)',
    '  * Formula: Normalize weights, convert 1-5 scores to 0-100, then weighted sum',
    '- strengths: Array of strings describing what this competitor does well (based on scores)',
    '- weaknesses: Array of strings describing where this competitor is weak (based on scores)',
    '',
    'Notes (optional):',
    '- Any additional context about the scoring methodology or assumptions',
    '',
    'QUALITY STANDARDS',
    '- Criteria should reflect real buyer evaluation criteria, not abstract concepts',
    '- Scores must be grounded in evidence from the snapshots',
    '- If evidence is unclear for a score, it\'s better to mark it as average (3) than to guess',
    '- Weights should reflect what actually matters most to buyers in this market',
    '- Summary strengths/weaknesses should be specific and actionable, not generic',
  ].join('\n')

  return [getSystemStyleGuide(), { role: 'user', content: userContent }]
}

