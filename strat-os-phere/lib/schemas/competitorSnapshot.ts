import { z } from 'zod'

export const EvidenceLocationSchema = z.literal('pasted_text')

export const ConfidenceSchema = z.enum(['low', 'med', 'high'])

export const ProofPointSchema = z.object({
  claim: z.string().min(1, { message: 'claim is required' }),
  evidence_quote: z
    .string()
    .min(1, { message: 'evidence_quote is required' })
    .max(260, {
      message: 'evidence_quote should be brief (around 25 words)',
    }),
  evidence_location: EvidenceLocationSchema,
  confidence: ConfidenceSchema,
})

export const CompetitorSnapshotSchema = z.object({
  competitor_name: z.string().min(1, { message: 'competitor_name is required' }),
  positioning_one_liner: z
    .string()
    .min(1, { message: 'positioning_one_liner is required' }),
  target_audience: z
    .array(z.string().min(1))
    .min(1, { message: 'target_audience must include at least one entry' }),
  primary_use_cases: z
    .array(z.string().min(1))
    .min(1, { message: 'primary_use_cases must include at least one entry' }),
  key_value_props: z
    .array(z.string().min(1))
    .min(1, { message: 'key_value_props must include at least one entry' })
    .max(6, { message: 'key_value_props should not exceed 6 items' }),
  notable_capabilities: z
    .array(z.string().min(1))
    .min(1, { message: 'notable_capabilities must include at least one entry' }),
  business_model_signals: z
    .array(z.string().min(1))
    .min(1, { message: 'business_model_signals must include at least one entry' }),
  proof_points: z
    .array(ProofPointSchema)
    .min(1, { message: 'proof_points must include at least one entry' }),
  risks_and_unknowns: z
    .array(z.string().min(1))
    .min(1, { message: 'risks_and_unknowns must include at least one entry' }),
  customer_struggles: z
    .array(z.string().min(1))
    .optional(), // Optional: What customers struggle with today (from reviews, support forums, etc.)
})

export type EvidenceLocation = z.infer<typeof EvidenceLocationSchema>
export type Confidence = z.infer<typeof ConfidenceSchema>
export type ProofPoint = z.infer<typeof ProofPointSchema>
export type CompetitorSnapshot = z.infer<typeof CompetitorSnapshotSchema>


