/**
 * Evidence claim deduplication
 * Removes exact duplicates and near-duplicates
 */

import type { EvidenceClaim } from './types'
import { normalizeClaimText, canonicalizeUrl } from './normalize'

/**
 * Simple token-based similarity
 * Returns ratio of overlapping tokens (0..1)
 */
function computeSimilarity(text1: string, text2: string): number {
  const normalize = (s: string) => normalizeClaimText(s).toLowerCase()
  const tokens1 = new Set(normalize(text1).split(/\s+/).filter(Boolean))
  const tokens2 = new Set(normalize(text2).split(/\s+/).filter(Boolean))
  
  if (tokens1.size === 0 && tokens2.size === 0) return 1
  if (tokens1.size === 0 || tokens2.size === 0) return 0
  
  // Count overlapping tokens
  let overlap = 0
  for (const token of tokens1) {
    if (tokens2.has(token)) {
      overlap++
    }
  }
  
  // Jaccard similarity: intersection / union
  const union = tokens1.size + tokens2.size - overlap
  return union > 0 ? overlap / union : 0
}

/**
 * Deduplicate claims
 * 
 * Removes:
 * 1. Exact duplicates (same fingerprint)
 * 2. Near duplicates (same canonical URL + highly similar claim text > 0.85)
 * 
 * Keeps the first occurrence of each duplicate group
 */
export function dedupeClaims(claims: EvidenceClaim[]): EvidenceClaim[] {
  if (claims.length === 0) return []
  
  // First pass: remove exact duplicates by fingerprint
  const seenFingerprints = new Set<string>()
  const uniqueByFingerprint = claims.filter((claim) => {
    if (seenFingerprints.has(claim.fingerprint)) {
      return false
    }
    seenFingerprints.add(claim.fingerprint)
    return true
  })
  
  // Second pass: remove near-duplicates
  // Group by canonical URL
  const byCanonicalUrl = new Map<string, EvidenceClaim[]>()
  for (const claim of uniqueByFingerprint) {
    const canonical = canonicalizeUrl(claim.canonicalUrl)
    if (!byCanonicalUrl.has(canonical)) {
      byCanonicalUrl.set(canonical, [])
    }
    byCanonicalUrl.get(canonical)!.push(claim)
  }
  
  // For each canonical URL group, keep only non-similar claims
  const deduped: EvidenceClaim[] = []
  for (const [canonicalUrl, urlClaims] of byCanonicalUrl.entries()) {
    if (urlClaims.length === 1) {
      // Only one claim for this URL, keep it
      deduped.push(urlClaims[0])
      continue
    }
    
    // Multiple claims for same URL - check similarity
    const kept: EvidenceClaim[] = []
    for (const claim of urlClaims) {
      // Check if this claim is similar to any already kept claim
      let isSimilar = false
      for (const keptClaim of kept) {
        const similarity = computeSimilarity(claim.claimText, keptClaim.claimText)
        if (similarity > 0.85) {
          isSimilar = true
          break
        }
      }
      
      if (!isSimilar) {
        kept.push(claim)
      }
    }
    
    deduped.push(...kept)
  }
  
  return deduped
}

