// Prompt builder for Differentiation Opportunities v2 (evidence-aware, VP-ready).
// Used in Quality Pack v2 to generate crisper, less generic opportunities with citations.

import type { Message } from '@/lib/prompts/system'
import { getSystemStyleGuide } from '@/lib/prompts/system'
import type { ProjectContext } from '@/lib/prompts/snapshot'
import type { EvidenceDigest } from '@/lib/results/evidenceDigest'

export interface OpportunitiesV2PromptInput {
  project: ProjectContext
  competitorList: string[]
  evidenceDigest: EvidenceDigest
  existingOpportunities?: unknown // Optional existing opportunities for refinement
}

export const OPPORTUNITIES_V2_SCHEMA_SHAPE = {
  schema_version: 2,
  meta: {
    generated_at: 'string (ISO 8601)',
    window_days: 'number',
    coverage_score: 'number (optional, 0-100)',
  },
  opportunities: [
    {
      id: 'string (unique identifier)',
      title: 'string (specific, non-buzzword)',
      one_liner: 'string (concise description)',
      differentiation_mechanism: ['string'], // How we differentiate
      why_competitors_wont_follow: ['string'], // Switching costs, org constraints, incentive misalignment, technical moat, partnerships
      first_experiment: {
        steps: ['string'], // Concrete steps
        metric: 'string', // Success metric
        duration_days: 'number', // Duration in days (typically 14)
      },
      confidence: 'high | medium | low',
      citations: [
        {
          url: 'string',
          source_type: 'string (optional)',
          extracted_at: 'string (optional, ISO 8601)',
        },
      ],
      score: 'number (optional, 0-100)',
    },
  ],
} as const

function stringifySchemaForPrompt(schemaShape: unknown): string {
  return JSON.stringify(schemaShape, null, 2)
}

const BANNED_VAGUE_OPPORTUNITIES = [
  'AI-powered features',
  'personalization',
  'dashboards',
  'integrations',
  'better UX',
  'improved performance',
]

export function buildOpportunitiesV2Prompt(
  input: OpportunitiesV2PromptInput
): Message[] {
  const { project, competitorList, evidenceDigest, existingOpportunities } = input

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

  if (project.primary_constraint) {
    projectLines.push(`Primary constraint: ${project.primary_constraint}`)
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
        'No evidence sources available. Generate opportunities with confidence: "low" and explain why in citations.',
      ]

  const userContent = [
    'TASK',
    'Generate 5-10 ranked, evidence-backed differentiation opportunities that are specific, defensible, and VP-ready.',
    'Each opportunity must cite evidence OR explicitly label confidence as "low" with a reason.',
    '',
    'PROJECT CONTEXT',
    projectLines.join('\n'),
    '',
    'COMPETITORS',
    competitorList.join(', '),
    ...evidenceSection,
    ...(existingOpportunities
      ? [
          '',
          'EXISTING OPPORTUNITIES (for refinement)',
          'EXISTING_OPPORTUNITIES_JSON_START',
          JSON.stringify(existingOpportunities, null, 2),
          'EXISTING_OPPORTUNITIES_JSON_END',
        ]
      : []),
    '',
    'OUTPUT SCHEMA',
    'You must output a JSON object that matches the following schema shape (keys and nesting must match exactly):',
    stringifySchemaForPrompt(OPPORTUNITIES_V2_SCHEMA_SHAPE),
    '',
    'OUTPUT RULES',
    '1) Output a single JSON object only. No surrounding prose, labels, or explanations.',
    '2) Do not use markdown or backticks. Do not wrap the JSON in any kind of code fence.',
    '3) Use exactly the schema keys shown above. Do not add, remove, or rename keys.',
    '4) Use standard JSON syntax with double-quoted keys and string values.',
    '5) Generate 5-10 opportunities (no more, no less).',
    '',
    'CONTENT RULES - QUALITY PACK V2 REQUIREMENTS',
    '',
    'NOT TABLE STAKES RULE:',
    `BANNED GENERIC OPPORTUNITIES (DO NOT USE unless backed by strong evidence):`,
    BANNED_VAGUE_OPPORTUNITIES.join(', '),
    'If you include any of these, you MUST cite at least 3 evidence sources showing why this is differentiated.',
    '',
    'PROOF BURDEN RULE:',
    '- Every opportunity must cite at least 2 sources from the evidence digest, OR',
    '- Explicitly label confidence: "low" with a clear reason (e.g., "low" because "insufficient evidence for this opportunity")',
    '- Citations must reference URLs from the evidence digest',
    '',
    'DIFFERENTIATION TEST RULE:',
    '- why_competitors_wont_follow must be a structured list covering:',
    '  * Switching costs: What makes it hard for customers to switch?',
    '  * Org constraints: What organizational limitations prevent competitors?',
    '  * Incentive misalignment: Why would competitors lose money/position by copying?',
    '  * Technical moat: What technical barriers exist?',
    '  * Partnerships: What exclusive partnerships or relationships?',
    '- Be specific: "Their enterprise sales model requires 6-month contracts" not "they move slowly"',
    '',
    'FIRST EXPERIMENT RULE:',
    '- Must include a concrete experiment within 2 weeks (duration_days: 14)',
    '- steps: Array of specific, actionable steps',
    '- metric: Clear success metric (e.g., "20% of users complete onboarding in <5 minutes")',
    '- Avoid vague experiments like "research more" or "talk to users"',
    '',
    'Title:',
    '- Must be specific and non-buzzword-y',
    '- Examples: "Real-time collaboration during code review", "One-click compliance report export"',
    '- Avoid: "Better collaboration", "Enhanced productivity"',
    '',
    'One-liner:',
    '- Concise description (1-2 sentences)',
    '- Should be VP-ready (can be used in a presentation)',
    '',
    'Differentiation mechanism:',
    '- Array of specific ways we differentiate',
    '- Examples: ["Native Slack integration", "Self-serve pricing for teams <50", "Real-time diff viewer"]',
    '',
    'Confidence:',
    '- high: Strong evidence (3+ citations, recent sources)',
    '- medium: Moderate evidence (2 citations, some uncertainty)',
    '- low: Weak evidence or explicitly speculative',
    '',
    'Citations:',
    '- Must reference URLs from the evidence digest',
    '- Include source_type and extracted_at when available',
    '- At least 2 citations required unless confidence is "low"',
    '',
    'QUALITY STANDARDS',
    '- Every opportunity must be something a product team could start working on next week',
    '- Every opportunity must be defensible - explain why competitors can\'t easily copy',
    '- Prioritize opportunities backed by recent evidence',
    '- Flag opportunities with low evidence as confidence: "low"',
    '- Avoid generic opportunities unless backed by strong evidence',
  ].join('\n')

  return [getSystemStyleGuide(), { role: 'user', content: userContent }]
}

