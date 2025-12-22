// Prompt builder for Mode A competitor snapshots (CompetitorSnapshot JSON).
// Used in the competitive & landscape scan pipeline to turn pasted evidence into a single competitor snapshot.

import type { Message } from '@/lib/prompts/system'
import { getSystemStyleGuide } from '@/lib/prompts/system'

import type {
  RiskPosture,
  AmbitionLevel,
  DecisionLevel,
  InputConfidence,
} from '@/lib/supabase/types'

export interface ProjectContext {
  market: string
  target_customer: string
  your_product?: string | null
  business_goal?: string | null
  geography?: string | null
  primary_constraint?: string | null
  risk_posture?: RiskPosture | null
  ambition_level?: AmbitionLevel | null
  organizational_capabilities?: string | null
  decision_level?: DecisionLevel | null
  explicit_non_goals?: string | null
  input_confidence?: InputConfidence | null
  // New hypothesis-first fields
  starting_point?: 'product' | 'problem' | 'customer' | 'market' | null
  hypothesis?: string | null
  problem_statement?: string | null
  customer_profile?: string | null
  market_context?: string | null
  solution_idea?: string | null
  // Computed context summary (from buildProjectContext)
  lens?: 'product' | 'problem' | 'customer' | 'market'
  summaryText?: string
}

export interface CompetitorContext {
  name: string
  url?: string | null
  notes?: string | null
  evidence_text: string
}

export interface SnapshotPromptInput {
  project: ProjectContext
  competitor: CompetitorContext
}

export const COMPETITOR_SNAPSHOT_SCHEMA_SHAPE = {
  competitor_name: 'string',
  positioning_one_liner: 'string',
  target_audience: ['string'],
  primary_use_cases: ['string'],
  key_value_props: ['string'],
  notable_capabilities: ['string'],
  business_model_signals: ['string'],
  proof_points: [
    {
      claim: 'string',
      evidence_quote:
        'short quote (around 25 words or fewer) copied verbatim from evidence_text',
      evidence_location: 'pasted_text',
      confidence: 'low | med | high',
    },
  ],
  risks_and_unknowns: ['string'],
  customer_struggles: ['string'], // Optional: What customers struggle with today
} as const

function stringifySchemaForPrompt(schemaShape: unknown): string {
  return JSON.stringify(schemaShape, null, 2)
}

