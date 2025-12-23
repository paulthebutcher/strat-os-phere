/**
 * Claim-centric evidence types
 * Defines the structure for normalized, deduped, and ranked claims
 */

import type { NormalizedEvidenceType } from '../types'

/**
 * Evidence claim structure
 * Represents a single claim backed by evidence
 */
export type EvidenceClaim = {
  id: string
  claimText: string
  evidenceType: NormalizedEvidenceType
  url: string
  canonicalUrl: string
  domain: string
  title?: string
  excerpt?: string
  publishedAt?: string | null
  retrievedAt?: string | null
  confidence?: 'low' | 'med' | 'high'
  fingerprint: string
  score?: number // Ranking score (computed by rankClaims)
}

/**
 * Claims grouped by evidence type
 */
export type ClaimsByType = Record<NormalizedEvidenceType, EvidenceClaim[]>

/**
 * Coverage metrics and gaps
 */
export type EvidenceCoverage = {
  typesPresent: NormalizedEvidenceType[]
  countsByType: Record<NormalizedEvidenceType, number>
  firstPartyRatio: number // 0..1
  recencyScore: number // 0..1
  coverageScore: number // 0..1
  overallConfidenceLabel: 'High' | 'Medium' | 'Low' | 'Insufficient'
  gaps: Array<{
    type: NormalizedEvidenceType
    reason: string
    suggestion: string
  }>
}

