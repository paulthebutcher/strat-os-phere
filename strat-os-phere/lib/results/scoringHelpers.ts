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
 * Compute weighted competitor scores
 * Normalizes weights, converts 1-5 scores to 0-100 per criterion, then weighted sum
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
  const competitorScores = new Map<string, Map<string, number>>()
  scores.forEach((score) => {
    if (!competitorScores.has(score.competitor_name)) {
      competitorScores.set(score.competitor_name, new Map())
    }
    const compScores = competitorScores.get(score.competitor_name)!
    compScores.set(score.criteria_id, score.score)
  })

  // Compute weighted totals
  const weightedTotals = new Map<string, number>()
  competitorScores.forEach((compScores, competitorName) => {
    let total = 0
    criteria.forEach((criterion) => {
      const score = compScores.get(criterion.id)
      if (score !== undefined) {
        // Convert 1-5 to 0-100
        const normalizedScore = ((score - 1) / 4) * 100
        const weight = normalizedWeights.get(criterion.id) || 0
        total += normalizedScore * weight
      }
    })
    weightedTotals.set(competitorName, Math.round(total * 100) / 100) // Round to 2 decimals
  })

  return weightedTotals
}

