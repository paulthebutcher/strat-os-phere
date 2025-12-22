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

export interface WizardState {
  primaryCompanyName: string
  contextText?: string
  resolvedSources: ResolvedSource[]
  suggestedCompetitors: SuggestedCompetitor[]
  selectedCompetitors: SelectedCompetitor[]
  evidenceWindowDays: number
  errors?: { message: string; id?: string }
}

export interface DiscoveryResponse {
  resolvedSources: ResolvedSource[]
  suggestedCompetitors: SuggestedCompetitor[]
  debug?: {
    officialDomain?: string
  }
}

