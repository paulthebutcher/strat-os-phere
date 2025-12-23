/**
 * Load claims from evidence bundles
 * Converts NormalizedEvidenceBundle to EvidenceClaim format
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { NormalizedEvidenceBundle, NormalizedEvidenceItem } from '../types'
import type { EvidenceClaim, ClaimsByType } from './types'
import { readLatestEvidenceBundle } from '../readBundle'
import {
  canonicalizeUrl,
  extractDomain,
  normalizeClaimText,
  computeClaimFingerprintSync,
} from './normalize'

/**
 * Convert a NormalizedEvidenceItem to an EvidenceClaim
 */
function itemToClaim(item: NormalizedEvidenceItem, index: number): EvidenceClaim {
  const canonical = canonicalizeUrl(item.url)
  const domain = item.domain || extractDomain(item.url)
  
  // Use snippet or title as claim text, fallback to URL
  const claimText = item.snippet || item.title || item.url
  
  // Compute fingerprint
  const fingerprint = computeClaimFingerprintSync(
    claimText,
    canonical,
    item.type || 'other',
    item.snippet
  )
  
  return {
    id: item.id || `claim-${fingerprint}-${index}`,
    claimText: normalizeClaimText(claimText),
    evidenceType: (item.type || 'other') as any,
    url: item.url,
    canonicalUrl: canonical,
    domain,
    title: item.title || undefined,
    excerpt: item.snippet || undefined,
    publishedAt: item.publishedAt || null,
    retrievedAt: item.retrievedAt || null,
    fingerprint,
  }
}

/**
 * Group claims by evidence type
 */
function groupClaimsByType(claims: EvidenceClaim[]): ClaimsByType {
  const grouped: ClaimsByType = {
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
  
  for (const claim of claims) {
    const type = claim.evidenceType || 'other'
    if (grouped[type]) {
      grouped[type].push(claim)
    } else {
      grouped.other.push(claim)
    }
  }
  
  return grouped
}

/**
 * Load claims for a project
 * 
 * Supports:
 * 1. New claim bundle artifact (preferred) - if claims are stored as artifacts
 * 2. Existing evidence_sources rows - by synthesizing claims from NormalizedEvidenceBundle
 * 
 * Returns claims grouped by EvidenceType
 */
export async function loadClaimsForProject(
  supabase: TypedSupabaseClient,
  projectId: string,
  competitorId?: string
): Promise<ClaimsByType> {
  // Load the latest evidence bundle
  const bundle = await readLatestEvidenceBundle(supabase, projectId)
  
  if (!bundle || bundle.items.length === 0) {
    // Return empty grouped claims
    return {
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
  }
  
  // Filter by competitor if specified
  // Note: NormalizedEvidenceBundle doesn't have competitorId, so we'd need to
  // check if the bundle has competitor-specific data or filter by domain
  // For now, we'll return all claims (can be enhanced later)
  
  // Convert items to claims
  const claims = bundle.items.map((item, index) => itemToClaim(item, index))
  
  // Group by type
  return groupClaimsByType(claims)
}

/**
 * Load all claims (flattened) for a project
 */
export async function loadAllClaimsForProject(
  supabase: TypedSupabaseClient,
  projectId: string,
  competitorId?: string
): Promise<EvidenceClaim[]> {
  const claimsByType = await loadClaimsForProject(supabase, projectId, competitorId)
  return Object.values(claimsByType).flat()
}

