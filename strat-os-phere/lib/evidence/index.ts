/**
 * Evidence module public API
 * 
 * This is the canonical import surface for evidence functionality.
 * Import from '@/lib/evidence' instead of deep paths to prevent API drift.
 */

// Coverage functions
export {
  getEvidenceCoverage,
  computeEvidenceCoverage,
  type EvidenceCoverageModel,
  type CompetitorCoverage,
} from './coverage'

// Claims processing
export {
  getProcessedClaims,
  type ProcessedClaimsResult,
} from './claims/getProcessedClaims'

// Claim types
export type {
  EvidenceClaim,
  ClaimsByType,
  EvidenceCoverage,
} from './claims/types'

// Core types
export type {
  NormalizedEvidenceType,
  NormalizedEvidenceItem,
  NormalizedEvidenceBundle,
  EvidenceType,
  EvidenceSource,
  EvidenceBundle,
} from './types'

