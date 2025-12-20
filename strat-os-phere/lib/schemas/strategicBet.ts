import { z } from 'zod'

export const StrategicBetConfidenceSchema = z.enum(['high', 'medium', 'low'])

/**
 * Disconfirming experiment schema
 * Each bet must include a falsifiable experiment
 */
export const DisconfirmingExperimentSchema = z.object({
  experiment: z.string().min(1),
  success_signal: z.string().min(1),
  failure_signal: z.string().min(1),
})

/**
 * Strategic bet metadata
 */
export const StrategicBetMetaSchema = z.object({
  based_on_competitors: z.number().int().positive(),
  signals_used: z.array(z.string().min(1)),
  created_at: z.string(), // ISO 8601
  schema_version: z.number().optional(),
})

/**
 * Strategic bet item schema
 * Each bet represents a concrete, decision-ready commitment under constraint
 */
export const StrategicBetItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  confidence: StrategicBetConfidenceSchema,
  bet_statement: z
    .string()
    .min(1)
    .refine(
      (val) => val.endsWith('.') || val.endsWith('!'),
      {
        message: 'bet_statement must be a complete sentence ending with . or !',
      }
    ),
  tradeoffs: z.array(z.string().min(1)).min(1),
  forced_capability: z.string().min(1),
  competitor_constraints: z.array(z.string().min(1)).min(1),
  disconfirming_experiment: DisconfirmingExperimentSchema,
  meta: StrategicBetMetaSchema,
})

/**
 * Metadata for Strategic Bets artifact
 */
export const StrategicBetsMetaSchema = z.object({
  generated_at: z.string(),
  model: z.string().optional(),
  run_id: z.string().optional(),
  schema_version: z.number().optional(),
  signals: z.record(z.unknown()).optional(), // Quality signals stored here
})

/**
 * Complete Strategic Bets artifact content
 */
export const StrategicBetsArtifactContentSchema = z.object({
  meta: StrategicBetsMetaSchema,
  bets: z.array(StrategicBetItemSchema).min(2).max(3),
})

export type StrategicBetConfidence = z.infer<typeof StrategicBetConfidenceSchema>
export type DisconfirmingExperiment = z.infer<typeof DisconfirmingExperimentSchema>
export type StrategicBetMeta = z.infer<typeof StrategicBetMetaSchema>
export type StrategicBetItem = z.infer<typeof StrategicBetItemSchema>
export type StrategicBetsMeta = z.infer<typeof StrategicBetsMetaSchema>
export type StrategicBetsArtifactContent = z.infer<typeof StrategicBetsArtifactContentSchema>

