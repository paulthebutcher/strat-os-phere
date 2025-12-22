import { z } from 'zod'

/**
 * Citation schema - references to evidence sources
 */
export const CitationSchema = z.object({
  url: z.string().url(),
  title: z.string().optional().nullable(),
  source_type: z.enum([
    'marketing_site',
    'changelog',
    'pricing',
    'reviews',
    'jobs',
    'docs',
    'status',
  ]),
  extracted_at: z.string().optional().nullable(), // ISO date string
  source_date_range: z.string().optional().nullable(), // e.g., "last 90 days"
  confidence: z.enum(['low', 'medium', 'high']).optional().nullable(),
  domain: z.string().optional().nullable(),
})

export type Citation = z.infer<typeof CitationSchema>

/**
 * Proof point with citation
 */
export const ProofPointSchema = z.object({
  claim: z.string().min(1),
  citations: z.array(CitationSchema).min(1), // At least one citation per proof point
})

export type ProofPoint = z.infer<typeof ProofPointSchema>

/**
 * Scoring breakdown dimensions (0-10 scale)
 */
export const ScoringBreakdownSchema = z.object({
  customer_pain: z.number().min(0).max(10),
  willingness_to_pay: z.number().min(0).max(10),
  strategic_fit: z.number().min(0).max(10),
  feasibility: z.number().min(0).max(10),
  defensibility: z.number().min(0).max(10),
  competitor_gap: z.number().min(0).max(10),
  recencyConfidence: z.number().min(0).max(10),
})

export type ScoringBreakdown = z.infer<typeof ScoringBreakdownSchema>

/**
 * Scoring weights (must sum to 1.0)
 */
export const ScoringWeightsSchema = z
  .object({
    customer_pain: z.number().min(0).max(1),
    willingness_to_pay: z.number().min(0).max(1),
    strategic_fit: z.number().min(0).max(1),
    feasibility: z.number().min(0).max(1),
    defensibility: z.number().min(0).max(1),
    competitor_gap: z.number().min(0).max(1),
    recencyConfidence: z.number().min(0).max(1),
  })
  .refine(
    (weights) => {
      const sum =
        weights.customer_pain +
        weights.willingness_to_pay +
        weights.strategic_fit +
        weights.feasibility +
        weights.defensibility +
        weights.competitor_gap +
        weights.recencyConfidence
      return Math.abs(sum - 1.0) < 0.01 // Allow small floating point errors
    },
    { message: 'Weights must sum to 1.0' }
  )

export type ScoringWeights = z.infer<typeof ScoringWeightsSchema>

/**
 * Score explainability entry
 */
export const ScoreExplainabilitySchema = z.object({
  explanation: z.string().min(1),
  citations: z.array(CitationSchema).optional().nullable(),
})

export type ScoreExplainability = z.infer<typeof ScoreExplainabilitySchema>

/**
 * Scoring schema with breakdown, weights, and explainability
 */
export const ScoringSchema = z.object({
  total: z.number().int().min(0).max(100),
  breakdown: ScoringBreakdownSchema,
  weights: ScoringWeightsSchema,
  explainability: z.array(ScoreExplainabilitySchema).min(3).max(5),
})

export type Scoring = z.infer<typeof ScoringSchema>

/**
 * Tradeoffs schema
 */
export const TradeoffsSchema = z.object({
  what_we_say_no_to: z.array(z.string().min(1)).min(2).max(4),
  capability_forced: z.array(z.string().min(1)).min(2).max(4),
  why_competitors_wont_follow: z.array(z.string().min(1)).min(2).max(4),
})

export type Tradeoffs = z.infer<typeof TradeoffsSchema>

/**
 * Experiment schema
 */
export const ExperimentSchema = z.object({
  hypothesis: z.string().min(1),
  smallest_test: z.string().min(1),
  success_metric: z.string().min(1),
  expected_timeframe: z.string().min(1), // e.g., "2 weeks"
  risk_reduced: z.string().min(1),
})

export type Experiment = z.infer<typeof ExperimentSchema>

/**
 * Dependencies schema
 */
export const DependenciesSchema = z.object({
  linked_competitors: z.array(z.string().uuid()).optional().nullable(),
  linked_jtbd_ids: z.array(z.union([z.string(), z.number()])).optional().nullable(),
  linked_signals: z.array(z.string()).optional().nullable(), // References to evidence source IDs
})

export type Dependencies = z.infer<typeof DependenciesSchema>

/**
 * Meta schema for OpportunityV3 artifact
 */
export const OpportunityV3MetaSchema = z.object({
  generated_at: z.string(),
  run_id: z.string().optional().nullable(),
  inputs_used: z.object({
    jtbd: z.boolean().default(false),
    scorecard: z.boolean().default(false),
    live_signals: z.boolean().default(false),
    profiles: z.boolean().default(false),
    pricing: z.boolean().default(false),
    reviews: z.boolean().default(false),
    jobs: z.boolean().default(false),
    changelog: z.boolean().default(false),
  }),
  signals_summary: z.object({
    evidence_sources_count: z.number().int().min(0).default(0),
    review_sources_count: z.number().int().min(0).default(0),
    pricing_sources_count: z.number().int().min(0).default(0),
    changelog_sources_count: z.number().int().min(0).default(0),
    jobs_sources_count: z.number().int().min(0).default(0),
  }),
})

export type OpportunityV3Meta = z.infer<typeof OpportunityV3MetaSchema>

/**
 * OpportunityV3 item schema
 * This is the canonical opportunity object that becomes the only thing the Results UI renders
 */
export const OpportunityV3ItemSchema = z.object({
  id: z.string().min(1), // Stable slug-like ID derived from normalized title + projectId + primary JTBD
  title: z.string().min(1).max(100), // Short (6-10 words), non-buzzword
  one_liner: z.string().min(1), // 1 sentence that reads like a strategic recommendation
  customer: z.string().min(1), // Who experiences the pain
  problem_today: z.string().min(1), // What's happening right now (must be grounded in recent signals)
  proposed_move: z.string().min(1), // What to build/do
  why_now: z.string().min(1), // Why this matters now (market shift, competitor actions, pricing friction)
  proof_points: z.array(ProofPointSchema).min(3).max(6), // Array of 3-6 bullets, each with citations
  citations: z.array(CitationSchema).min(4), // At least 4 unique citations across mixed source types when available
  scoring: ScoringSchema,
  tradeoffs: TradeoffsSchema,
  experiments: z.array(ExperimentSchema).min(3).max(5), // 3-5 first experiments
  dependencies: DependenciesSchema,
})

export type OpportunityV3Item = z.infer<typeof OpportunityV3ItemSchema>

/**
 * Complete OpportunityV3 artifact content
 */
export const OpportunityV3ArtifactContentSchema = z.object({
  meta: OpportunityV3MetaSchema,
  opportunities: z.array(OpportunityV3ItemSchema).min(6).max(10), // 6-10 opportunities
})

export type OpportunityV3ArtifactContent = z.infer<
  typeof OpportunityV3ArtifactContentSchema
>

