/**
 * Evidence Gating - Fail-closed validation for opportunities
 * 
 * Ensures opportunities meet minimum evidence quality gates before being generated.
 * Implements strict validation rules:
 * - ≥ 3 citations total
 * - Citations span ≥ 2 distinct sourceType values
 * - Citations must have non-empty url and excerpt (min 20 chars)
 */

import type { Citation } from './opportunityV1'

/**
 * Result of evidence validation
 */
export type EvidenceValidationResult = {
  ok: boolean
  reasons: string[]
}

/**
 * Minimum evidence requirements for an opportunity
 */
const MIN_CITATIONS = 3
const MIN_EVIDENCE_TYPES = 2
const MIN_EXCERPT_LENGTH = 20

/**
 * Validate that citations meet minimum evidence requirements
 * 
 * Rules:
 * - ≥ 3 citations total
 * - Citations span ≥ 2 distinct sourceType values
 * - Citations must have non-empty url and excerpt (min 20 chars)
 * 
 * @param citations - Array of citations to validate
 * @returns Validation result with ok flag and reasons if failed
 */
export function hasMinimumEvidenceForOpportunity(
  citations: Citation[]
): EvidenceValidationResult {
  const reasons: string[] = []

  // Check minimum citation count
  if (citations.length < MIN_CITATIONS) {
    reasons.push(
      `Insufficient citations: ${citations.length} provided, ${MIN_CITATIONS} required`
    )
  }

  // Check distinct evidence types
  const distinctTypes = new Set(citations.map((c) => c.sourceType))
  if (distinctTypes.size < MIN_EVIDENCE_TYPES) {
    reasons.push(
      `Insufficient evidence type diversity: ${distinctTypes.size} type(s) present, ${MIN_EVIDENCE_TYPES} required`
    )
  }

  // Validate each citation has required fields
  for (let i = 0; i < citations.length; i++) {
    const citation = citations[i]
    
    if (!citation.url || citation.url.trim().length === 0) {
      reasons.push(`Citation ${i + 1}: missing or empty url`)
    }

    if (!citation.excerpt || citation.excerpt.trim().length < MIN_EXCERPT_LENGTH) {
      reasons.push(
        `Citation ${i + 1}: excerpt too short (${citation.excerpt?.length ?? 0} chars, ${MIN_EXCERPT_LENGTH} required)`
      )
    }
  }

  return {
    ok: reasons.length === 0,
    reasons,
  }
}

/**
 * Confidence levels based on evidence coverage
 */
export type ConfidenceLevel = 'exploratory' | 'directional' | 'investment_ready'

/**
 * Derive confidence level from citation evidence
 * 
 * Confidence tiers:
 * - exploratory: meets minimum only (≥3 citations, ≥2 types)
 * - directional: ≥6 citations across ≥3 types
 * - investment_ready: ≥10 citations across ≥4 types
 * 
 * @param citations - Array of citations
 * @returns Confidence level
 */
export function deriveConfidenceFromEvidence(
  citations: Citation[]
): ConfidenceLevel {
  const citationCount = citations.length
  const distinctTypes = new Set(citations.map((c) => c.sourceType))
  const typeCount = distinctTypes.size

  // Investment ready: ≥10 citations across ≥4 types
  if (citationCount >= 10 && typeCount >= 4) {
    return 'investment_ready'
  }

  // Directional: ≥6 citations across ≥3 types
  if (citationCount >= 6 && typeCount >= 3) {
    return 'directional'
  }

  // Exploratory: meets minimum (≥3 citations, ≥2 types)
  // Note: This assumes citations already passed hasMinimumEvidenceForOpportunity
  // If they haven't, this may return 'exploratory' even for insufficient evidence
  return 'exploratory'
}

