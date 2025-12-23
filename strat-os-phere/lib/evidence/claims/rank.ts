/**
 * Evidence claim ranking
 * Deterministic scoring based on recency, first-party status, type, and confidence
 */

import type { EvidenceClaim } from './types'
import type { NormalizedEvidenceType } from '../types'

/**
 * Evidence type weights (higher = more valuable)
 */
const TYPE_WEIGHTS: Record<NormalizedEvidenceType, number> = {
  pricing: 1.0,
  docs: 1.0,
  changelog: 1.0,
  reviews: 0.8,
  jobs: 0.8,
  security: 0.9,
  community: 0.6,
  blog: 0.5,
  other: 0.3,
}

/**
 * Confidence weights
 */
const CONFIDENCE_WEIGHTS: Record<'low' | 'med' | 'high', number> = {
  low: 0.5,
  med: 0.75,
  high: 1.0,
}

/**
 * Compute recency bonus
 * Returns 0..1 based on how recent the evidence is
 */
function computeRecencyBonus(
  publishedAt: string | null | undefined,
  retrievedAt: string | null | undefined
): number {
  const now = Date.now()
  let dateToUse: Date | null = null
  
  // Prefer publishedAt, fallback to retrievedAt
  if (publishedAt) {
    try {
      dateToUse = new Date(publishedAt)
      if (isNaN(dateToUse.getTime())) dateToUse = null
    } catch {
      dateToUse = null
    }
  }
  
  if (!dateToUse && retrievedAt) {
    try {
      dateToUse = new Date(retrievedAt)
      if (isNaN(dateToUse.getTime())) dateToUse = null
    } catch {
      dateToUse = null
    }
  }
  
  if (!dateToUse) {
    return 0.5 // No date = neutral score
  }
  
  const daysAgo = (now - dateToUse.getTime()) / (1000 * 60 * 60 * 24)
  
  // Recency bonuses:
  // - Within 30 days: 1.0
  // - Within 90 days: 0.8
  // - Within 180 days: 0.6
  // - Older: 0.4
  if (daysAgo <= 30) return 1.0
  if (daysAgo <= 90) return 0.8
  if (daysAgo <= 180) return 0.6
  return 0.4
}

/**
 * Check if a claim is first-party
 * First-party = domain matches competitor domain or is a direct vendor site
 */
function isFirstParty(
  claim: EvidenceClaim,
  competitorDomains: string[] = []
): boolean {
  const claimDomain = claim.domain.toLowerCase().replace(/^www\./, '')
  
  return competitorDomains.some((compDomain) => {
    const normalized = compDomain.toLowerCase().replace(/^www\./, '')
    // Exact match or subdomain match
    return claimDomain === normalized || claimDomain.endsWith(`.${normalized}`)
  })
}

/**
 * Rank claims by deterministic scoring
 * 
 * Scoring factors:
 * 1. Recency bonus (0..1) - based on publishedAt/retrievedAt
 * 2. First-party bonus (1.2x multiplier if first-party)
 * 3. Evidence type weight (0.3..1.0)
 * 4. Confidence weight (0.5..1.0) if present
 * 
 * Returns sorted list (highest score first)
 */
export function rankClaims(
  claims: EvidenceClaim[],
  competitorDomains: string[] = []
): EvidenceClaim[] {
  const scored = claims.map((claim) => {
    // Base score starts at 1.0
    let score = 1.0
    
    // Recency bonus
    const recencyBonus = computeRecencyBonus(claim.publishedAt, claim.retrievedAt)
    score *= (0.5 + recencyBonus * 0.5) // Scale to 0.5..1.0 range
    
    // First-party bonus
    if (isFirstParty(claim, competitorDomains)) {
      score *= 1.2
    }
    
    // Type weight
    const typeWeight = TYPE_WEIGHTS[claim.evidenceType] ?? 0.5
    score *= typeWeight
    
    // Confidence weight
    if (claim.confidence) {
      const confWeight = CONFIDENCE_WEIGHTS[claim.confidence] ?? 0.75
      score *= confWeight
    }
    
    return {
      ...claim,
      score,
    }
  })
  
  // Sort by score (descending), then by retrievedAt (most recent first), then by claimText
  return scored.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score
    }
    
    // Tie-breaker: most recent first
    const aDate = a.retrievedAt || a.publishedAt || ''
    const bDate = b.retrievedAt || b.publishedAt || ''
    if (aDate !== bDate) {
      return bDate.localeCompare(aDate)
    }
    
    // Final tie-breaker: alphabetical by claim text
    return a.claimText.localeCompare(b.claimText)
  })
}

