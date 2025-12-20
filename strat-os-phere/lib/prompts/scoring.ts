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
      how_to_score: 'string (rubric for scoring dimensions)',
    },
  ],
  scores: [
    {
      competitor_id: 'string (optional)',
      competitor_name: 'string',
      criteria_id: 'string',
      dimensions: {
        discovery_support: 0.0, // number 0.0-1.0 (continuous scale)
        execution_support: 0.0, // number 0.0-1.0 (continuous scale)
        reliability: 0.0, // number 0.0-1.0 (continuous scale)
        flexibility: 0.0, // number 0.0-1.0 (continuous scale)
        friction: 0.0, // number 0.0-1.0 (continuous scale, will be inverted: lower friction = better)
      },
      evidence: 'string (optional, quote or reference)',
    },
  ],
  summary: [
    {
      competitor_id: 'string (optional)',
      competitor_name: 'string',
      total_weighted_score: 0.0, // number 0-100 (will be computed, but include reasonable value)
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
    '- how_to_score: Rubric explaining the dimension scoring approach',
    '',
    'Dimension Scores (REQUIRED - use continuous 0.0-1.0 scale, NOT boolean or integer):',
    '- One score object per competitor per criterion',
    '- competitor_name: Must match a competitor_name from the input snapshots',
    '- criteria_id: Must match an id from the criteria array',
    '- dimensions: Object containing five dimension scores, each on a continuous 0.0-1.0 scale',
    '  * discovery_support (0.0-1.0): How well does this competitor help users discover/find this capability?',
    '    - 0.0 = not supported at all, not discoverable',
    '    - 0.3 = weak/indirect support, hard to find',
    '    - 0.6 = partial but usable support, moderately discoverable',
    '    - 0.9 = strong, first-class support, easily discoverable',
    '    - 1.0 = excellent, prominently featured',
    '  * execution_support (0.0-1.0): How well does this competitor support actually doing/executing this capability?',
    '    - 0.0 = not supported at all',
    '    - 0.3 = weak/partial support, significant gaps',
    '    - 0.6 = partial but usable support',
    '    - 0.9 = strong, first-class support',
    '    - 1.0 = excellent, best-in-class execution',
    '  * reliability (0.0-1.0): How reliable/consistent is this capability?',
    '    - 0.0 = unreliable, frequent issues',
    '    - 0.3 = somewhat unreliable',
    '    - 0.6 = generally reliable with occasional issues',
    '    - 0.9 = highly reliable',
    '    - 1.0 = extremely reliable, rock-solid',
    '  * flexibility (0.0-1.0): How flexible/customizable is this capability?',
    '    - 0.0 = rigid, no customization',
    '    - 0.3 = limited flexibility',
    '    - 0.6 = moderate flexibility',
    '    - 0.9 = highly flexible',
    '    - 1.0 = extremely flexible, fully customizable',
    '  * friction (0.0-1.0): How much friction/effort is required to use this capability?',
    '    - 0.0 = no friction, effortless (this is ideal)',
    '    - 0.3 = low friction',
    '    - 0.6 = moderate friction',
    '    - 0.9 = high friction, requires significant effort',
    '    - 1.0 = extremely high friction, very difficult to use',
    '    - NOTE: Friction is inverted during aggregation (lower friction = better score)',
    '',
    'CRITICAL: Use continuous numeric scores (0.0, 0.15, 0.42, 0.67, 0.83, etc.), NOT boolean (true/false) or integer-only values.',
    'CRITICAL: Do NOT round to 0.0, 0.5, or 1.0. Use the full 0.0-1.0 range with appropriate precision (1-2 decimal places).',
    'CRITICAL: Scores should feel continuous and nuanced (e.g., 0.62, 0.74, 0.81), not binary.',
    '',
    '- evidence (optional): Quote or reference from snapshots that supports the dimension scores',
    '',
    'Summary:',
    '- One summary object per competitor',
    '- competitor_name: Must match a competitor_name from the input snapshots',
    '- total_weighted_score (0-100): Weighted average score (will be computed, but provide reasonable value)',
    '  * Formula: Aggregate dimension scores per criterion, normalize weights, convert to 0-100, then weighted sum',
    '- strengths: Array of strings describing what this competitor does well (based on dimension scores)',
    '- weaknesses: Array of strings describing where this competitor is weak (based on dimension scores)',
    '',
    'Notes (optional):',
    '- Any additional context about the scoring methodology or assumptions',
    '',
    'QUALITY STANDARDS',
    '- Criteria should reflect real buyer evaluation criteria, not abstract concepts',
    '- Dimension scores must be grounded in evidence from the snapshots',
    '- If evidence is unclear for a dimension, use a moderate score (0.4-0.6) rather than guessing',
    '- Use the full 0.0-1.0 range where appropriate - avoid clustering scores around 0.0, 0.5, or 1.0',
    '- Weights should reflect what actually matters most to buyers in this market',
    '- Summary strengths/weaknesses should be specific and actionable, not generic',
    '- Score each dimension independently - they may vary independently (e.g., high discovery but low flexibility)',
  ].join('\n')

  return [getSystemStyleGuide(), { role: 'user', content: userContent }]
}

