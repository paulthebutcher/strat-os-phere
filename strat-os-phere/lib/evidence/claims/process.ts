/**
 * Process claims: normalize, dedupe, and rank
 * Main entry point for claim processing pipeline
 */

import type { EvidenceClaim, ClaimsByType } from './types'
import { dedupeClaims } from './dedupe'
import { rankClaims } from './rank'

/**
 * Process claims: dedupe and rank
 * 
 * @param claimsByType - Claims grouped by type
 * @param competitorDomains - Competitor domains for first-party detection
 * @returns Processed claims grouped by type
 */
export function processClaims(
  claimsByType: ClaimsByType,
  competitorDomains: string[] = []
): ClaimsByType {
  // Flatten all claims
  const allClaims = Object.values(claimsByType).flat()
  
  // Dedupe
  const deduped = dedupeClaims(allClaims)
  
  // Rank
  const ranked = rankClaims(deduped, competitorDomains)
  
  // Regroup by type
  const processed: ClaimsByType = {
    pricing: [],
    docs: [],
    reviews: [],
    jobs: [],
    changelog: [],
    blog: [],
    community: [],
    security: [],
    other: [],
  }
  
  for (const claim of ranked) {
    const type = claim.evidenceType || 'other'
    if (processed[type]) {
      processed[type].push(claim)
    } else {
      processed.other.push(claim)
    }
  }
  
  return processed
}

