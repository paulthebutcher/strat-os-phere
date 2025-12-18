// Prompt builder for Mode A market synthesis (MarketSynthesis JSON).
// Used in the competitive & landscape scan pipeline to synthesize across competitor snapshots.

import type { Message } from '@/lib/prompts/system'
import { getSystemStyleGuide } from '@/lib/prompts/system'
import type { ProjectContext } from '@/lib/prompts/snapshot'

export interface SynthesisPromptInput {
  project: ProjectContext
  snapshotsJson: string
}

export const MARKET_SYNTHESIS_SCHEMA_SHAPE = {
  market_summary: {
    headline: 'string',
    what_is_changing: ['string'],
    what_buyers_care_about: ['string'],
  },
  themes: [
    {
      theme: 'string',
      description: 'string',
      competitors_supporting: ['string'],
    },
  ],
  clusters: [
    {
      cluster_name: 'string',
      who_is_in_it: ['string'],
      cluster_logic: 'string',
    },
  ],
  positioning_map_text: {
    axis_x: 'string',
    axis_y: 'string',
    quadrants: [
      {
        name: 'string',
        competitors: ['string'],
        notes: 'string',
      },
    ],
  },
  opportunities: [
    {
      opportunity: 'string',
      who_it_serves: 'string',
      why_now: 'string',
      why_competitors_miss_it: 'string',
      suggested_angle: 'string',
      risk_or_assumption: 'string',
      priority: 1,
    },
  ],
  recommended_differentiation_angles: [
    {
      angle: 'string',
      what_to_claim: 'string',
      how_to_prove: ['string'],
      watch_out_for: ['string'],
    },
  ],
} as const

function stringifySchemaForPrompt(schemaShape: unknown): string {
  return JSON.stringify(schemaShape, null, 2)
}

export function buildSynthesisMessages(input: SynthesisPromptInput): Message[] {
  const { project, snapshotsJson } = input

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
    'You are synthesizing across multiple competitor snapshots to produce a single MarketSynthesis JSON object.',
    '',
    'PROJECT CONTEXT',
    projectLines.join('\n'),
    '',
    'COMPETITOR SNAPSHOTS',
    'The following is a JSON array of validated CompetitorSnapshot objects.',
    'Treat these as your only source of truth about the competitors.',
    'Do not invent competitors or change competitor names.',
    'SNAPSHOTS_JSON_START',
    snapshotsJson,
    'SNAPSHOTS_JSON_END',
    '',
    'OUTPUT SCHEMA',
    'You must output a JSON object that matches the following MarketSynthesis schema shape (keys and nesting must match exactly):',
    stringifySchemaForPrompt(MARKET_SYNTHESIS_SCHEMA_SHAPE),
    '',
    'OUTPUT RULES',
    '1) Output a single JSON object only. No surrounding prose, labels, or explanations.',
    '2) Do not use markdown or backticks. Do not wrap the JSON in any kind of code fence.',
    '3) Use exactly the schema keys shown above. Do not add, remove, or rename keys.',
    '4) Use standard JSON syntax with double-quoted keys and string values.',
    '5) Use only competitor names that appear in the input snapshots (competitor_name). Do not introduce new competitors.',
    '',
    'CONTENT RULES',
    'Market summary:',
    '- market_summary.headline should be a concise sentence capturing the most important change or dynamic in the market.',
    '- market_summary.what_is_changing should list specific shifts in buyer behavior, technology, or competitive dynamics drawn from the snapshots.',
    '- market_summary.what_buyers_care_about should list concrete buyer priorities inferred from how competitors position and prove themselves.',
    '',
    'Themes (3–5 items):',
    '- themes must contain 3–5 themes.',
    '- Each theme.theme is a short name for a pattern you see across competitors.',
    '- Each theme.description crisply explains that pattern.',
    '- Each theme.competitors_supporting lists competitor_name values that clearly support the theme.',
    '',
    'Clusters (2–4 items):',
    '- clusters must contain 2–4 clusters.',
    '- cluster_name should describe the strategic grouping (for example, "workflow suites" or "point tools").',
    '- who_is_in_it must list competitor_name values grouped into that cluster.',
    '- cluster_logic should explain why these competitors belong together.',
    '',
    'Positioning map text:',
    '- positioning_map_text.axis_x and positioning_map_text.axis_y must define textual axes only (no charts or coordinates).',
    '- quadrants should describe 3–4 distinct strategic positions on those axes.',
    '- Each quadrant.competitors array must list only competitor_name values from the snapshots.',
    '- quadrants.notes should explain how each quadrant behaves or competes.',
    '',
    'Opportunities (5–7 items):',
    '- opportunities must contain 5–7 distinct, defensible opportunities.',
    '- Each opportunities[i].opportunity should be written as a statement starting with "We can win by ...".',
    '- who_it_serves should describe the specific segment or buyer this opportunity helps.',
    '- why_now should explain the timing or trigger for the opportunity, based on the competitive landscape.',
    '- why_competitors_miss_it should explain why existing competitors are not addressing this opportunity well.',
    '- suggested_angle should describe how to position or design our product to capture this opportunity.',
    '- risk_or_assumption should state the key bet, uncertainty, or dependency for this opportunity.',
    '- priority should be an integer rank (1 is highest priority) that reflects strategic importance; avoid ties when possible.',
    '',
    'Recommended differentiation angles (3–5 items):',
    '- recommended_differentiation_angles must contain 3–5 items.',
    '- angle should be a crisp label for how we should differentiate.',
    '- what_to_claim should describe the specific promise we would make to the market.',
    '- how_to_prove should list concrete ways to substantiate the claim (for example, product capabilities, customer proof, or operations).',
    '- watch_out_for should list specific risks, counters from competitors, or failure modes to monitor.',
    '',
    'GENERAL BEHAVIOR',
    '- Base all reasoning on the provided CompetitorSnapshot objects; do not assume facts that are not implied there.',
    '- When in doubt, express uncertainty in risk_or_assumption, watch_out_for, or similar fields rather than inventing confident claims.',
  ].join('\n')

  return [getSystemStyleGuide(), { role: 'user', content: userContent }]
}


