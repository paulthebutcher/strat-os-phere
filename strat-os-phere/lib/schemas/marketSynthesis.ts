import { z } from 'zod'

export const MarketSummarySchema = z.object({
  headline: z.string().min(1, { message: 'headline is required' }),
  what_is_changing: z
    .array(z.string().min(1))
    .min(1, { message: 'what_is_changing must include at least one entry' }),
  what_buyers_care_about: z
    .array(z.string().min(1))
    .min(1, { message: 'what_buyers_care_about must include at least one entry' }),
})

export const ThemeSchema = z.object({
  theme: z.string().min(1, { message: 'theme is required' }),
  description: z.string().min(1, { message: 'description is required' }),
  competitors_supporting: z
    .array(z.string().min(1))
    .min(1, { message: 'competitors_supporting must include at least one entry' }),
})

export const ClusterSchema = z.object({
  cluster_name: z.string().min(1, { message: 'cluster_name is required' }),
  who_is_in_it: z
    .array(z.string().min(1))
    .min(1, { message: 'who_is_in_it must include at least one entry' }),
  cluster_logic: z.string().min(1, { message: 'cluster_logic is required' }),
})

export const PositioningQuadrantSchema = z.object({
  name: z.string().min(1, { message: 'quadrant name is required' }),
  competitors: z
    .array(z.string().min(1))
    .min(1, { message: 'quadrant competitors must include at least one entry' }),
  notes: z.string().min(1, { message: 'quadrant notes are required' }),
})

export const PositioningMapTextSchema = z.object({
  axis_x: z.string().min(1, { message: 'axis_x is required' }),
  axis_y: z.string().min(1, { message: 'axis_y is required' }),
  quadrants: z
    .array(PositioningQuadrantSchema)
    .min(1, { message: 'quadrants must include at least one entry' }),
})

export const OpportunitySchema = z.object({
  opportunity: z.string().min(1, { message: 'opportunity is required' }),
  who_it_serves: z.string().min(1, { message: 'who_it_serves is required' }),
  why_now: z.string().min(1, { message: 'why_now is required' }),
  why_competitors_miss_it: z
    .string()
    .min(1, { message: 'why_competitors_miss_it is required' }),
  suggested_angle: z
    .string()
    .min(1, { message: 'suggested_angle is required' }),
  risk_or_assumption: z
    .string()
    .min(1, { message: 'risk_or_assumption is required' }),
  priority: z
    .number()
    .int({ message: 'priority must be an integer' })
    .min(1, { message: 'priority must be at least 1' }),
})

export const RecommendedDifferentiationAngleSchema = z.object({
  angle: z.string().min(1, { message: 'angle is required' }),
  what_to_claim: z.string().min(1, { message: 'what_to_claim is required' }),
  how_to_prove: z
    .array(z.string().min(1))
    .min(1, { message: 'how_to_prove must include at least one entry' }),
  watch_out_for: z
    .array(z.string().min(1))
    .min(1, { message: 'watch_out_for must include at least one entry' }),
})

export const MarketSynthesisSchema = z.object({
  market_summary: MarketSummarySchema,
  themes: z
    .array(ThemeSchema)
    .min(1, { message: 'themes must include at least one entry' }),
  clusters: z
    .array(ClusterSchema)
    .min(1, { message: 'clusters must include at least one entry' }),
  positioning_map_text: PositioningMapTextSchema,
  opportunities: z
    .array(OpportunitySchema)
    .min(1, { message: 'opportunities must include at least one entry' }),
  recommended_differentiation_angles: z
    .array(RecommendedDifferentiationAngleSchema)
    .min(1, {
      message:
        'recommended_differentiation_angles must include at least one entry',
    }),
})

export type MarketSummary = z.infer<typeof MarketSummarySchema>
export type Theme = z.infer<typeof ThemeSchema>
export type Cluster = z.infer<typeof ClusterSchema>
export type PositioningQuadrant = z.infer<typeof PositioningQuadrantSchema>
export type PositioningMapText = z.infer<typeof PositioningMapTextSchema>
export type Opportunity = z.infer<typeof OpportunitySchema>
export type RecommendedDifferentiationAngle = z.infer<
  typeof RecommendedDifferentiationAngleSchema
>
export type MarketSynthesis = z.infer<typeof MarketSynthesisSchema>


