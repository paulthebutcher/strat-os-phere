import { z } from 'zod'

/**
 * Evaluation criterion for competitive scoring
 */
export const ScoringCriterionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''), // Always returns string, defaults to empty if missing
  weight: z.number().int().min(1).max(5).default(3),
  how_to_score: z.string().default(''), // Rubric for scoring, always returns string
})

/**
 * Dimension scores for evaluating how well a competitor supports a criterion
 * Each dimension is scored independently on a 0.0-1.0 continuous scale
 * All scores allow decimals and have safe defaults
 */
export const CriterionDimensionScoresSchema = z.object({
  discovery_support: z
    .number()
    .min(0.0, { message: 'discovery_support must be between 0.0 and 1.0' })
    .max(1.0, { message: 'discovery_support must be between 0.0 and 1.0' })
    .default(0.5)
    .refine((val) => !isNaN(val) && isFinite(val), { message: 'discovery_support must be a valid number' }),
  execution_support: z
    .number()
    .min(0.0, { message: 'execution_support must be between 0.0 and 1.0' })
    .max(1.0, { message: 'execution_support must be between 0.0 and 1.0' })
    .default(0.5)
    .refine((val) => !isNaN(val) && isFinite(val), { message: 'execution_support must be a valid number' }),
  reliability: z
    .number()
    .min(0.0, { message: 'reliability must be between 0.0 and 1.0' })
    .max(1.0, { message: 'reliability must be between 0.0 and 1.0' })
    .default(0.5)
    .refine((val) => !isNaN(val) && isFinite(val), { message: 'reliability must be a valid number' }),
  flexibility: z
    .number()
    .min(0.0, { message: 'flexibility must be between 0.0 and 1.0' })
    .max(1.0, { message: 'flexibility must be between 0.0 and 1.0' })
    .default(0.5)
    .refine((val) => !isNaN(val) && isFinite(val), { message: 'flexibility must be a valid number' }),
  friction: z
    .number()
    .min(0.0, { message: 'friction must be between 0.0 and 1.0' })
    .max(1.0, { message: 'friction must be between 0.0 and 1.0' })
    .default(0.5)
    .refine((val) => !isNaN(val) && isFinite(val), { message: 'friction must be a valid number' }),
})

/**
 * Score for a specific competitor on a specific criterion
 * Uses graded dimension scores (0.0-1.0) instead of a single boolean/1-5 score
 */
export const CriterionScoreSchema = z.object({
  competitor_id: z.string().optional(),
  competitor_name: z.string().min(1),
  criteria_id: z.string().min(1),
  dimensions: CriterionDimensionScoresSchema,
  evidence: z.string().optional(),
})

/**
 * Summary for a competitor across all criteria
 */
export const CompetitorScoreSummarySchema = z.object({
  competitor_id: z.string().optional(),
  competitor_name: z.string().min(1),
  total_weighted_score: z.number().min(0).max(100).default(50),
  strengths: z.array(z.string().min(1)).default([]),
  weaknesses: z.array(z.string().min(1)).default([]),
})

/**
 * Metadata for Scoring Matrix artifact
 */
export const ScoringMetaSchema = z.object({
  generated_at: z.string(),
  model: z.string().optional(),
  run_id: z.string().optional(),
  schema_version: z.number().optional(),
  signals: z.record(z.unknown()).optional(), // Quality signals stored here
  partial: z.boolean().optional(), // Indicates partial/degraded result
})

/**
 * Complete Scoring Matrix artifact content
 * Relaxed constraints to allow partial/degraded results
 */
export const ScoringMatrixArtifactContentSchema = z.object({
  meta: ScoringMetaSchema,
  criteria: z.array(ScoringCriterionSchema).min(1).max(15), // Relaxed from 6-10 to 1-15
  scores: z.array(CriterionScoreSchema).min(0), // Allow empty scores array
  summary: z.array(CompetitorScoreSummarySchema).min(0), // Allow empty summary
  notes: z.string().optional(),
})

export type ScoringCriterion = z.infer<typeof ScoringCriterionSchema>
export type CriterionDimensionScores = z.infer<typeof CriterionDimensionScoresSchema>
export type CriterionScore = z.infer<typeof CriterionScoreSchema>
export type CompetitorScoreSummary = z.infer<typeof CompetitorScoreSummarySchema>
export type ScoringMeta = z.infer<typeof ScoringMetaSchema>
export type ScoringMatrixArtifactContent = z.infer<typeof ScoringMatrixArtifactContentSchema>

