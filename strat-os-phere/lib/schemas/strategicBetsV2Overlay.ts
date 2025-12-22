import { z } from 'zod'

/**
 * Citation schema for v2 overlay
 */
export const StrategicBetCitationV2Schema = z.object({
  url: z.string().min(1),
  source_type: z.string().optional(),
  extracted_at: z.string().optional(),
})

/**
 * Strategic bet item schema for v2 overlay
 */
export const StrategicBetV2OverlayItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  what_we_say_no_to: z.array(z.string().min(1)).min(1),
  capability_we_must_build: z.array(z.string().min(1)).min(1),
  why_competitors_wont_follow_easily: z.string().min(1),
  risk_and_assumptions: z.array(z.string().min(1)).min(1),
  decision_owner: z.string().min(1),
  time_horizon: z.enum(['Now', 'Next', 'Later']),
  citations: z.array(StrategicBetCitationV2Schema).min(0),
})

/**
 * Metadata schema for v2 overlay
 */
export const StrategicBetsV2OverlayMetaSchema = z.object({
  generated_at: z.string(),
  window_days: z.number().int().positive(),
  coverage_score: z.number().int().min(0).max(100).optional(),
})

/**
 * Complete Strategic Bets v2 overlay schema
 */
export const StrategicBetsV2OverlaySchema = z.object({
  schema_version: z.literal(2),
  meta: StrategicBetsV2OverlayMetaSchema,
  bets: z.array(StrategicBetV2OverlayItemSchema).min(1).max(10),
})

export type StrategicBetCitationV2 = z.infer<typeof StrategicBetCitationV2Schema>
export type StrategicBetV2OverlayItem = z.infer<typeof StrategicBetV2OverlayItemSchema>
export type StrategicBetsV2OverlayMeta = z.infer<typeof StrategicBetsV2OverlayMetaSchema>
export type StrategicBetsV2Overlay = z.infer<typeof StrategicBetsV2OverlaySchema>

