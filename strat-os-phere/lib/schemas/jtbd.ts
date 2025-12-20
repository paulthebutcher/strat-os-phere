import { z } from 'zod'

/**
 * Evidence reference linking a JTBD to competitor evidence
 */
export const JtbdEvidenceSchema = z.object({
  competitor: z.string().optional(),
  citation: z.string().url().optional(),
  quote: z.string().optional(),
})

export const JtbdFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'rare'])

/**
 * Jobs To Be Done (JTBD) schema
 * Each job must be concrete, testable, and specific
 */
export const JtbdItemSchema = z.object({
  job_statement: z
    .string()
    .min(1)
    .refine(
      (val) =>
        val.toLowerCase().includes('when') &&
        val.toLowerCase().includes('i want to') &&
        val.toLowerCase().includes('so i can'),
      {
        message:
          'job_statement must follow format: "When <context>, I want to <action>, so I can <outcome>."',
      }
    ),
  context: z.string().min(1),
  desired_outcomes: z
    .array(z.string().min(1))
    .min(1, { message: 'At least one measurable outcome is required' }),
  constraints: z.array(z.string().min(1)),
  current_workarounds: z.array(z.string().min(1)),
  non_negotiables: z.array(z.string().min(1)),
  who: z.string().min(1), // Persona shorthand, not a demographic essay
  frequency: JtbdFrequencySchema,
  importance_score: z.number().int().min(1).max(5),
  satisfaction_score: z.number().int().min(1).max(5),
  opportunity_score: z.number().int().min(0).max(100), // Computed deterministically
  evidence: z.array(JtbdEvidenceSchema).optional(),
})

/**
 * Metadata for JTBD artifact
 */
export const JtbdMetaSchema = z.object({
  generated_at: z.string(),
  model: z.string().optional(),
  run_id: z.string().optional(),
  schema_version: z.number().optional(),
  signals: z.record(z.unknown()).optional(), // Quality signals stored here
})

/**
 * Complete JTBD artifact content
 */
export const JtbdArtifactContentSchema = z.object({
  meta: JtbdMetaSchema,
  jobs: z.array(JtbdItemSchema).min(8).max(12),
})

export type JtbdFrequency = z.infer<typeof JtbdFrequencySchema>
export type JtbdEvidence = z.infer<typeof JtbdEvidenceSchema>
export type JtbdItem = z.infer<typeof JtbdItemSchema>
export type JtbdMeta = z.infer<typeof JtbdMetaSchema>
export type JtbdArtifactContent = z.infer<typeof JtbdArtifactContentSchema>

