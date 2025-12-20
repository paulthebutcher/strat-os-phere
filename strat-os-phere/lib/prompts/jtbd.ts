// Prompt builder for Jobs To Be Done (JTBD) generation.
// Used in the Results v2 pipeline to generate actionable, specific jobs.

import type { Message } from '@/lib/prompts/system'
import { getSystemStyleGuide } from '@/lib/prompts/system'
import type { ProjectContext } from '@/lib/prompts/snapshot'

export interface JtbdPromptInput {
  project: ProjectContext
  snapshotsJson: string
  synthesisJson?: string
}

export const JTBD_SCHEMA_SHAPE = {
  meta: {
    generated_at: 'string (ISO 8601)',
    model: 'string (optional)',
    run_id: 'string (optional)',
  },
  jobs: [
    {
      job_statement: 'string (format: "When <context>, I want to <action>, so I can <outcome>.")',
      context: 'string',
      desired_outcomes: ['string (each must be measurable - include time, risk, cost, quality metrics)'],
      constraints: ['string'],
      current_workarounds: ['string'],
      non_negotiables: ['string'],
      who: 'string (persona shorthand, not demographic essay)',
      frequency: 'daily | weekly | monthly | rare',
      importance_score: 1, // integer 1-5
      satisfaction_score: 1, // integer 1-5
      opportunity_score: 0, // integer 0-100 (will be computed, but include reasonable value)
      evidence: [
        {
          competitor: 'string (optional)',
          citation: 'string (URL, optional)',
          quote: 'string (optional)',
        },
      ], // optional array
    },
  ],
} as const

function stringifySchemaForPrompt(schemaShape: unknown): string {
  return JSON.stringify(schemaShape, null, 2)
}

const BANNED_VAGUE_VERBS = [
  'optimize',
  'streamline',
  'leverage',
  'enhance',
  'improve',
  'better',
  'maximize',
  'minimize',
  'elevate',
  'amplify',
  'enable',
  'empower',
  'facilitate',
]

export function buildJtbdMessages(input: JtbdPromptInput): Message[] {
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
    'Generate 8-12 specific, actionable Jobs To Be Done (JTBD) based on the competitive analysis.',
    'Each job must be concrete, testable, and specific. Avoid vague business-speak.',
    '',
    'PROJECT CONTEXT',
    projectLines.join('\n'),
    '',
    'COMPETITOR SNAPSHOTS',
    'The following is a JSON array of validated CompetitorSnapshot objects.',
    'Use these to understand what jobs competitors are addressing or missing.',
    'SNAPSHOTS_JSON_START',
    snapshotsJson,
    'SNAPSHOTS_JSON_END',
    ...(synthesisJson
      ? [
          '',
          'MARKET SYNTHESIS (OPTIONAL)',
          'Additional market context and opportunities:',
          'SYNTHESIS_JSON_START',
          synthesisJson,
          'SYNTHESIS_JSON_END',
        ]
      : []),
    '',
    'OUTPUT SCHEMA',
    'You must output a JSON object that matches the following JTBD schema shape (keys and nesting must match exactly):',
    stringifySchemaForPrompt(JTBD_SCHEMA_SHAPE),
    '',
    'OUTPUT RULES',
    '1) Output a single JSON object only. No surrounding prose, labels, or explanations.',
    '2) Do not use markdown or backticks. Do not wrap the JSON in any kind of code fence.',
    '3) Use exactly the schema keys shown above. Do not add, remove, or rename keys.',
    '4) Use standard JSON syntax with double-quoted keys and string values.',
    '5) Generate 8-12 jobs (no more, no less).',
    '',
    'CONTENT RULES - SPECIFICITY REQUIREMENTS',
    '',
    'BANNED VAGUE VERBS (DO NOT USE):',
    BANNED_VAGUE_VERBS.join(', '),
    '',
    'Job statement format:',
    '- Must follow exact format: "When <context>, I want to <action>, so I can <outcome>."',
    '- context: What triggers this job? (e.g., "I receive a customer complaint", "a deadline approaches")',
    '- action: What concrete action? Use specific verbs like "send", "review", "approve", "compare", "track", "notify"',
    '- outcome: What measurable result? (e.g., "reduce response time by 50%", "avoid compliance fines")',
    '',
    'Desired outcomes (REQUIRED - at least 1 per job):',
    '- MUST be measurable. Include at least one of: time, risk, cost, quality metrics',
    '- Examples: "reduce processing time from 2 hours to 15 minutes", "reduce error rate to <1%", "cut costs by $X per transaction"',
    '- Avoid: "be more efficient" (vague), "save time" (not measurable)',
    '',
    'Context:',
    '- What situation or environment triggers this job?',
    '- Be specific about timing, circumstances, or triggers',
    '',
    'Constraints:',
    '- Budget limits, compliance requirements, workflow dependencies, technical constraints',
    '- Be concrete: "budget < $100k/year", "must comply with GDPR", "requires approval from 3 stakeholders"',
    '',
    'Current workarounds:',
    '- What do people do today to accomplish this job?',
    '- Be specific: "use Excel spreadsheets", "email back and forth", "manual copy-paste"',
    '',
    'Non-negotiables:',
    '- Must-haves that cannot be compromised',
    '- Be specific: "real-time updates", "must work offline", "integrates with Salesforce"',
    '',
    'Who:',
    '- Persona shorthand (e.g., "product manager", "compliance officer", "customer support rep")',
    '- NOT a demographic essay. One clear role.',
    '',
    'Frequency:',
    '- daily: happens every day',
    '- weekly: happens weekly',
    '- monthly: happens monthly',
    '- rare: happens occasionally (less than monthly)',
    '',
    'Scoring:',
    '- importance_score (1-5): How critical is this job? 5 = mission-critical, 1 = nice-to-have',
    '- satisfaction_score (1-5): How well is this job currently satisfied? 1 = very unsatisfied, 5 = very satisfied',
    '- opportunity_score (0-100): Rough estimate of opportunity (will be computed precisely later, but provide reasonable value)',
    '',
    'Evidence (optional):',
    '- Link back to competitor evidence if relevant',
    '- Include competitor name, citation URL, or quote if available',
    '',
    'QUALITY STANDARDS',
    '- Every job must be something you could test with users in a 1-2 week research sprint',
    '- Every job must be specific enough that two different analysts would agree on whether it was solved',
    '- If you find yourself using vague verbs, rewrite the job statement to be more concrete',
    '- Prioritize jobs that appear in multiple competitor contexts but are poorly addressed',
  ].join('\n')

  return [getSystemStyleGuide(), { role: 'user', content: userContent }]
}

