// Prompt builder for Opportunity V3 generation.
// Unified opportunities that distill all existing results into one canonical format.

import type { Message } from '@/lib/prompts/system'
import { getSystemStyleGuide } from '@/lib/prompts/system'
import type { ProjectContext } from '@/lib/prompts/snapshot'

export interface OpportunityV3PromptInput {
  project: ProjectContext
  snapshotsJson: string
  jtbdJson?: string
  scoringJson?: string
  evidenceSourcesJson?: string
}

export const OPPORTUNITY_V3_SCHEMA_SHAPE = {
  meta: {
    generated_at: 'string (ISO 8601)',
    run_id: 'string (optional)',
    inputs_used: {
      jtbd: 'boolean',
      scorecard: 'boolean',
      live_signals: 'boolean',
      profiles: 'boolean',
      pricing: 'boolean',
      reviews: 'boolean',
      jobs: 'boolean',
      changelog: 'boolean',
    },
    signals_summary: {
      evidence_sources_count: 'number',
      review_sources_count: 'number',
      pricing_sources_count: 'number',
      changelog_sources_count: 'number',
      jobs_sources_count: 'number',
    },
  },
  opportunities: [
    {
      id: 'string (stable slug-like ID derived from normalized title + projectId + primary JTBD)',
      title: 'string (6-10 words, specific, non-buzzword)',
      one_liner: 'string (1 sentence strategic recommendation)',
      customer: 'string (who experiences the pain)',
      problem_today: 'string (what is happening right now, grounded in recent signals)',
      proposed_move: 'string (what to build/do)',
      why_now: 'string (why this matters now: market shift, competitor actions, pricing friction)',
      proof_points: [
        {
          claim: 'string',
          citations: [
            {
              url: 'string (URL)',
              title: 'string (optional)',
              source_type: 'marketing_site | changelog | pricing | reviews | jobs | docs | status',
              extracted_at: 'string (ISO date, optional)',
              source_date_range: 'string (optional, e.g., "last 90 days")',
              confidence: 'low | medium | high (optional)',
              domain: 'string (optional)',
            },
          ],
        },
      ],
      citations: [
        {
          url: 'string (URL)',
          title: 'string (optional)',
          source_type: 'marketing_site | changelog | pricing | reviews | jobs | docs | status',
          extracted_at: 'string (ISO date, optional)',
          source_date_range: 'string (optional)',
          confidence: 'low | medium | high (optional)',
          domain: 'string (optional)',
        },
      ],
      scoring: {
        total: 'number (0-100, integer)',
        breakdown: {
          customer_pain: 'number (0-10, integer or one decimal)',
          willingness_to_pay: 'number (0-10)',
          strategic_fit: 'number (0-10)',
          feasibility: 'number (0-10)',
          defensibility: 'number (0-10)',
          competitor_gap: 'number (0-10)',
          recencyConfidence: 'number (0-10)',
        },
        weights: {
          customer_pain: 'number (0-1, decimal, must sum to 1.0)',
          willingness_to_pay: 'number (0-1)',
          strategic_fit: 'number (0-1)',
          feasibility: 'number (0-1)',
          defensibility: 'number (0-1)',
          competitor_gap: 'number (0-1)',
          recencyConfidence: 'number (0-1)',
        },
        explainability: [
          {
            explanation: 'string',
            citations: 'array of citations (optional)',
          },
        ],
      },
      tradeoffs: {
        what_we_say_no_to: ['string'],
        capability_forced: ['string'],
        why_competitors_wont_follow: ['string'],
      },
      experiments: [
        {
          hypothesis: 'string',
          smallest_test: 'string',
          success_metric: 'string',
          expected_timeframe: 'string (e.g., "2 weeks")',
          risk_reduced: 'string',
        },
      ],
      dependencies: {
        linked_competitors: ['string (UUID, optional)'],
        linked_jtbd_ids: ['string or number (optional)'],
        linked_signals: ['string (optional, evidence source IDs)'],
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

export function buildOpportunityV3Messages(
  input: OpportunityV3PromptInput
): Message[] {
  const { project, snapshotsJson, jtbdJson, scoringJson, evidenceSourcesJson } = input

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
    'Generate 6-10 unified opportunities that distill all competitive analysis inputs into actionable, defensible strategic recommendations.',
    'Each opportunity must be specific, citation-backed, and include a deterministic score breakdown.',
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
    ...(jtbdJson
      ? [
          '',
          'JOBS TO BE DONE (INPUT)',
          'Use these jobs to understand customer pain points and link opportunities:',
          'JTBD_JSON_START',
          jtbdJson,
          'JTBD_JSON_END',
        ]
      : []),
    ...(scoringJson
      ? [
          '',
          'SCORECARD (INPUT)',
          'Use scoring criteria to inform strategic_fit and competitor_gap dimensions:',
          'SCORING_JSON_START',
          scoringJson,
          'SCORING_JSON_END',
        ]
      : []),
    ...(evidenceSourcesJson
      ? [
          '',
          'EVIDENCE SOURCES (INPUT)',
          'Use these sources to ground proof_points and citations. Prioritize recent sources (within 90 days):',
          'EVIDENCE_JSON_START',
          evidenceSourcesJson,
          'EVIDENCE_JSON_END',
        ]
      : []),
    '',
    'OUTPUT SCHEMA',
    'You must output a JSON object that matches the following OpportunityV3 schema shape:',
    stringifySchemaForPrompt(OPPORTUNITY_V3_SCHEMA_SHAPE),
    '',
    'OUTPUT RULES',
    '1) Output a single JSON object only. No surrounding prose, labels, or explanations.',
    '2) Do not use markdown or backticks. Do not wrap the JSON in any kind of code fence.',
    '3) Use exactly the schema keys shown above. Do not add, remove, or rename keys.',
    '4) Generate 6-10 opportunities (no more, no less).',
    '',
    'CONTENT RULES - SPECIFICITY REQUIREMENTS',
    '',
    'BANNED VAGUE VERBS (DO NOT USE):',
    BANNED_VAGUE_VERBS.join(', '),
    '',
    'Title: 6-10 words, specific, non-buzzword-y',
    'Examples: "Reduce onboarding drop-off", "Replace manual reconciliation", "Automated compliance report generation"',
    '',
    'One-liner: One sentence that reads like a strategic recommendation',
    'Examples: "Build automated compliance report generation to reduce manual work for compliance officers."',
    '',
    'Problem today: What is happening right now, grounded in recent signals',
    'Examples: "Based on reviews from the last 90 days, compliance officers spend 8+ hours per week on manual report generation"',
    '',
    'Proposed move: What to build/do (use concrete verbs)',
    'Examples: "Build automated compliance report generator", "Add one-click export to CSV", "Create visual diff viewer"',
    '',
    'Proof points: 3-6 bullets, each with at least one citation',
    'Each proof point must cite at least one evidence source from the evidence sources input.',
    '',
    'Citations: At least 4 unique citations across mixed source types',
    'Prioritize recent sources (within 90 days) and mix source types (reviews, pricing, changelog, etc.).',
    '',
    'Scoring:',
    '- Breakdown: Each dimension 0-10 (integers or one decimal)',
    '- Weights: Must sum to 1.0 exactly',
    '- Total: Compute as weighted sum, then round to integer (0-100)',
    '- Explainability: 3-5 bullets describing what drove the score, with citations where possible',
    '',
    'Tradeoffs:',
    '- what_we_say_no_to: 2-4 bullets (what we would say no to)',
    '- capability_forced: 2-4 bullets (capabilities we must build)',
    '- why_competitors_wont_follow: 2-4 bullets (moat/constraints)',
    '',
    'Experiments: 3-5 first experiments',
    'Each with: hypothesis, smallest_test, success_metric, expected_timeframe, risk_reduced',
    'Examples: { hypothesis: "Compliance officers will use automated reports", smallest_test: "Run 5 user interviews", success_metric: "5/5 say they would use it", expected_timeframe: "2 weeks", risk_reduced: "Validates demand before building" }',
    '',
    'QUALITY STANDARDS',
    '- Every opportunity must be citation-backed',
    '- Every proof point must have at least one citation',
    '- Scoring must use granular dimension scores (not just 5/10)',
    '- Prioritize opportunities with recent evidence (within 90 days)',
    '- Make opportunities immediately actionable and defensible',
  ].join('\n')

  return [getSystemStyleGuide(), { role: 'user', content: userContent }]
}

