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
      summary: 'string (2-3 sentence plain-English description of the bet)',
      opportunity_source_ids: ['string'], // References to Opportunities v2 / JTBD IDs used
      what_we_say_no_to: ['string'], // Explicit deprioritized directions, features, or customers
      forced_capabilities: ['string'], // Capabilities, systems, or org muscles required to win
      why_competitors_wont_follow: 'string', // Structural, economic, or organizational friction — NOT speed or brand
      first_real_world_proof: {
        description: 'string (concrete, behavioral test)',
        timeframe_weeks: 0, // number of weeks for the test
        success_signal: 'string (what would indicate this bet is working)',
      },
      invalidation_signals: ['string'], // What evidence would prove this bet is wrong
      confidence_score: 0, // 0-100 derived from signal strength, consensus, and data freshness
      supporting_signals: [
        {
          source_type: 'string',
          citation_count: 0, // number of citations from this source
        },
      ],
      created_at: 'string (ISO 8601)',
      schema_version: 1, // must be exactly 1
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
    'Given the Jobs to Be Done, Opportunities, Competitive Scores, and Live Market Signals, synthesize a small set of strategic bets a leadership team could realistically commit to in the next 6–12 months.',
    'Generate 2-4 bets max. Bets must be mutually exclusive or clearly competing.',
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
          'Use these to prioritize bets based on job importance. Reference job IDs in opportunity_source_ids.',
          'JTBD_JSON_START',
          jtbdJson,
          'JTBD_JSON_END',
        ]
      : []),
    ...(opportunitiesJson
      ? [
          '',
          'OPPORTUNITIES (OPTIONAL)',
          'Use these opportunities to inform strategic bets. Reference opportunity titles/IDs in opportunity_source_ids.',
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
    '5) Generate EXACTLY 2-4 bets (no more, no less).',
    '',
    'CONTENT RULES - STRATEGIC BET REQUIREMENTS',
    '',
    'BANNED LANGUAGE (DO NOT USE):',
    'leverage, enhance, delight, best-in-class',
    '',
    'Every bet must involve a real sacrifice. Competitor defensibility must be structural, not aspirational.',
    'First proof must be behavioral, not research or planning.',
    '',
    'Title:',
    '- Must be specific and non-buzzword-y',
    '- Examples: "Prioritize real-time collaboration over async workflows", "Target SMBs with self-serve pricing over enterprise sales", "Build on modern stack rather than legacy integration"',
    '- Avoid: "Better collaboration", "Enhanced pricing", "Modern technology"',
    '',
    'Summary (REQUIRED):',
    '- 2-3 sentence plain-English description of the bet',
    '- Must clearly state what the bet is and why it matters',
    '- Examples: "We will prioritize real-time collaboration features over async workflows, even if it means sacrificing scalability for teams larger than 500 users. This bet positions us as the tool for fast-moving teams who need immediate feedback loops."',
    '',
    'Opportunity source IDs (REQUIRED):',
    '- Array of strings referencing Opportunities v2 titles or JTBD IDs used to inform this bet',
    '- Examples: ["opportunity-1", "job-3"] or ["Real-time collaboration features", "Coordinate team workflows"]',
    '',
    'What we say no to (REQUIRED - at least 1):',
    '- Explicit deprioritized directions, features, or customers',
    '- Each must be concrete and uncomfortable',
    '- Examples: "Say no to enterprise sales cycles longer than 3 months", "Say no to supporting legacy browser versions", "Say no to per-user pricing for teams under 10 users"',
    '- Avoid: "May require additional resources" or vague tradeoffs',
    '',
    'Forced capabilities (REQUIRED - at least 1):',
    '- Array of capabilities, systems, or org muscles required to win',
    '- Must be concrete and actionable',
    '- Examples: ["Real-time collaboration infrastructure", "Self-serve onboarding flow", "Modern API architecture"]',
    '- Avoid: "Better UX" or vague capabilities',
    '',
    'Why competitors won\'t follow (REQUIRED):',
    '- Structural, economic, or organizational friction — NOT speed or brand',
    '- Must explain WHY competitors are structurally constrained from copying',
    '- Focus on: pricing model, customer segments, architecture, business model, go-to-market',
    '- Examples: "Their enterprise sales model requires 6-month contracts, preventing quick pivots", "Their monolithic architecture makes real-time updates expensive", "Their per-user pricing creates friction for small teams"',
    '- Avoid: "Competitor X doesn\'t have this feature" or "We can move faster" (focus on structural constraints)',
    '',
    'First real-world proof (REQUIRED):',
    '- description: Concrete, behavioral test (not research or planning)',
    '- timeframe_weeks: Number of weeks (typically 2-4)',
    '- success_signal: What would indicate this bet is working (specific, measurable)',
    '- Examples:',
    '  description: "Launch self-serve pricing for teams under 50 users and track signup conversion"',
    '  timeframe_weeks: 4',
    '  success_signal: "20% of new signups choose self-serve within 3 months"',
    '- Avoid: Vague tests like "measure user satisfaction" (be specific about what you measure and success thresholds)',
    '',
    'Invalidation signals (REQUIRED - at least 1):',
    '- What evidence would prove this bet is wrong',
    '- Must be specific and observable',
    '- Examples: "Less than 5% of new signups choose self-serve", "Enterprise deals decline by more than 30%", "Customer churn increases by 20%"',
    '',
    'Confidence score (REQUIRED):',
    '- Number 0-100 derived from signal strength, consensus, and data freshness',
    '- Higher scores indicate stronger evidence and clearer competitive constraints',
    '- Examples: 85 (strong evidence, clear constraints), 60 (moderate evidence, some uncertainty), 40 (lower evidence, higher uncertainty)',
    '',
    'Supporting signals (REQUIRED):',
    '- Array of signal sources with citation counts',
    '- Examples: [{source_type: "pricing_page", citation_count: 3}, {source_type: "customer_struggles", citation_count: 5}]',
    '',
    'Created at:',
    '- Current timestamp in ISO 8601 format',
    '',
    'Schema version:',
    '- Must be exactly 1',
    '',
    'QUALITY STANDARDS',
    '- Each bet must feel opinionated and uncomfortable (in a good way)',
    '- Each bet must clearly force tradeoffs (not just "more of X")',
    '- Each bet must imply a real product decision (not just strategic positioning)',
    '- Output must be usable in a strategy discussion without editing',
    '- Prioritize bets that create structural competitive advantages',
    '- Focus on bets where competitors are structurally constrained from copying',
    '- Link bets to high-importance jobs and opportunities where relevant',
    '',
    'SELECTION CRITERIA',
    '- Choose 2-4 bets that are most actionable and defensible',
    '- Prioritize bets with high confidence scores and clear competitor constraints',
    '- Ensure bets cover different strategic dimensions (don\'t all focus on pricing, for example)',
    '- Each bet should force different tradeoffs and capabilities',
    '- Bets must be mutually exclusive or clearly competing',
  ].join('\n')

  return [getSystemStyleGuide(), { role: 'user', content: userContent }]
}

