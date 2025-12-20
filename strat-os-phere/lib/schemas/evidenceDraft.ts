import { z } from 'zod'

/**
 * Schema for evidence draft sections
 */
export const EvidenceSectionSchema = z.object({
  bullets: z.array(z.string().min(1)),
  sources: z.array(z.string().url()).min(1), // Each section must have at least one source URL
})

/**
 * Schema for the complete evidence draft
 */
export const EvidenceDraftSchema = z.object({
  competitor_name: z.string().min(1),
  domain: z.string().min(1),
  sections: z.object({
    positioning: EvidenceSectionSchema,
    pricing: EvidenceSectionSchema,
    target_customers: EvidenceSectionSchema,
    key_features: EvidenceSectionSchema,
    integrations: EvidenceSectionSchema.optional(), // Optional - may not always be found
    enterprise_signals: EvidenceSectionSchema.optional(), // Optional - may not always be found
  }),
})

export type EvidenceSection = z.infer<typeof EvidenceSectionSchema>
export type EvidenceDraft = z.infer<typeof EvidenceDraftSchema>

