/**
 * Deterministic Scoring - Explainable opportunity scoring
 * 
 * Defines fixed set of scoring drivers with deterministic computation.
 * All scores must be deterministic: same inputs → same scores.
 * No randomness, no model temperature dependence.
 */

import type { Citation, ScoreDriver, Scores } from './opportunityV1'

/**
 * Scoring driver definition
 */
export type ScoringDriverDef = {
  key: string
  label: string
  weight: number // 0-1, contribution to total score
}

/**
 * Fixed set of scoring drivers (deterministic order, stable keys)
 */
export const SCORING_DRIVERS: ScoringDriverDef[] = [
  {
    key: 'pain_intensity',
    label: 'Pain Intensity',
    weight: 0.25,
  },
  {
    key: 'willingness_to_pay_signal',
    label: 'Willingness to Pay Signal',
    weight: 0.20,
  },
  {
    key: 'competitive_gap_signal',
    label: 'Competitive Gap Signal',
    weight: 0.25,
  },
  {
    key: 'time_to_value',
    label: 'Time to Value',
    weight: 0.15,
  },
  {
    key: 'strategic_leverage',
    label: 'Strategic Leverage',
    weight: 0.15,
  },
]

/**
 * Context for scoring an opportunity
 * This provides the evidence and opportunity details needed for deterministic scoring
 */
export type ScoringContext = {
  citations: Citation[]
  opportunityTitle: string
  jtbd: {
    job: string
    context: string
    constraints?: string
  }
  whyCompetitorsMissIt: string
  recommendation: {
    whatToDo: string
    whyNow: string
    expectedImpact: string
  }
  // Additional context that may be needed for scoring
  evidenceItems?: Array<{
    id: string
    type: string
    url: string
    excerpt: string
  }>
}

/**
 * Compute score for a single driver
 * 
 * This is a deterministic function that takes context and returns:
 * - value: 0-1 score for this driver
 * - rationale: short explanation
 * - citationsUsed: array of evidenceIds used in scoring
 * 
 * NOTE: This is a placeholder implementation. Actual scoring logic should be
 * implemented based on evidence content analysis. The function must remain
 * deterministic (no randomness, no external API calls that could vary).
 * 
 * @param driverKey - The driver key to score
 * @param context - Scoring context with evidence and opportunity details
 * @returns Score driver result
 */
export function computeDriverScore(
  driverKey: string,
  context: ScoringContext
): ScoreDriver {
  // Get driver definition
  const driver = SCORING_DRIVERS.find((d) => d.key === driverKey)
  if (!driver) {
    throw new Error(`Unknown driver key: ${driverKey}`)
  }

  // Placeholder implementation - should be replaced with actual scoring logic
  // For now, return a deterministic score based on citation count and evidence types
  const citationCount = context.citations.length
  const evidenceTypes = new Set(context.citations.map((c) => c.sourceType))
  const typeCount = evidenceTypes.size

  // Deterministic heuristic: more citations and types → higher score
  // This is a simplified placeholder - actual implementation should analyze
  // evidence content, extract signals, etc.
  let value = 0.5 // Base score

  // Adjust based on citation count (0-0.3 contribution)
  const citationBonus = Math.min(citationCount / 10, 0.3)
  value += citationBonus

  // Adjust based on evidence type diversity (0-0.2 contribution)
  const typeBonus = Math.min(typeCount / 5, 0.2)
  value += typeBonus

  // Clamp to [0, 1]
  value = Math.max(0, Math.min(1, value))

  // Generate rationale based on driver key and computed value
  const rationale = generateDriverRationale(driverKey, value, citationCount, typeCount)

  // Use all citation evidenceIds (in practice, might filter to relevant ones)
  const citationsUsed = context.citations.map((c) => c.evidenceId)

  return {
    key: driver.key,
    label: driver.label,
    weight: driver.weight,
    value,
    rationale,
    citationsUsed,
  }
}

/**
 * Generate a deterministic rationale for a driver score
 */
function generateDriverRationale(
  driverKey: string,
  value: number,
  citationCount: number,
  typeCount: number
): string {
  const valueLabel = value >= 0.7 ? 'strong' : value >= 0.4 ? 'moderate' : 'limited'
  
  switch (driverKey) {
    case 'pain_intensity':
      return `Pain intensity is ${valueLabel} based on ${citationCount} evidence sources across ${typeCount} types indicating customer struggles.`
    case 'willingness_to_pay_signal':
      return `Willingness to pay signals are ${valueLabel} with ${citationCount} sources suggesting pricing sensitivity or purchase intent.`
    case 'competitive_gap_signal':
      return `Competitive gap is ${valueLabel} with evidence from ${typeCount} source types showing differentiation opportunities.`
    case 'time_to_value':
      return `Time to value is ${valueLabel} based on ${citationCount} sources indicating implementation complexity or user onboarding signals.`
    case 'strategic_leverage':
      return `Strategic leverage is ${valueLabel} with ${citationCount} sources across ${typeCount} types suggesting market positioning impact.`
    default:
      return `Score: ${value.toFixed(2)} based on ${citationCount} citations across ${typeCount} evidence types.`
  }
}

/**
 * Compute all driver scores for an opportunity
 * 
 * @param context - Scoring context
 * @returns Array of score drivers
 */
export function computeAllDriverScores(context: ScoringContext): ScoreDriver[] {
  return SCORING_DRIVERS.map((driver) => computeDriverScore(driver.key, context))
}

/**
 * Compute total score from driver scores
 * 
 * Formula: total = round(sum(weight * value) * 100)
 * 
 * @param drivers - Array of score drivers
 * @returns Total score (0-100)
 */
export function computeTotalScore(drivers: ScoreDriver[]): number {
  const weightedSum = drivers.reduce(
    (sum, driver) => sum + driver.weight * driver.value,
    0
  )
  return Math.round(weightedSum * 100)
}

/**
 * Generate "why this ranks" bullets from top drivers
 * 
 * Selects top 3 drivers by weighted contribution and formats as bullets.
 * 
 * @param drivers - Array of score drivers
 * @returns Array of bullet strings (max 3)
 */
export function generateWhyThisRanks(drivers: ScoreDriver[]): string[] {
  // Sort by weighted contribution (weight * value)
  const sorted = [...drivers].sort(
    (a, b) => b.weight * b.value - a.weight * a.value
  )

  // Take top 3
  const top3 = sorted.slice(0, 3)

  // Format as bullets
  return top3.map((driver) => {
    const contribution = (driver.weight * driver.value * 100).toFixed(0)
    return `${driver.label}: ${driver.rationale} (${contribution}% contribution)`
  })
}

/**
 * Compute complete scores for an opportunity
 * 
 * @param context - Scoring context
 * @returns Complete scores object with total, drivers, and whyThisRanks
 */
export function computeOpportunityScores(context: ScoringContext): {
  scores: Scores
  whyThisRanks: string[]
} {
  const drivers = computeAllDriverScores(context)
  const total = computeTotalScore(drivers)
  const whyThisRanks = generateWhyThisRanks(drivers)

  return {
    scores: {
      total,
      drivers,
    },
    whyThisRanks,
  }
}

