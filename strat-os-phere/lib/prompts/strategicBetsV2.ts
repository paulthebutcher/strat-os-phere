// Prompt builder for Strategic Bets v2 (evidence-aware, VP-ready).
// Used in Quality Pack v2 to generate decision-ready commitments with citations.

import type { Message } from '@/lib/prompts/system'
import { getSystemStyleGuide } from '@/lib/prompts/system'
import type { ProjectContext } from '@/lib/prompts/snapshot'
import type { EvidenceDigest } from '@/lib/results/evidenceDigest'

export interface StrategicBetsV2PromptInput {
  project: ProjectContext
  topOpportunities: unknown // Top opportunities from v2 overlay
  evidenceDigest: EvidenceDigest
}

export const STRATEGIC_BETS_V2_SCHEMA_SHAPE = {
  schema_version: 2,
  meta: {
    generated_at: 'string (ISO 8601)',
    window_days: 'number',
    coverage_score: 'number (optional, 0-100)',
  },
  bets: [
    {
      id: 'string (unique identifier, e.g., "bet-1")',
      title: 'string (specific, non-buzzword)',
      summary: 'string (2-3 sentence plain-English description)',
      what_we_say_no_to: ['string'], // Explicit deprioritized directions
      capability_we_must_build: ['string'], // Capabilities required to win
      why_competitors_wont_follow_easily: 'string', // Structural constraints
      risk_and_assumptions: ['string'], // Risks and assumptions
      decision_owner: 'string (default: "VP Product/UX")',
      time_horizon: 'Now | Next | Later',
      citations: [
        {
          url: 'string',
          source_type: 'string (optional)',
          extracted_at: 'string (optional, ISO 8601)',
        },
      ],
    },
  ],
} as const

function stringifySchemaForPrompt(schemaShape: unknown): string {
  return JSON.stringify(schemaShape, null, 2)
}

