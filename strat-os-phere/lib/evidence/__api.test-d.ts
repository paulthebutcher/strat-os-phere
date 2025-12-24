/**
 * Evidence Module API Surface Guardrail
 * 
 * This file ensures that all canonical exports are properly defined.
 * If any export is missing or renamed, TypeScript compilation will fail here.
 * 
 * This file is included in the build to catch export drift early.
 */

// Import all canonical exports from the barrel
import type {
  EvidenceCoverageModel,
  CompetitorCoverage,
  ProcessedClaimsResult,
  EvidenceClaim,
  ClaimsByType,
  EvidenceCoverage,
  NormalizedEvidenceType,
  NormalizedEvidenceItem,
  NormalizedEvidenceBundle,
  EvidenceType,
  EvidenceBundleItem,
  EvidenceBundle,
} from '@/lib/evidence'

import {
  getEvidenceCoverage,
  computeEvidenceCoverage,
  getProcessedClaims,
} from '@/lib/evidence'

// Reference all exports to ensure they exist
// This prevents unused import warnings while validating exports exist
void getEvidenceCoverage
void computeEvidenceCoverage
void getProcessedClaims

// Type-only validation (compile-time only, no runtime cost)
type _ValidateExports =
  | EvidenceCoverageModel
  | CompetitorCoverage
  | ProcessedClaimsResult
  | EvidenceClaim
  | ClaimsByType
  | EvidenceCoverage
  | NormalizedEvidenceType
  | NormalizedEvidenceItem
  | NormalizedEvidenceBundle
  | EvidenceType
  | EvidenceBundleItem
  | EvidenceBundle

