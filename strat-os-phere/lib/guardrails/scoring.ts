/**
 * Scoring guardrails to prevent false precision and detect anomalies
 */

export interface ScoreDistributionCheck {
  isFlat: boolean
  hasExtremeOutliers: boolean
  mean: number
  stdDev: number
  min: number
  max: number
  flags: string[]
}

/**
 * Check if score distribution is overly flat (low variance)
 * Flat distributions suggest insufficient differentiation or model confusion
 */
export function checkScoreDistribution(scores: number[]): ScoreDistributionCheck {
  if (scores.length === 0) {
    return {
      isFlat: true,
      hasExtremeOutliers: false,
      mean: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      flags: ['empty_scores'],
    }
  }

  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length
  const variance =
    scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length
  const stdDev = Math.sqrt(variance)
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const range = max - min

  const flags: string[] = []

  // Check for flat distribution (low variance relative to range)
  // If stdDev is less than 10% of the range, consider it flat
  const isFlat = range > 0 && stdDev < range * 0.1

  if (isFlat) {
    flags.push('flat_distribution')
  }

  // Check for extreme outliers (values more than 3 standard deviations from mean)
  // Only check if we have sufficient variance
  let hasExtremeOutliers = false
  if (stdDev > 0) {
    const outlierThreshold = 3 * stdDev
    for (const score of scores) {
      if (Math.abs(score - mean) > outlierThreshold) {
        hasExtremeOutliers = true
        flags.push('extreme_outliers')
        break
      }
    }
  }

  return {
    isFlat,
    hasExtremeOutliers,
    mean: Math.round(mean * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    min,
    max,
    flags,
  }
}

/**
 * Apply score ceiling based on confidence signals
 * Caps scores above 85 unless confidence signals exceed thresholds
 * 
 * @param score - Original score (0-100)
 * @param confidenceSignals - Object containing confidence metrics
 * @returns Adjusted score (0-100, capped if needed)
 */
export function applyScoreCeiling(
  score: number,
  confidenceSignals: {
    evidenceQuality?: 'low' | 'medium' | 'high'
    decayFactor?: number
    repairCount?: number
    bannedPatternPenalty?: number
  }
): number {
  // Default to no ceiling
  let ceiling = 100

  // Determine ceiling based on confidence signals
  const hasHighEvidenceQuality = confidenceSignals.evidenceQuality === 'high'
  const hasFreshEvidence = (confidenceSignals.decayFactor ?? 1.0) >= 0.8
  const hasLowRepairCount = (confidenceSignals.repairCount ?? 0) <= 1
  const hasLowBannedPatternPenalty = (confidenceSignals.bannedPatternPenalty ?? 0) <= 0.2

  // High confidence requires: high evidence quality AND (fresh evidence OR low repairs)
  const highConfidence =
    hasHighEvidenceQuality && (hasFreshEvidence || hasLowRepairCount) && hasLowBannedPatternPenalty

  // Medium confidence requires: at least medium evidence quality
  const mediumConfidence = confidenceSignals.evidenceQuality === 'medium' || confidenceSignals.evidenceQuality === 'high'

  if (highConfidence) {
    // High confidence - no ceiling
    ceiling = 100
  } else if (mediumConfidence) {
    // Medium confidence - ceiling at 90
    ceiling = 90
  } else {
    // Low confidence - ceiling at 85
    ceiling = 85
  }

  return Math.min(score, ceiling)
}

/**
 * Compute confidence band for a score based on signals
 */
export function computeConfidenceBand(score: number, confidenceSignals: {
  evidenceQuality?: 'low' | 'medium' | 'high'
  decayFactor?: number
  repairCount?: number
  bannedPatternPenalty?: number
}): 'low' | 'medium' | 'high' {
  const hasHighEvidenceQuality = confidenceSignals.evidenceQuality === 'high'
  const hasFreshEvidence = (confidenceSignals.decayFactor ?? 1.0) >= 0.8
  const hasLowRepairCount = (confidenceSignals.repairCount ?? 0) <= 1
  const hasLowBannedPatternPenalty = (confidenceSignals.bannedPatternPenalty ?? 0) <= 0.2

  // High confidence requires multiple positive signals
  if (
    hasHighEvidenceQuality &&
    hasFreshEvidence &&
    hasLowRepairCount &&
    hasLowBannedPatternPenalty &&
    score >= 70 // High scores with good signals = high confidence
  ) {
    return 'high'
  }

  // Medium confidence: decent evidence quality OR fresh evidence
  if (
    (confidenceSignals.evidenceQuality === 'medium' || confidenceSignals.evidenceQuality === 'high') &&
    (hasFreshEvidence || hasLowRepairCount) &&
    score >= 50
  ) {
    return 'medium'
  }

  // Low confidence: default for everything else
  return 'low'
}