export function buildSnapshotMessages(input: SnapshotPromptInput): Message[] {
  const { project, competitor } = input

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

  // Problem statement (for problem lens)
  if (project.problem_statement) {
    projectLines.push(`Problem: ${project.problem_statement}`)
  }

  // Solution idea (for product lens)
  if (project.solution_idea) {
    projectLines.push(`Solution: ${project.solution_idea}`)
  }

  if (project.geography) {
    projectLines.push(`Geography: ${project.geography}`)
  }

  if (project.primary_constraint) {
    projectLines.push(`Primary constraint: ${project.primary_constraint}`)
  }

  if (project.risk_posture) {
    const postureLabels: Record<string, string> = {
      near_term_traction: 'Near-term traction',
      long_term_defensibility: 'Long-term defensibility',
      balanced: 'Balanced',
    }
    projectLines.push(
      `Risk posture: ${postureLabels[project.risk_posture] || project.risk_posture}`
    )
  }

  if (project.ambition_level) {
    const ambitionLabels: Record<string, string> = {
      core_optimization: 'Core optimization',
      adjacent_expansion: 'Adjacent expansion',
      category_redefinition: 'Category redefinition',
    }
    projectLines.push(
      `Ambition level: ${ambitionLabels[project.ambition_level] || project.ambition_level}`
    )
  }

  if (project.organizational_capabilities) {
    projectLines.push(
      `Organizational capabilities: ${project.organizational_capabilities}`
    )
  }

  if (project.decision_level) {
    projectLines.push(`Decision level: ${project.decision_level}`)
  }

  if (project.explicit_non_goals) {
    projectLines.push(`Explicit non-goals: ${project.explicit_non_goals}`)
  }

  if (project.input_confidence) {
    const confidenceLabels: Record<string, string> = {
      very_confident: 'Very confident',
      some_assumptions: 'Some assumptions',
      exploratory: 'Exploratory',
    }
    projectLines.push(
      `Input confidence: ${confidenceLabels[project.input_confidence] || project.input_confidence}`
    )
  }

  const competitorLines: string[] = [`Name: ${competitor.name}`]

  if (competitor.url) {
    competitorLines.push(`URL: ${competitor.url}`)
  }

  if (competitor.notes) {
    competitorLines.push(`Analyst notes: ${competitor.notes}`)
  }

  const userContent = [
    'TASK',
    'Analyze the evidence for this competitor and produce a single CompetitorSnapshot JSON object.',
    'Outputs must evaluate the user\'s hypothesis; do not assume a finished product exists.',
    '',
    'PROJECT CONTEXT',
    projectLines.join('\n'),
    '',
    'COMPETITOR CONTEXT',
    competitorLines.join('\n'),
    '',
    'EVIDENCE TEXT',
    'Use only the text between EVIDENCE_TEXT_START and EVIDENCE_TEXT_END as factual evidence.',
    'If something is not clearly present in this evidence, treat it as unknown or risky.',
    'EVIDENCE_TEXT_START',
    competitor.evidence_text,
    'EVIDENCE_TEXT_END',
    '',
    'OUTPUT SCHEMA',
    'You must output a JSON object that matches the following CompetitorSnapshot schema shape (keys and nesting must match exactly):',
    stringifySchemaForPrompt(COMPETITOR_SNAPSHOT_SCHEMA_SHAPE),
    '',
    'OUTPUT RULES',
    '1) Output a single JSON object only. No surrounding prose, labels, or explanations.',
    '2) Do not use markdown or backticks. Do not wrap the JSON in any kind of code fence.',
    '3) Use exactly the schema keys shown above. Do not add, remove, or rename keys.',
    '4) Use standard JSON syntax with double-quoted keys and string values.',
    '5) If information is missing, represent it via risks_and_unknowns or business_model_signals rather than inventing details.',
    '',
    'CONTENT RULES',
    '• competitor_name must match the competitor name given in the context.',
    '• positioning_one_liner should be a crisp, non-fluffy one-sentence summary of how this competitor positions itself.',
    '• target_audience should contain at least 1 entry describing who they are selling to.',
    '• primary_use_cases should contain at least 1 entry describing what problems they solve.',
    '• key_value_props should contain 3–6 distinct value propositions (no more than 6).',
    '• notable_capabilities should contain 3–8 concrete capabilities or features (no more than 8).',
    '• business_model_signals should describe how they appear to make money, package features, or go to market; if the signal is not in the evidence, add entries such as "Not stated in evidence".',
    '• proof_points should contain 3–6 items. Each claim must be directly supported by the evidence_text.',
    '• For every proof point, evidence_quote must be a short excerpt (around 25 words or fewer) copied verbatim from the evidence_text.',
    '• For every proof point, set evidence_location to "pasted_text".',
    '• Set confidence based on how directly the evidence supports the claim: low, med, or high.',
    '• risks_and_unknowns should capture gaps, uncertainties, or places where you cannot be confident; if something is implied but not clearly supported, add entries such as "Not supported by provided evidence" or "Not stated in evidence".',
    '• customer_struggles (optional): Extract what customers actually struggle with based on reviews, support forums, or user feedback. Only include if evidence contains clear complaints, pain points, or negative feedback. Focus on specific, actionable struggles rather than vague dissatisfaction.',
    '',
    'HANDLING MISSING OR UNSUPPORTED INFORMATION',
    '• Never fabricate pricing, security, compliance, or other sensitive details.',
    '• If a detail is missing from the evidence, either omit the claim or mark it explicitly in risks_and_unknowns or business_model_signals as "Not stated in evidence" or "Not supported by provided evidence".',
  ].join('\n')

  return [getSystemStyleGuide(), { role: 'user', content: userContent }]
}


