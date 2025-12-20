import 'server-only'

import type { JtbdArtifactContent } from '@/lib/schemas/jtbd'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import type { ScoringMatrixArtifactContent } from '@/lib/schemas/scoring'

export interface ResultsV2QualitySignals {
  jtbdCount: number
  avgJtbdOpportunityScore: number
  opportunitiesCount: number
  avgOpportunityScore: number
  criteriaCount: number
  competitorsCount: number
  hasFirstExperimentsRate: number // Percentage (0-100) of opportunities with >=2 experiments
}

/**
 * Compute quality signals for Results v2 generation
 * These signals help track output quality and debug generation issues
 */
export function computeResultsV2Signals({
  jtbd,
  opportunities,
  scoringMatrix,
}: {
  jtbd: JtbdArtifactContent | null
  opportunities: OpportunitiesArtifactContent | null
  scoringMatrix: ScoringMatrixArtifactContent | null
}): ResultsV2QualitySignals {
  const jtbdCount = jtbd?.jobs?.length ?? 0
  const avgJtbdOpportunityScore =
    jtbd?.jobs && jtbd.jobs.length > 0
      ? jtbd.jobs.reduce((sum, job) => sum + job.opportunity_score, 0) /
        jtbd.jobs.length
      : 0

  const opportunitiesCount = opportunities?.opportunities?.length ?? 0
  const avgOpportunityScore =
    opportunities?.opportunities && opportunities.opportunities.length > 0
      ? opportunities.opportunities.reduce((sum, opp) => sum + opp.score, 0) /
        opportunities.opportunities.length
      : 0

  const criteriaCount = scoringMatrix?.criteria?.length ?? 0

  // Get unique competitor names from scoring summary
  const competitorNames = new Set<string>()
  scoringMatrix?.summary?.forEach((s) => {
    if (s.competitor_name) competitorNames.add(s.competitor_name)
  })
  const competitorsCount = competitorNames.size

  // Calculate percentage of opportunities with >=2 first experiments
  let hasFirstExperimentsCount = 0
  if (opportunities?.opportunities) {
    hasFirstExperimentsCount = opportunities.opportunities.filter(
      (opp) => opp.first_experiments && opp.first_experiments.length >= 2
    ).length
  }
  const hasFirstExperimentsRate =
    opportunitiesCount > 0
      ? Math.round((hasFirstExperimentsCount / opportunitiesCount) * 100)
      : 0

  return {
    jtbdCount,
    avgJtbdOpportunityScore: Math.round(avgJtbdOpportunityScore * 100) / 100,
    opportunitiesCount,
    avgOpportunityScore: Math.round(avgOpportunityScore * 100) / 100,
    criteriaCount,
    competitorsCount,
    hasFirstExperimentsRate,
  }
}

