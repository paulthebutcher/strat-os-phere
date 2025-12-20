import 'server-only'

import type { Artifact } from '@/lib/supabase/types'
import type {
  JtbdArtifactContent,
} from '@/lib/schemas/jtbd'
import type {
  OpportunitiesArtifactContent,
} from '@/lib/schemas/opportunities'
import type {
  ScoringMatrixArtifactContent,
} from '@/lib/schemas/scoring'

export interface DriftDetectionResult {
  hasSignificantDrift: boolean
  jtbdDrift?: {
    scoreChange: number
    jobCountChange: number
  }
  opportunitiesDrift?: {
    scoreChange: number
    opportunityCountChange: number
  }
  scoringDrift?: {
    meanScoreChange: number
    competitorCountChange: number
  }
  flags: string[]
}

/**
 * Compare current run artifacts with previous run artifacts to detect drift
 * Flags large deviations in scores or opportunities
 */
export function detectDrift(
  currentArtifacts: {
    jtbd?: JtbdArtifactContent
    opportunities?: OpportunitiesArtifactContent
    scoringMatrix?: ScoringMatrixArtifactContent
  },
  previousArtifacts: {
    jtbd?: JtbdArtifactContent
    opportunities?: OpportunitiesArtifactContent
    scoringMatrix?: ScoringMatrixArtifactContent
  }
): DriftDetectionResult {
  const flags: string[] = []
  let hasSignificantDrift = false

  // JTBD drift detection
  const jtbdDrift = detectJtbdDrift(
    currentArtifacts.jtbd,
    previousArtifacts.jtbd
  )
  if (jtbdDrift) {
    if (Math.abs(jtbdDrift.scoreChange) > 10 || Math.abs(jtbdDrift.jobCountChange) > 2) {
      hasSignificantDrift = true
      flags.push('jtbd_drift')
    }
  }

  // Opportunities drift detection
  const opportunitiesDrift = detectOpportunitiesDrift(
    currentArtifacts.opportunities,
    previousArtifacts.opportunities
  )
  if (opportunitiesDrift) {
    if (
      Math.abs(opportunitiesDrift.scoreChange) > 15 ||
      Math.abs(opportunitiesDrift.opportunityCountChange) > 2
    ) {
      hasSignificantDrift = true
      flags.push('opportunities_drift')
    }
  }

  // Scoring drift detection
  const scoringDrift = detectScoringDrift(
    currentArtifacts.scoringMatrix,
    previousArtifacts.scoringMatrix
  )
  if (scoringDrift) {
    if (
      Math.abs(scoringDrift.meanScoreChange) > 10 ||
      Math.abs(scoringDrift.competitorCountChange) > 0
    ) {
      hasSignificantDrift = true
      flags.push('scoring_drift')
    }
  }

  return {
    hasSignificantDrift,
    jtbdDrift,
    opportunitiesDrift,
    scoringDrift,
    flags,
  }
}

function detectJtbdDrift(
  current?: JtbdArtifactContent,
  previous?: JtbdArtifactContent
): { scoreChange: number; jobCountChange: number } | undefined {
  if (!current || !previous) {
    return undefined
  }

  const currentAvgScore =
    current.jobs.length > 0
      ? current.jobs.reduce((sum, job) => sum + job.opportunity_score, 0) /
        current.jobs.length
      : 0
  const previousAvgScore =
    previous.jobs.length > 0
      ? previous.jobs.reduce((sum, job) => sum + job.opportunity_score, 0) /
        previous.jobs.length
      : 0

  return {
    scoreChange: Math.round((currentAvgScore - previousAvgScore) * 100) / 100,
    jobCountChange: current.jobs.length - previous.jobs.length,
  }
}

function detectOpportunitiesDrift(
  current?: OpportunitiesArtifactContent,
  previous?: OpportunitiesArtifactContent
): { scoreChange: number; opportunityCountChange: number } | undefined {
  if (!current || !previous) {
    return undefined
  }

  const currentAvgScore =
    current.opportunities.length > 0
      ? current.opportunities.reduce((sum, opp) => sum + opp.score, 0) /
        current.opportunities.length
      : 0
  const previousAvgScore =
    previous.opportunities.length > 0
      ? previous.opportunities.reduce((sum, opp) => sum + opp.score, 0) /
        previous.opportunities.length
      : 0

  return {
    scoreChange: Math.round((currentAvgScore - previousAvgScore) * 100) / 100,
    opportunityCountChange: current.opportunities.length - previous.opportunities.length,
  }
}

function detectScoringDrift(
  current?: ScoringMatrixArtifactContent,
  previous?: ScoringMatrixArtifactContent
): { meanScoreChange: number; competitorCountChange: number } | undefined {
  if (!current || !previous) {
    return undefined
  }

  const currentMeanScore =
    current.summary.length > 0
      ? current.summary.reduce(
          (sum, s) => sum + s.total_weighted_score,
          0
        ) / current.summary.length
      : 0
  const previousMeanScore =
    previous.summary.length > 0
      ? previous.summary.reduce(
          (sum, s) => sum + s.total_weighted_score,
          0
        ) / previous.summary.length
      : 0

  return {
    meanScoreChange: Math.round((currentMeanScore - previousMeanScore) * 100) / 100,
    competitorCountChange: current.summary.length - previous.summary.length,
  }
}

/**
 * Extract artifact content from database artifacts for drift detection
 */
export function extractArtifactContent(
  artifacts: Artifact[]
): {
  jtbd?: JtbdArtifactContent
  opportunities?: OpportunitiesArtifactContent
  scoringMatrix?: ScoringMatrixArtifactContent
} {
  const result: {
    jtbd?: JtbdArtifactContent
    opportunities?: OpportunitiesArtifactContent
    scoringMatrix?: ScoringMatrixArtifactContent
  } = {}

  // Get most recent artifact of each type
  const jtbdArtifact = artifacts
    .filter((a) => a.type === 'jtbd')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  if (jtbdArtifact?.content_json) {
    result.jtbd = jtbdArtifact.content_json as JtbdArtifactContent
  }

  const opportunitiesArtifact = artifacts
    .filter((a) => a.type === 'opportunities_v2')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  if (opportunitiesArtifact?.content_json) {
    result.opportunities = opportunitiesArtifact.content_json as OpportunitiesArtifactContent
  }

  const scoringArtifact = artifacts
    .filter((a) => a.type === 'scoring_matrix')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  if (scoringArtifact?.content_json) {
    result.scoringMatrix = scoringArtifact.content_json as ScoringMatrixArtifactContent
  }

  return result
}

