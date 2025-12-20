import 'server-only'

import type { Artifact } from '@/lib/supabase/types'
import type { ArtifactType } from '@/lib/schemas/artifacts'
import type {
  JtbdArtifactContent,
} from '@/lib/schemas/jtbd'
import type {
  OpportunitiesArtifactContent,
} from '@/lib/schemas/opportunities'
import type {
  ScoringMatrixArtifactContent,
} from '@/lib/schemas/scoring'

// Canonical artifact type constants
const CANONICAL_JTBD_TYPE: ArtifactType = 'jtbd'
const CANONICAL_OPPORTUNITIES_TYPE: ArtifactType = 'opportunities_v2'
const CANONICAL_SCORING_TYPE: ArtifactType = 'scoring_matrix'

// Legacy type aliases for backward compatibility
// Maps legacy string literals that might exist in older DB rows to canonical types
const legacyTypeAliases: Record<string, ArtifactType> = {
  jtbd: CANONICAL_JTBD_TYPE,
  opportunities_v2: CANONICAL_OPPORTUNITIES_TYPE,
  scoring_matrix: CANONICAL_SCORING_TYPE,
}

/**
 * Normalize artifact type from DB row (which may be a wider string type)
 * to canonical ArtifactType, handling legacy aliases if needed.
 */
function normalizeArtifactType(type: string): ArtifactType | null {
  // First check if it's a canonical type
  if (type === CANONICAL_JTBD_TYPE || type === CANONICAL_OPPORTUNITIES_TYPE || type === CANONICAL_SCORING_TYPE) {
    return type as ArtifactType
  }
  // Check legacy aliases (for backward compatibility)
  if (type in legacyTypeAliases) {
    return legacyTypeAliases[type]
  }
  return null
}

/**
 * Pick the most recent artifact that matches any of the given canonical types.
 * Prefers artifacts with schema_version === 2, then falls back to newest created_at.
 */
function pickLatestArtifactByTypes(
  artifacts: Artifact[],
  types: ArtifactType[]
): Artifact | undefined {
  const matching = artifacts
    .filter((a) => {
      const normalized = normalizeArtifactType(a.type as string)
      return normalized !== null && types.includes(normalized)
    })
    .sort((a, b) => {
      // Prefer v2 artifacts (schema_version === 2) if present
      const aVersion = (a.content_json as any)?.schema_version
      const bVersion = (b.content_json as any)?.schema_version
      if (aVersion === 2 && bVersion !== 2) return -1
      if (bVersion === 2 && aVersion !== 2) return 1
      // Otherwise sort by created_at (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  
  return matching[0]
}

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
 * Uses canonical artifact types and prefers v2 artifacts when present.
 * Maintains backward compatibility with legacy artifact types.
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

  // Get most recent artifact of each type using canonical types
  const jtbdArtifact = pickLatestArtifactByTypes(artifacts, [CANONICAL_JTBD_TYPE])
  if (jtbdArtifact?.content_json) {
    result.jtbd = jtbdArtifact.content_json as JtbdArtifactContent
  }

  const opportunitiesArtifact = pickLatestArtifactByTypes(artifacts, [CANONICAL_OPPORTUNITIES_TYPE])
  if (opportunitiesArtifact?.content_json) {
    result.opportunities = opportunitiesArtifact.content_json as OpportunitiesArtifactContent
  }

  const scoringArtifact = pickLatestArtifactByTypes(artifacts, [CANONICAL_SCORING_TYPE])
  if (scoringArtifact?.content_json) {
    result.scoringMatrix = scoringArtifact.content_json as ScoringMatrixArtifactContent
  }

  return result
}

