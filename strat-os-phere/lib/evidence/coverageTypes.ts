/**
 * Evidence coverage types and constants
 * 
 * Central contract for EvidenceCoverageLite type to prevent never[] inference issues.
 * All coverage-related code should import from this file.
 */

import type { EvidenceSourceType } from './evidenceTypes'

/**
 * Evidence coverage summary for project status UI
 * 
 * This type represents lightweight coverage metrics computed from evidence_sources table.
 * It is designed to be schema-free and fail-safe.
 */
export type EvidenceCoverageLite = {
  totalSources: number
  evidenceTypesPresent: EvidenceSourceType[] // Explicit union type, not string[]
  evidenceTypeCounts: Record<string, number>
  competitorIdsWithEvidence: string[] // unique competitor_id with >=1 source (non-null)
  competitorEvidenceCounts: Record<string, number> // competitor_id -> count
  isEvidenceSufficient: boolean
  reasonsMissing: string[] // human readable reasons for insufficient
}

/**
 * Explicitly typed empty coverage default
 * 
 * This constant prevents TypeScript from inferring evidenceTypesPresent as never[].
 * Always use this instead of inline object literals with empty arrays.
 */
export const EMPTY_EVIDENCE_COVERAGE_LITE: EvidenceCoverageLite = {
  totalSources: 0,
  evidenceTypesPresent: [], // Typed as EvidenceSourceType[], not never[]
  evidenceTypeCounts: {},
  competitorIdsWithEvidence: [],
  competitorEvidenceCounts: {},
  isEvidenceSufficient: false,
  reasonsMissing: ['Evidence data unavailable. Try reloading or collect evidence again.'],
}

