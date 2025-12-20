import { z } from 'zod'

export const OpportunityTypeSchema = z.enum([
  'product_capability',
  'workflow',
  'pricing_packaging',
  'distribution',
  'trust_compliance',
  'integration',
  'services',
])

export const OpportunityEffortSchema = z.enum(['S', 'M', 'L']) // Small, Medium, Large
export const OpportunityImpactSchema = z.enum(['low', 'med', 'high'])
export const OpportunityConfidenceSchema = z.enum(['low', 'med', 'high'])

/**
 * Differentiation Opportunity schema
 * Each opportunity must be specific and non-buzzword-y
 */
export const OpportunityItemSchema = z.object({
  title: z.string().min(1),
  type: OpportunityTypeSchema,
  who_it_serves: z.string().min(1),
  job_link: z
    .union([z.string(), z.number().int().positive()])
    .optional(), // References JTBD index or id
  why_now: z.string().min(1), // Market trigger
  how_to_win: z.array(z.string().min(1)).min(1),
  what_competitors_do_today: z.string().min(1),
  why_they_cant_easily_copy: z.string().min(1),
  effort: OpportunityEffortSchema,
  impact: OpportunityImpactSchema,
  confidence: OpportunityConfidenceSchema,
  score: z.number().int().min(0).max(100), // Computed deterministically
  risks: z.array(z.string().min(1)),
  first_experiments: z
    .array(z.string().min(1))
    .min(1)
    .refine(
      (val) => val.every((exp) => exp.length > 20),
      {
        message: 'Each first_experiment must be concrete and testable in 1-2 weeks (at least 20 chars)',
      }
    ),
})

/**
 * Metadata for Opportunities artifact
 */
export const OpportunitiesMetaSchema = z.object({
  generated_at: z.string(),
  model: z.string().optional(),
  run_id: z.string().optional(),
  schema_version: z.number().optional(),
  signals: z.record(z.unknown()).optional(), // Quality signals stored here
})

/**
 * Complete Opportunities artifact content
 */
export const OpportunitiesArtifactContentSchema = z.object({
  meta: OpportunitiesMetaSchema,
  opportunities: z.array(OpportunityItemSchema).min(5).max(10),
})

export type OpportunityType = z.infer<typeof OpportunityTypeSchema>
export type OpportunityEffort = z.infer<typeof OpportunityEffortSchema>
export type OpportunityImpact = z.infer<typeof OpportunityImpactSchema>
export type OpportunityConfidence = z.infer<typeof OpportunityConfidenceSchema>
export type OpportunityItem = z.infer<typeof OpportunityItemSchema>
export type OpportunitiesMeta = z.infer<typeof OpportunitiesMetaSchema>
export type OpportunitiesArtifactContent = z.infer<typeof OpportunitiesArtifactContentSchema>

