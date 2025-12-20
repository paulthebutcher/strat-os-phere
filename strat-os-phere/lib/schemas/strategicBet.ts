import { z } from 'zod'

/**
 * First real-world proof schema
 * Each bet must include a concrete, behavioral test
 */
export const FirstRealWorldProofSchema = z.object({
  description: z.string().min(1),
  timeframe_weeks: z.number().int().positive(),
  success_signal: z.string().min(1),
})

/**
 * Supporting signal schema
 */
export const SupportingSignalSchema = z.object({
  source_type: z.string().min(1),
  citation_count: z.number().int().nonnegative(),
})

/**
 * Strategic bet item schema
 * Each bet represents a concrete, decision-ready commitment under constraint
 */
export const StrategicBetItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1), // 2-3 sentence plain-English description
  opportunity_source_ids: z.array(z.string().min(1)), // References to Opportunities v2 / JTBD IDs
  what_we_say_no_to: z.array(z.string().min(1)).min(1), // Explicit deprioritized directions
  forced_capabilities: z.array(z.string().min(1)).min(1), // Capabilities required to win
  why_competitors_wont_follow: z.string().min(1), // Structural, economic, or organizational friction
  first_real_world_proof: FirstRealWorldProofSchema,
  invalidation_signals: z.array(z.string().min(1)).min(1), // What evidence would prove this bet is wrong
  confidence_score: z.number().int().min(0).max(100), // 0-100 derived from signal strength, consensus, and data freshness
  supporting_signals: z.array(SupportingSignalSchema),
  created_at: z.string(), // ISO 8601
  schema_version: z.literal(1),
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
  bets: z.array(StrategicBetItemSchema).min(2).max(4),
})

export type FirstRealWorldProof = z.infer<typeof FirstRealWorldProofSchema>
export type SupportingSignal = z.infer<typeof SupportingSignalSchema>
export type StrategicBetItem = z.infer<typeof StrategicBetItemSchema>
export type StrategicBetsMeta = z.infer<typeof StrategicBetsMetaSchema>
export type StrategicBetsArtifactContent = z.infer<typeof StrategicBetsArtifactContentSchema>

