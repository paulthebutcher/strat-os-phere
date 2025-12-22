import { z } from 'zod'

/**
 * First experiment schema for v2 overlay
 */
export const FirstExperimentV2Schema = z.object({
  steps: z.array(z.string().min(1)).min(1),
  metric: z.string().min(1),
  duration_days: z.number().int().positive(),
})

/**
 * Citation schema for v2 overlay
 */
export const CitationV2Schema = z.object({
  url: z.string().min(1),
  source_type: z.string().optional(),
  extracted_at: z.string().optional(),
})

/**
 * Opportunity item schema for v2 overlay
 */
export const OpportunityV2OverlayItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  one_liner: z.string().min(1),
  differentiation_mechanism: z.array(z.string().min(1)).min(1),
  why_competitors_wont_follow: z.array(z.string().min(1)).min(1),
  first_experiment: FirstExperimentV2Schema,
  confidence: z.enum(['high', 'medium', 'low']),
  citations: z.array(CitationV2Schema).min(0),
  score: z.number().int().min(0).max(100).optional(),
})

/**
 * Metadata schema for v2 overlay
 */
export const OpportunitiesV2OverlayMetaSchema = z.object({
  generated_at: z.string(),
  window_days: z.number().int().positive(),
  coverage_score: z.number().int().min(0).max(100).optional(),
})

/**
 * Complete Opportunities v2 overlay schema
 */
export const OpportunitiesV2OverlaySchema = z.object({
  schema_version: z.literal(2),
  meta: OpportunitiesV2OverlayMetaSchema,
  opportunities: z.array(OpportunityV2OverlayItemSchema).min(1).max(10),
})

export type FirstExperimentV2 = z.infer<typeof FirstExperimentV2Schema>
export type CitationV2 = z.infer<typeof CitationV2Schema>
export type OpportunityV2OverlayItem = z.infer<typeof OpportunityV2OverlayItemSchema>
export type OpportunitiesV2OverlayMeta = z.infer<typeof OpportunitiesV2OverlayMetaSchema>
export type OpportunitiesV2Overlay = z.infer<typeof OpportunitiesV2OverlaySchema>

