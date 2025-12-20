// Prompt builder for Strategic Bets generation.
// Used in the Results v2 pipeline to generate decision-ready commitments under constraint.

import type { Message } from '@/lib/prompts/system'
import { getSystemStyleGuide } from '@/lib/prompts/system'
import type { ProjectContext } from '@/lib/prompts/snapshot'

export interface StrategicBetsPromptInput {
  project: ProjectContext
  snapshotsJson: string
  synthesisJson?: string
  jtbdJson?: string
  opportunitiesJson?: string
  scoringJson?: string
}

export const STRATEGIC_BETS_SCHEMA_SHAPE = {
  meta: {
    generated_at: 'string (ISO 8601)',
    model: 'string (optional)',
    run_id: 'string (optional)',
  },
  bets: [
    {
      id: 'string (unique identifier, e.g., "bet-1")',
      title: 'string (specific, non-buzzword)',
      confidence: 'high | medium | low',
      bet_statement: 'string (1 sentence, assertive, must end with . or !)',
      tradeoffs: ['string (each must explicitly state what we say no to)'],
      forced_capability: 'string (specific capability this bet forces us to build)',
      competitor_constraints: ['string (structural constraints: pricing, customers, architecture, business model)'],
      disconfirming_experiment: {
        experiment: 'string (concrete, falsifiable test)',
        success_signal: 'string (what would indicate this bet is working)',
        failure_signal: 'string (what would indicate this bet is failing)',
      },
      meta: {
        based_on_competitors: 0, // number of competitors this bet is based on
        signals_used: ['string'], // list of signals/sources used
        created_at: 'string (ISO 8601)',
      },
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

export function buildStrategicBetsMessages(
  input: StrategicBetsPromptInput
): Message[] {
  const { project, snapshotsJson, synthesisJson, jtbdJson, opportunitiesJson, scoringJson } = input

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
    'Generate 2-3 strategic bets that convert opportunities into explicit, decision-ready commitments under constraint.',
    'Each bet must be opinionated, uncomfortable in a good way, and force real product decisions.',
    '',
    'PROJECT CONTEXT',
    projectLines.join('\n'),
    '',
    'COMPETITOR SNAPSHOTS',
    'The following is a JSON array of validated CompetitorSnapshot objects.',
    'Use these to understand competitive constraints and structural limitations.',
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
          'Use these to prioritize bets based on job importance:',
          'JTBD_JSON_START',
          jtbdJson,
          'JTBD_JSON_END',
        ]
      : []),
    ...(opportunitiesJson
      ? [
          '',
          'OPPORTUNITIES (OPTIONAL)',
          'Use these opportunities to inform strategic bets:',
          'OPPORTUNITIES_JSON_START',
          opportunitiesJson,
          'OPPORTUNITIES_JSON_END',
        ]
      : []),
    ...(scoringJson
      ? [
          '',
          'SCORING MATRIX (OPTIONAL)',
          'Use competitor scores to identify strategic constraints:',
          'SCORING_JSON_START',
          scoringJson,
          'SCORING_JSON_END',
        ]
      : []),
    '',
    'OUTPUT SCHEMA',
    'You must output a JSON object that matches the following Strategic Bets schema shape (keys and nesting must match exactly):',
    stringifySchemaForPrompt(STRATEGIC_BETS_SCHEMA_SHAPE),
    '',
    'OUTPUT RULES',
    '1) Output a single JSON object only. No surrounding prose, labels, or explanations.',
    '2) Do not use markdown or backticks. Do not wrap the JSON in any kind of code fence.',
    '3) Use exactly the schema keys shown above. Do not add, remove, or rename keys.',
    '4) Use standard JSON syntax with double-quoted keys and string values.',
    '5) Generate EXACTLY 2-3 bets (no more, no less).',
    '',
    'CONTENT RULES - STRATEGIC BET REQUIREMENTS',
    '',
    'BANNED VAGUE VERBS (DO NOT USE):',
    BANNED_VAGUE_VERBS.join(', '),
    '',
    'Strategic bets are NOT ideas or opportunities. They are commitments under constraint that force product decisions.',
    '',
    'Title:',
    '- Must be specific and non-buzzword-y',
    '- Examples: "Prioritize real-time collaboration over async workflows", "Target SMBs with self-serve pricing over enterprise sales", "Build on modern stack rather than legacy integration"',
    '- Avoid: "Better collaboration", "Enhanced pricing", "Modern technology"',
    '',
    'Bet statement:',
    '- Must be ONE assertive sentence ending with . or !',
    '- Must state a clear commitment, not a possibility',
    '- Examples: "We will prioritize real-time collaboration features over async workflows, even if it means sacrificing scalability for teams larger than 500 users."',
    '- Avoid: "We should consider...", "We might...", "We could leverage..."',
    '',
    'Tradeoffs (REQUIRED - at least 1):',
    '- Must explicitly state what we say NO to',
    '- Each tradeoff must be concrete and uncomfortable',
    '- Examples: "Say no to enterprise sales cycles longer than 3 months", "Say no to supporting legacy browser versions", "Say no to per-user pricing for teams under 10 users"',
    '- Avoid: "May require additional resources" or vague tradeoffs',
    '',
    'Forced capability:',
    '- Specific capability this bet forces us to build',
    '- Must be concrete and actionable',
    '- Examples: "Real-time collaboration infrastructure", "Self-serve onboarding flow", "Modern API architecture"',
    '- Avoid: "Better UX" or vague capabilities',
    '',
    'Competitor constraints (REQUIRED - at least 1):',
    '- Must identify structural constraints that prevent competitors from easily copying this bet',
    '- Focus on: pricing model, customer segments, architecture, business model, go-to-market',
    '- Examples: "Their enterprise sales model requires 6-month contracts, preventing quick pivots", "Their monolithic architecture makes real-time updates expensive", "Their per-user pricing creates friction for small teams"',
    '- Avoid: "Competitor X doesn\'t have this feature" (focus on WHY they can\'t easily build it)',
    '',
    'Disconfirming experiment (REQUIRED):',
    '- Must be a concrete, falsifiable test',
    '- experiment: What we will test (specific, measurable)',
    '- success_signal: What would indicate this bet is working',
    '- failure_signal: What would indicate this bet is failing',
    '- Examples:',
    '  experiment: "Launch self-serve pricing for teams under 50 users and track signup conversion"',
    '  success_signal: "20% of new signups choose self-serve within 3 months"',
    '  failure_signal: "Less than 5% of new signups choose self-serve, or enterprise deals decline by more than 30%"',
    '- Avoid: Vague tests like "measure user satisfaction" (be specific about what you measure and success/failure thresholds)',
    '',
    'Confidence:',
    '- high: Strong evidence supports this bet, clear competitive constraints',
    '- medium: Moderate evidence, some uncertainty about constraints',
    '- low: Lower evidence, higher uncertainty, but still worth testing',
    '',
    'Meta fields:',
    '- based_on_competitors: Number of competitors this bet is based on (count distinct competitors mentioned in competitor_constraints)',
    '- signals_used: List of signals/sources used (e.g., ["pricing_page", "customer_struggles", "scorecard_weaknesses"])',
    '- created_at: Current timestamp in ISO 8601 format',
    '',
    'QUALITY STANDARDS',
    '- Each bet must feel opinionated and uncomfortable (in a good way)',
    '- Each bet must clearly force tradeoffs (not just "more of X")',
    '- Each bet must imply a real product decision (not just strategic positioning)',
    '- Output must be usable in a strategy discussion without editing',
    '- Prioritize bets that create structural competitive advantages',
    '- Focus on bets where competitors are structurally constrained from copying',
    '- Link bets to high-importance jobs where relevant',
    '',
    'SELECTION CRITERIA',
    '- Choose 2-3 bets that are most actionable and defensible',
    '- Prioritize bets with high confidence and clear competitor constraints',
    '- Ensure bets cover different strategic dimensions (don\'t all focus on pricing, for example)',
    '- Each bet should force different tradeoffs and capabilities',
  ].join('\n')

  return [getSystemStyleGuide(), { role: 'user', content: userContent }]
}

