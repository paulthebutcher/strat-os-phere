// Prompt builder for Assumptions generation/refinement.
// Ensures assumptions are specific, testable, and non-fluffy.

import type { Message } from '@/lib/prompts/system'
import { getSystemStyleGuide } from '@/lib/prompts/system'
import type { ProjectContext } from '@/lib/prompts/snapshot'

export interface AssumptionRefinementInput {
  project: ProjectContext
  opportunitiesJson?: string
  competitorNames?: string[]
  existingAssumption?: {
    category: string
    statement: string
    whyItMatters?: string
  }
}

export interface AssumptionOutput {
  category: 'Market' | 'Buyer' | 'Competition' | 'Execution' | 'Evidence'
  statement: string // ≤140 characters, concrete, falsifiable
  test: string // How to validate/falsify (what evidence would prove/disprove)
  decision_impact: string // What decision changes if wrong
  entities: string[] // Competitor names / buyer segments referenced (can be empty if measurable proxy exists)
}

const ASSUMPTION_SCHEMA_SHAPE = {
  assumptions: [
    {
      category: 'Market | Buyer | Competition | Execution | Evidence',
      statement: 'string (≤140 chars, concrete, falsifiable)',
      test: 'string (how to validate/falsify)',
      decision_impact: 'string (what decision changes if wrong)',
      entities: ['string (competitor names / buyer segments, can be empty)'],
    },
  ],
} as const

function stringifySchemaForPrompt(schemaShape: unknown): string {
  return JSON.stringify(schemaShape, null, 2)
}

/**
 * Build messages for refining a single fluffy assumption
 */
export function buildAssumptionRefinementMessages(
  input: AssumptionRefinementInput
): Message[] {
  const { project, opportunitiesJson, competitorNames, existingAssumption } = input

  const projectLines: string[] = []
  if (project.your_product) {
    projectLines.push(`Your product: ${project.your_product}`)
  } else if (project.business_goal) {
    projectLines.push(`Business goal: ${project.business_goal}`)
  }
  projectLines.push(`Market: ${project.market}`)
  if (project.target_customer) {
    projectLines.push(`Target customer: ${project.target_customer}`)
  }

  const userContent = [
    'TASK',
    'Rewrite the following assumption to be specific, testable, and non-fluffy.',
    'The rewritten assumption must be a falsifiable claim that helps decision-making.',
    '',
    'PROJECT CONTEXT',
    projectLines.join('\n'),
    ...(competitorNames && competitorNames.length > 0
      ? ['', `COMPETITORS: ${competitorNames.join(', ')}`]
      : []),
    ...(opportunitiesJson
      ? [
          '',
          'OPPORTUNITIES (CONTEXT)',
          'Use these opportunities to understand what assumptions matter:',
          'OPPORTUNITIES_JSON_START',
          opportunitiesJson,
          'OPPORTUNITIES_JSON_END',
        ]
      : []),
    '',
    'EXISTING ASSUMPTION (TO REWRITE)',
    `Category: ${existingAssumption?.category || 'Unknown'}`,
    `Statement: ${existingAssumption?.statement || ''}`,
    ...(existingAssumption?.whyItMatters
      ? [`Why it matters: ${existingAssumption.whyItMatters}`]
      : []),
    '',
    'HARD CONSTRAINTS',
    '1. No generic statements about "capability," "evidence is limited," "buyers evolving," "competitors not addressing."',
    '2. No internal-company claims unless tied to a verifiable constraint (budget/headcount/time).',
    '3. No tautologies (e.g., "this is an opportunity").',
    '4. Every statement must be specific and testable.',
    '5. Statement must be ≤140 characters.',
    '',
    'REQUIRED FORMAT',
    'Return a JSON object with a single "assumption" field (not "assumptions" array) containing:',
    '- category: one of [Market, Buyer, Competition, Execution, Evidence]',
    '- statement: one sentence, concrete, falsifiable, ≤140 characters',
    '- test: one short sentence: how to validate/falsify (what evidence would prove/disprove)',
    '- decision_impact: one short sentence: what decision changes if wrong',
    '- entities: array of competitor names / buyer segments referenced (can be empty only if measurable proxy exists)',
    '',
    'SPECIFICITY REQUIREMENTS',
    'Each statement must include at least ONE of:',
    '- a named competitor (or "at least 2 competitors")',
    '- a named buyer segment',
    '- a measurable observable (time, %, count, feature, pricing)',
    '- a concrete market signal source type (reviews, docs, pricing page, changelog)',
    '',
    'EXAMPLE TRANSFORMATIONS',
    '',
    'Bad: "We have the capability to execute on this opportunity"',
    'Good: "We can ship a v1 trainer credential display in ≤ 2 weeks with current team capacity."',
    '',
    'Bad: "Evidence is limited and may require validation"',
    'Good: "Only 1 competitor explicitly mentions trainer credentials on their pricing page; +2 corroborating review sources would move confidence from Low→Medium."',
    '',
    'Bad: "Buyer needs are evolving…"',
    'Good: "Prospects mention \'trainer verification\' in ≥20% of reviews across 2 competitors; if <5%, this bet drops out of top 3."',
    '',
    'OUTPUT RULES',
    '1) Output a single JSON object only. No surrounding prose, labels, or explanations.',
    '2) Do not use markdown or backticks. Do not wrap the JSON in any kind of code fence.',
    '3) Use exactly the schema keys shown above.',
    '4) The statement must be ≤140 characters.',
  ].join('\n')

  return [getSystemStyleGuide(), { role: 'user', content: userContent }]
}

