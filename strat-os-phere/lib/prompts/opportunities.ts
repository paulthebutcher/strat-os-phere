// Prompt builder for Differentiation Opportunities (v2) generation.
// Used in the Results v2 pipeline to generate ranked, actionable opportunities.

import type { Message } from '@/lib/prompts/system'
import { getSystemStyleGuide } from '@/lib/prompts/system'
import type { ProjectContext } from '@/lib/prompts/snapshot'

export interface OpportunitiesPromptInput {
  project: ProjectContext
  snapshotsJson: string
  synthesisJson?: string
  jtbdJson?: string
}

export const OPPORTUNITIES_V2_SCHEMA_SHAPE = {
  meta: {
    generated_at: 'string (ISO 8601)',
    model: 'string (optional)',
    run_id: 'string (optional)',
  },
  opportunities: [
    {
      title: 'string (specific, non-buzzword)',
      type: 'product_capability | workflow | pricing_packaging | distribution | trust_compliance | integration | services',
      who_it_serves: 'string',
      job_link: 'string or number (optional, references JTBD index or id)',
      why_now: 'string (market trigger)',
      how_to_win: ['string (clear tactics)'],
      what_competitors_do_today: 'string (grounded in evidence)',
      why_they_cant_easily_copy: 'string (constraints, incentives, architecture, GTM)',
      effort: 'S | M | L', // Small, Medium, Large
      impact: 'low | med | high',
      confidence: 'low | med | high',
      score: 0, // integer 0-100 (will be computed, but include reasonable value)
      risks: ['string'],
      first_experiments: ['string (each must be concrete and testable in 1-2 weeks, at least 20 chars)'],
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

export function buildOpportunitiesMessages(
  input: OpportunitiesPromptInput
): Message[] {
  const { project, snapshotsJson, synthesisJson, jtbdJson } = input

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
    'Generate 5-10 ranked, actionable differentiation opportunities based on the competitive analysis.',
    'Each opportunity must be specific, non-buzzword-y, and grounded in evidence.',
    '',
    'PROJECT CONTEXT',
    projectLines.join('\n'),
    '',
    'COMPETITOR SNAPSHOTS',
    'The following is a JSON array of validated CompetitorSnapshot objects.',
    'Use these to understand what competitors do today and where gaps exist.',
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
    ...(jtbdJson
      ? [
          '',
          'JOBS TO BE DONE (OPTIONAL)',
          'Link opportunities to specific jobs where relevant using job_link field:',
          'JTBD_JSON_START',
          jtbdJson,
          'JTBD_JSON_END',
        ]
      : []),
    '',
    'OUTPUT SCHEMA',
    'You must output a JSON object that matches the following Opportunities schema shape (keys and nesting must match exactly):',
    stringifySchemaForPrompt(OPPORTUNITIES_V2_SCHEMA_SHAPE),
    '',
    'OUTPUT RULES',
    '1) Output a single JSON object only. No surrounding prose, labels, or explanations.',
    '2) Do not use markdown or backticks. Do not wrap the JSON in any kind of code fence.',
    '3) Use exactly the schema keys shown above. Do not add, remove, or rename keys.',
    '4) Use standard JSON syntax with double-quoted keys and string values.',
    '5) Generate 5-10 opportunities (no more, no less).',
    '',
    'CONTENT RULES - SPECIFICITY REQUIREMENTS',
    '',
    'BANNED VAGUE VERBS (DO NOT USE):',
    BANNED_VAGUE_VERBS.join(', '),
    '',
    'Title:',
    '- Must be specific and non-buzzword-y',
    '- Examples: "Real-time collaboration during code review", "One-click compliance report export", "Automated test case generation from requirements"',
    '- Avoid: "Better collaboration", "Enhanced productivity", "Streamlined workflows"',
    '',
    'Type:',
    '- product_capability: New feature or product functionality',
    '- workflow: Better way to organize work or processes',
    '- pricing_packaging: How pricing or packaging differs',
    '- distribution: How product is delivered or sold',
    '- trust_compliance: Security, compliance, or trust signals',
    '- integration: Integration with other tools',
    '- services: Services, support, or professional services',
    '',
    'Who it serves:',
    '- Specific segment, role, or buyer persona',
    '- Examples: "Engineering managers", "Compliance officers", "SMBs with <50 employees"',
    '',
    'Job link (optional):',
    '- Reference to a JTBD index or id if this opportunity addresses a specific job',
    '- Helps prioritize based on job importance',
    '',
    'Why now:',
    '- Market trigger or timing factor',
    '- Examples: "Shift to remote work exposed gaps", "New regulation requires X", "Competitor X just launched Y"',
    '- Be specific about the trigger',
    '',
    'How to win:',
    '- Clear, concrete tactics (array of strings)',
    '- Examples: "Build native Slack integration", "Offer 14-day free trial with full features", "Create visual diff viewer"',
    '- Avoid vague tactics like "improve UX" or "better marketing"',
    '',
    'What competitors do today:',
    '- Grounded in evidence from snapshots',
    '- Be specific: "Competitor A requires manual CSV export", "Competitor B charges per-user pricing starting at $50/user"',
    '- Avoid generalizations not backed by evidence',
    '',
    'Why they can\'t easily copy:',
    '- Constraints: Technical, regulatory, or organizational',
    '- Incentives: Their business model creates disincentives',
    '- Architecture: Their tech stack makes it hard',
    '- GTM: Their go-to-market doesn\'t support it',
    '- Be specific: "Their monolithic architecture makes real-time updates expensive", "Their enterprise sales model requires 6-month contracts"',
    '',
    'Effort:',
    '- S (Small): Can ship in 1-3 months',
    '- M (Medium): Can ship in 3-6 months',
    '- L (Large): Requires 6+ months',
    '',
    'Impact:',
    '- low: Small potential impact',
    '- med: Moderate potential impact',
    '- high: Large potential impact',
    '',
    'Confidence:',
    '- low: Lower confidence this will work',
    '- med: Moderate confidence',
    '- high: High confidence this will work',
    '',
    'Score (0-100):',
    '- Rough estimate of opportunity score (will be computed precisely later)',
    '- Consider impact, effort, confidence, and linked JTBD opportunity',
    '',
    'Risks:',
    '- Specific risks or assumptions',
    '- Examples: "Requires regulatory approval", "May cannibalize existing revenue", "Depends on partner API availability"',
    '',
    'First experiments (REQUIRED - at least 1):',
    '- MUST be concrete and testable in 1-2 weeks',
    '- Each must be at least 20 characters long',
    '- Examples: "Run 5 user interviews with compliance officers to validate pain point", "Build clickable prototype and test with 10 users", "Survey 50 customers about current workaround usage"',
    '- Avoid vague experiments like "research more" or "talk to users" (be specific about who and what)',
    '',
    'QUALITY STANDARDS',
    '- Every opportunity must be something a product team could start working on next week',
    '- Every opportunity must be defensible - explain why competitors can\'t easily copy',
    '- Prioritize opportunities that link to high-importance JTBDs',
    '- Avoid opportunities that are just "better version of existing feature" unless there\'s a clear defensible angle',
  ].join('\n')

  return [getSystemStyleGuide(), { role: 'user', content: userContent }]
}

