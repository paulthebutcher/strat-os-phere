/**
 * Coverage thresholds for evidence scoring
 * Defines minimum requirements for evidence to be considered sufficient
 */

export type CoverageThreshold = {
  minTotalSources: number
  minEvidenceTypes: number
  minFirstPartyRatio: number
  maxMedianAgeDays: number
}

export const DEFAULT_THRESHOLD: CoverageThreshold = {
  minTotalSources: 6,
  minEvidenceTypes: 3,
  minFirstPartyRatio: 0.25,
  maxMedianAgeDays: 90,
}