/**
 * Build messages for generating assumptions from opportunities
 */
export function buildAssumptionsGenerationMessages(
  input: AssumptionRefinementInput & {
    topOpportunities: Array<{
      id?: string
      title?: string
      customer?: string
      problem_today?: string
      why_now?: string
      citations?: Array<{ url: string; source_type?: string }>
      tradeoffs?: {
        capability_forced?: string[]
        why_competitors_wont_follow?: string[]
      }
    }>
  }
): Message[] {
  const { project, competitorNames, topOpportunities } = input

  const projectLines: string[] = []
  if (project.your_product) {
    projectLines.push(`Your product: ${project.your_product}`)
  } else if (project.business_goal) {
    projectLines.push(`Business goal: ${project.business_goal}`)
  }
  projectLines.push(`Market: ${project.market}`)
  if (project.target_customer) {
    projectLines.push(`Target customer: ${project.target_customer}`)
  }

  const opportunitiesJson = JSON.stringify(topOpportunities, null, 2)

  const userContent = [
    'TASK',
    'Generate 8-12 specific, testable assumptions that underpin the strategic opportunities.',
    'Each assumption must be a falsifiable claim that helps decision-making.',
    '',
    'PROJECT CONTEXT',
    projectLines.join('\n'),
    ...(competitorNames && competitorNames.length > 0
      ? ['', `COMPETITORS: ${competitorNames.join(', ')}`]
      : []),
    '',
    'TOP OPPORTUNITIES',
    'Generate assumptions that support or challenge these opportunities:',
    'OPPORTUNITIES_JSON_START',
    opportunitiesJson,
    'OPPORTUNITIES_JSON_END',
    '',
    'OUTPUT SCHEMA',
    'You must output a JSON object that matches the following schema:',
    stringifySchemaForPrompt(ASSUMPTION_SCHEMA_SHAPE),
    '',
    'HARD CONSTRAINTS',
    '1. No generic statements about "capability," "evidence is limited," "buyers evolving," "competitors not addressing."',
    '2. No internal-company claims unless tied to a verifiable constraint (budget/headcount/time).',
    '3. No tautologies (e.g., "this is an opportunity").',
    '4. Every statement must be specific and testable.',
    '5. Each statement must be ≤140 characters.',
    '',
    'REQUIRED FORMAT',
    'Return JSON array of assumptions with fields:',
    '- category: one of [Market, Buyer, Competition, Execution, Evidence]',
    '- statement: one sentence, concrete, falsifiable, ≤140 characters',
    '- test: one short sentence: how to validate/falsify (what evidence would prove/disprove)',
    '- decision_impact: one short sentence: what decision changes if wrong',
    '- entities: array of competitor names / buyer segments referenced (can be empty only if measurable proxy exists)',
    '',
    'SPECIFICITY REQUIREMENTS',
    'Each statement must include at least ONE of:',
    '- a named competitor (or "at least 2 competitors")',
    '- a named buyer segment',
    '- a measurable observable (time, %, count, feature, pricing)',
    '- a concrete market signal source type (reviews, docs, pricing page, changelog)',
    '',
    'EXAMPLE TRANSFORMATIONS',
    '',
    'Bad: "We have the capability to execute on this opportunity"',
    'Good: "We can ship a v1 trainer credential display in ≤ 2 weeks with current team capacity."',
    '',
    'Bad: "Evidence is limited and may require validation"',
    'Good: "Only 1 competitor explicitly mentions trainer credentials on their pricing page; +2 corroborating review sources would move confidence from Low→Medium."',
    '',
    'Bad: "Buyer needs are evolving…"',
    'Good: "Prospects mention \'trainer verification\' in ≥20% of reviews across 2 competitors; if <5%, this bet drops out of top 3."',
    '',
    'OUTPUT RULES',
    '1) Output a single JSON object only. No surrounding prose, labels, or explanations.',
    '2) Do not use markdown or backticks. Do not wrap the JSON in any kind of code fence.',
    '3) Use exactly the schema keys shown above.',
    '4) Generate 8-12 assumptions across all categories.',
    '5) Each statement must be ≤140 characters.',
  ].join('\n')

  return [getSystemStyleGuide(), { role: 'user', content: userContent }]
}

