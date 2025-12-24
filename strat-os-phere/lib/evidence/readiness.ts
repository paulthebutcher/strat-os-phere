/**
 * PR4: Evidence readiness evaluation
 * Determines if a project has sufficient evidence to generate analysis
 */

import type { EvidenceCoverageModel } from '@/lib/evidence'

/**
 * Readiness thresholds configuration
 * Can be overridden via env or project settings later
 */
export const EVIDENCE_READINESS_THRESHOLDS = {
  MIN_COMPETITORS_WITH_EVIDENCE: 3,
  MIN_EVIDENCE_TYPES_COVERED: 3,
} as const

export interface ReadinessEvaluation {
  isReady: boolean
  reasons: string[]
  missing: {
    competitorsNeeded: number
    typesNeeded: number
    competitorsWithEvidence: number
    typesCovered: number
  }
}

/**
 * Evaluate evidence readiness based on coverage metrics
 */
export function evaluateReadiness(
  coverage: EvidenceCoverageModel
): ReadinessEvaluation {
  const { MIN_COMPETITORS_WITH_EVIDENCE, MIN_EVIDENCE_TYPES_COVERED } =
    EVIDENCE_READINESS_THRESHOLDS

  const reasons: string[] = []
  const missing = {
    competitorsNeeded: 0,
    typesNeeded: 0,
    competitorsWithEvidence: coverage.competitorsWithAnyEvidence,
    typesCovered: coverage.typesCoveredCount,
  }

  // Check competitor coverage
  if (coverage.competitorsWithAnyEvidence < MIN_COMPETITORS_WITH_EVIDENCE) {
    const needed = MIN_COMPETITORS_WITH_EVIDENCE - coverage.competitorsWithAnyEvidence
    missing.competitorsNeeded = needed
    reasons.push(
      `Need evidence for ${needed} more competitor${needed === 1 ? '' : 's'} (currently have ${coverage.competitorsWithAnyEvidence}, need ${MIN_COMPETITORS_WITH_EVIDENCE})`
    )
  }

  // Check type coverage
  if (coverage.typesCoveredCount < MIN_EVIDENCE_TYPES_COVERED) {
    const needed = MIN_EVIDENCE_TYPES_COVERED - coverage.typesCoveredCount
    missing.typesNeeded = needed
    reasons.push(
      `Need ${needed} more evidence type${needed === 1 ? '' : 's'} covered (currently have ${coverage.typesCoveredCount}, need ${MIN_EVIDENCE_TYPES_COVERED})`
    )
  }

  const isReady = reasons.length === 0

  return {
    isReady,
    reasons,
    missing,
  }
}