export function buildStrategicBetsV2Prompt(
  input: StrategicBetsV2PromptInput
): Message[] {
  const { project, topOpportunities, evidenceDigest } = input

  // Build project context with hypothesis-first approach
  const lens = project.lens || project.starting_point || 'product'
  const projectLines: string[] = [
    `Lens: ${lens.charAt(0).toUpperCase() + lens.slice(1)}`,
  ]

  // Primary anchor: hypothesis (preferred) or fallback to your_product/business_goal
  if (project.hypothesis) {
    projectLines.push(`Hypothesis: ${project.hypothesis}`)
  } else if (project.your_product) {
    projectLines.push(`Your product: ${project.your_product}`)
  } else if (project.business_goal) {
    projectLines.push(`Business goal: ${project.business_goal}`)
  }

  // Market context
  if (project.market_context) {
    projectLines.push(`Market: ${project.market_context}`)
  } else {
    projectLines.push(`Market: ${project.market}`)
  }

  // Customer context
  if (project.customer_profile) {
    projectLines.push(`Customer: ${project.customer_profile}`)
  } else {
    projectLines.push(`Target customer: ${project.target_customer}`)
  }

  // Format evidence digest for prompt
  const evidenceSection = evidenceDigest.sources.length > 0
    ? [
        '',
        'EVIDENCE DIGEST',
        `Generated: ${evidenceDigest.generatedAt}`,
        `Window: Last ${evidenceDigest.windowDays} days`,
        `Coverage: ${evidenceDigest.coverage.citations} citations, ${evidenceDigest.coverage.sourceTypes.length} source types, ${evidenceDigest.coverage.recencyLabel}`,
        '',
        'Evidence Sources:',
        ...evidenceDigest.sources.map((source, idx) => [
          `[${idx + 1}] ${source.source_type} - ${source.domain || 'unknown domain'}`,
          `URL: ${source.url}`,
          source.extracted_at ? `Extracted: ${source.extracted_at}` : '',
          `Snippet: ${source.snippet}`,
          '',
        ].filter(Boolean).join('\n')),
      ]
    : [
        '',
        'EVIDENCE DIGEST',
        'No evidence sources available. Generate bets with appropriate risk assessment.',
      ]

  const userContent = [
    'TASK',
    'Given the top opportunities and evidence, synthesize 2-4 strategic bets a leadership team could commit to in the next 6-12 months.',
    'Each bet must be decision-ready, VP-ready, and include citations where applicable.',
    'Outputs must evaluate the user\'s hypothesis; do not assume a finished product exists.',
    '',
    'PROJECT CONTEXT',
    projectLines.join('\n'),
    '',
    'TOP OPPORTUNITIES',
    'OPPORTUNITIES_JSON_START',
    JSON.stringify(topOpportunities, null, 2),
    'OPPORTUNITIES_JSON_END',
    ...evidenceSection,
    '',
    'OUTPUT SCHEMA',
    'You must output a JSON object that matches the following schema shape (keys and nesting must match exactly):',
    stringifySchemaForPrompt(STRATEGIC_BETS_V2_SCHEMA_SHAPE),
    '',
    'OUTPUT RULES',
    '1) Output a single JSON object only. No surrounding prose, labels, or explanations.',
    '2) Do not use markdown or backticks. Do not wrap the JSON in any kind of code fence.',
    '3) Use exactly the schema keys shown above. Do not add, remove, or rename keys.',
    '4) Use standard JSON syntax with double-quoted keys and string values.',
    '5) Generate EXACTLY 2-4 bets (no more, no less).',
    '',
    'CONTENT RULES - STRATEGIC BETS V2 REQUIREMENTS',
    '',
    'Title:',
    '- Must be specific and non-buzzword-y',
    '- Examples: "Prioritize real-time collaboration over async workflows", "Target SMBs with self-serve pricing"',
    '- Avoid: "Better collaboration", "Enhanced pricing"',
    '',
    'Summary (REQUIRED):',
    '- 2-3 sentence plain-English description',
    '- Must clearly state what the bet is and why it matters',
    '- VP-ready (can be used in a presentation)',
    '',
    'What we say no to (REQUIRED - at least 1):',
    '- Explicit deprioritized directions, features, or customers',
    '- Each must be concrete and uncomfortable',
    '- Examples: "Say no to enterprise sales cycles longer than 3 months", "Say no to supporting legacy browser versions"',
    '- Avoid: "May require additional resources" or vague tradeoffs',
    '',
    'Capability we must build (REQUIRED - at least 1):',
    '- Array of capabilities, systems, or org muscles required to win',
    '- Must be concrete and actionable',
    '- Examples: ["Real-time collaboration infrastructure", "Self-serve onboarding flow", "Modern API architecture"]',
    '- Avoid: "Better UX" or vague capabilities',
    '',
    'Why competitors won\'t follow easily (REQUIRED):',
    '- Structural, economic, or organizational friction — NOT speed or brand',
    '- Must explain WHY competitors are structurally constrained',
    '- Focus on: pricing model, customer segments, architecture, business model, go-to-market',
    '- Examples: "Their enterprise sales model requires 6-month contracts, preventing quick pivots", "Their monolithic architecture makes real-time updates expensive"',
    '- Avoid: "Competitor X doesn\'t have this feature" or "We can move faster"',
    '',
    'Risk and assumptions (REQUIRED - at least 1):',
    '- Specific risks or assumptions',
    '- Examples: "Requires regulatory approval", "May cannibalize existing revenue", "Depends on partner API availability"',
    '',
    'Decision owner:',
    '- Default: "VP Product/UX"',
    '- Can be customized based on bet type',
    '',
    'Time horizon:',
    '- Now: Execute in next 0-3 months',
    '- Next: Execute in 3-6 months',
    '- Later: Execute in 6-12 months',
    '',
    'Citations:',
    '- Include citations where applicable',
    '- Reference URLs from the evidence digest',
    '- Include source_type and extracted_at when available',
    '',
    'QUALITY STANDARDS',
    '- Each bet must feel opinionated and uncomfortable (in a good way)',
    '- Each bet must clearly force tradeoffs (not just "more of X")',
    '- Each bet must imply a real product decision (not just strategic positioning)',
    '- Output must be usable in a strategy discussion without editing',
    '- Prioritize bets that create structural competitive advantages',
    '- Focus on bets where competitors are structurally constrained from copying',
    '- Link bets to top opportunities where relevant',
  ].join('\n')

  return [getSystemStyleGuide(), { role: 'user', content: userContent }]
}

