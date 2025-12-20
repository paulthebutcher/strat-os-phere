import { z } from 'zod'

/**
 * Evaluation criterion for competitive scoring
 */
export const ScoringCriterionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  weight: z.number().int().min(1).max(5),
  how_to_score: z.string().min(1), // Rubric for scoring
})

/**
 * Score for a specific competitor on a specific criterion
 */
export const CriterionScoreSchema = z.object({
  competitor_id: z.string().optional(),
  competitor_name: z.string().min(1),
  criteria_id: z.string().min(1),
  score: z.number().int().min(1).max(5),
  evidence: z.string().optional(),
})

/**
 * Summary for a competitor across all criteria
 */
export const CompetitorScoreSummarySchema = z.object({
  competitor_id: z.string().optional(),
  competitor_name: z.string().min(1),
  total_weighted_score: z.number().min(0).max(100),
  strengths: z.array(z.string().min(1)),
  weaknesses: z.array(z.string().min(1)),
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
})

/**
 * Complete Scoring Matrix artifact content
 */
export const ScoringMatrixArtifactContentSchema = z.object({
  meta: ScoringMetaSchema,
  criteria: z.array(ScoringCriterionSchema).min(6).max(10),
  scores: z.array(CriterionScoreSchema).min(1),
  summary: z.array(CompetitorScoreSummarySchema).min(1),
  notes: z.string().optional(),
})

export type ScoringCriterion = z.infer<typeof ScoringCriterionSchema>
export type CriterionScore = z.infer<typeof CriterionScoreSchema>
export type CompetitorScoreSummary = z.infer<typeof CompetitorScoreSummarySchema>
export type ScoringMeta = z.infer<typeof ScoringMetaSchema>
export type ScoringMatrixArtifactContent = z.infer<typeof ScoringMatrixArtifactContentSchema>

