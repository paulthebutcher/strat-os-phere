import { z } from 'zod'

/**
 * Schema for competitor recommendation
 */
export const CompetitorRecommendationSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().optional(),
  reason: z.string().min(1),
  confidence: z.enum(['high', 'medium', 'low']).optional(),
})

/**
 * Schema for framing information extracted from URL/context
 */
export const FramingSchema = z.object({
  projectName: z.string().optional(),
  market: z.string().optional(),
  targetCustomer: z.string().optional(),
  geography: z.string().optional(),
  businessGoal: z.string().optional(),
})

/**
 * Schema for the complete recommendation response
 */
export const CompetitorRecommendationsResponseSchema = z.object({
  framing: FramingSchema.optional(),
  recommendations: z.array(CompetitorRecommendationSchema),
})

/**
 * Schema for the recommendation request
 * Note: primaryUrl validation is done via normalizeUrl() in the route handler
 * to allow forgiving input (bare domains, missing protocols, etc.)
 */
export const CompetitorRecommendationsRequestSchema = z.object({
  primaryUrl: z.string().min(1).optional(),
  contextText: z.string().optional(),
})

export type CompetitorRecommendation = z.infer<typeof CompetitorRecommendationSchema>
export type Framing = z.infer<typeof FramingSchema>
export type CompetitorRecommendationsResponse = z.infer<typeof CompetitorRecommendationsResponseSchema>
export type CompetitorRecommendationsRequest = z.infer<typeof CompetitorRecommendationsRequestSchema>

