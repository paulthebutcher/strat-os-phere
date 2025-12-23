import { z } from 'zod'

/**
 * Types for the New Analysis wizard (2-step onboarding flow)
 */

export type SourceType =
  | 'website'
  | 'pricing'
  | 'docs'
  | 'changelog'
  | 'careers'
  | 'other'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

/**
 * Decision framing types
 */
export type DecisionHorizon = 'now' | 'next' | 'long_term'
export type DecisionAudience = 'founder' | 'product_leader' | 'exec' | 'investor' | 'other'

export interface DecisionFraming {
  decision: string // required
  audience?: DecisionAudience
  audienceOtherText?: string // if audience === 'other'
  yourProduct?: string // optional 1 sentence
  horizon?: DecisionHorizon
}

/**
 * Zod schema for DecisionFraming validation
 */
export const DecisionFramingSchema = z.object({
  decision: z.string().min(1, 'Decision is required'),
  audience: z.enum(['founder', 'product_leader', 'exec', 'investor', 'other']).optional(),
  audienceOtherText: z.string().optional(),
  yourProduct: z.string().optional(),
  horizon: z.enum(['now', 'next', 'long_term']).optional(),
}).refine(
  (data) => {
    // If audience is 'other', audienceOtherText should be provided
    if (data.audience === 'other' && !data.audienceOtherText?.trim()) {
      return false
    }
    return true
  },
  {
    message: 'Please specify the audience when selecting "Other"',
    path: ['audienceOtherText'],
  }
)

export interface ResolvedSource {
  label: string
  url: string
  type: SourceType
  confidence: ConfidenceLevel
  enabled: boolean
}

export interface SuggestedCompetitor {
  name: string
  url?: string
  domain?: string
  confidence: ConfidenceLevel
  rationale?: string
}

export interface SelectedCompetitor {
  name: string
  url: string
}

export type PricingModel = 
  | 'Free'
  | 'Freemium'
  | 'Per-seat'
  | 'Usage-based'
  | 'Contract/enterprise'
  | 'Other'

export interface WizardState {
  primaryCompanyName: string
  contextText?: string
  marketCategory?: string
  resolvedSources: ResolvedSource[]
  suggestedCompetitors: SuggestedCompetitor[]
  selectedCompetitors: SelectedCompetitor[]
  evidenceWindowDays: number
  decisionFraming?: DecisionFraming
  errors?: { message: string; id?: string }
  // Step 3 fields
  projectName?: string
  product?: string
  targetCustomer?: string
  geography?: string
  pricingModel?: PricingModel
  constraints?: string
}

export interface DiscoveryResponse {
  resolvedSources: ResolvedSource[]
  suggestedCompetitors: SuggestedCompetitor[]
  debug?: {
    officialDomain?: string
  }
}

