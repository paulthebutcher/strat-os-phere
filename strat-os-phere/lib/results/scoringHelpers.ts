import type { JtbdItem } from '@/lib/schemas/jtbd'
import type {
  OpportunityItem,
  OpportunityImpact,
  OpportunityEffort,
  OpportunityConfidence,
} from '@/lib/schemas/opportunities'
import type {
  ScoringCriterion,
  CriterionScore,
} from '@/lib/schemas/scoring'

/**
 * Compute JTBD opportunity score deterministically
 * Formula: (importance_score * 20) + ((5 - satisfaction_score) * 20)
 * Then clamp to 0-100 by: min(100, round(opportunity/2))
 */
export function computeJtbdOpportunityScore(
  importanceScore: number,
  satisfactionScore: number
): number {
  const opportunity = Math.round(
    importanceScore * 20 + (5 - satisfactionScore) * 20
  )
  // Clamp to 0-100
  return Math.min(100, Math.max(0, Math.round(opportunity / 2)))
}

/**
 * Compute opportunity score deterministically
 * Start at 0, then:
 * - Impact: low=20, med=50, high=80
 * - Effort: S=+15, M=+0, L=-15
 * - Confidence: low=-10, med=0, high=+10
 * - Add JTBD opportunity_score scaled to 0-20: round(jtbd.opportunity_score * 0.2)
 * - Clamp 0-100
 */
export function computeOpportunityScore(
  impact: OpportunityImpact,
  effort: OpportunityEffort,
  confidence: OpportunityConfidence,
  linkedJtbdOpportunityScore?: number
): number {
  let score = 0

  // Impact base
  switch (impact) {
    case 'low':
      score += 20
      break
    case 'med':
      score += 50
      break
    case 'high':
      score += 80
      break
  }

  // Effort adjustment
  switch (effort) {
    case 'S':
      score += 15
      break
    case 'M':
      score += 0
      break
    case 'L':
      score -= 15
      break
  }

  // Confidence adjustment
  switch (confidence) {
    case 'low':
      score -= 10
      break
    case 'med':
      score += 0
      break
    case 'high':
      score += 10
      break
  }

  // Add JTBD opportunity score contribution (scaled to 0-20)
  if (linkedJtbdOpportunityScore !== undefined) {
    score += Math.round(linkedJtbdOpportunityScore * 0.2)
  }

  // Clamp to 0-100
  return Math.min(100, Math.max(0, score))
}

/**
 * Aggregate dimension scores into a single score for a criterion
 * Uses equal-weighted average of all dimensions, with friction inverted (lower friction = higher score)
 * Returns a score in 0-1 range
 */
export function aggregateDimensionScores(
  dimensions: CriterionScore['dimensions']
): number {
  // Equal-weighted average of all dimensions
  // Friction is inverted: higher friction = lower score
  const aggregated =
    (dimensions.discovery_support +
      dimensions.execution_support +
      dimensions.reliability +
      dimensions.flexibility +
      (1 - dimensions.friction)) / 5

  // Clamp to 0-1 range (shouldn't happen, but safety check)
  return Math.max(0, Math.min(1, aggregated))
}

/**
 * Compute weighted competitor scores
 * Uses graded dimension scores (0.0-1.0), aggregates them per criterion, then applies weighted sum
 * Returns scores in 0-100 range (not rounded, preserves decimals until presentation)
 */
export function computeWeightedCompetitorScores(
  criteria: ScoringCriterion[],
  scores: CriterionScore[]
): Map<string, number> {
  // Normalize weights
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
  const normalizedWeights = new Map<string, number>()
  criteria.forEach((c) => {
    normalizedWeights.set(c.id, c.weight / totalWeight)
  })

  // Group scores by competitor
  const competitorScores = new Map<string, Map<string, CriterionScore['dimensions']>>()
  scores.forEach((score) => {
    if (!competitorScores.has(score.competitor_name)) {
      competitorScores.set(score.competitor_name, new Map())
    }
    const compScores = competitorScores.get(score.competitor_name)!
    compScores.set(score.criteria_id, score.dimensions)
  })

  // Compute weighted totals
  const weightedTotals = new Map<string, number>()
  competitorScores.forEach((compScores, competitorName) => {
    let total = 0
    criteria.forEach((criterion) => {
      const dimensions = compScores.get(criterion.id)
      if (dimensions !== undefined) {
        // Aggregate dimension scores to get criterion score (0-1 range)
        const criterionScore = aggregateDimensionScores(dimensions)
        // Convert to 0-100 range
        const normalizedScore = criterionScore * 100
        const weight = normalizedWeights.get(criterion.id) || 0
        total += normalizedScore * weight
      }
    })
    // Preserve decimals, only round at presentation time
    weightedTotals.set(competitorName, total)
  })

  return weightedTotals
}

