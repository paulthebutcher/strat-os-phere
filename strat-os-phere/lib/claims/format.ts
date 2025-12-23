/**
 * Formatting helpers for claims
 */

import type { Claim, ClaimCategory } from './types'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'

/**
 * Group claims by category
 */
export function groupClaimsByCategory(claims: Claim[]): Record<ClaimCategory, Claim[]> {
  const grouped: Record<ClaimCategory, Claim[]> = {
    pricing: [],
    docs: [],
    reviews: [],
    jobs: [],
    changelog: [],
    status: [],
    marketing: [],
    other: [],
  }

  for (const claim of claims) {
    grouped[claim.category].push(claim)
  }

  return grouped
}

/**
 * Simple heuristic to match claims to an opportunity
 * Matches keywords from opportunity title/tags to claim statements/citations
 */
export function topClaimsForOpportunity(
  opportunity: { title: string; tags?: string[] },
  claims: Claim[]
): Claim[] {
  // Extract keywords from title and tags
  const keywords = new Set<string>()
  
  // Split title into words (lowercase, alphanumeric only)
  const titleWords = opportunity.title
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.replace(/[^a-z0-9]/g, ''))
    .filter(w => w.length > 3) // Only meaningful words
  
  titleWords.forEach(w => keywords.add(w))
  
  // Add tag words
  if (opportunity.tags) {
    opportunity.tags.forEach(tag => {
      const tagWords = tag.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, ''))
      tagWords.forEach(w => keywords.add(w))
    })
  }

  // Score each claim by keyword matches
  const scored = claims.map(claim => {
    const statementLower = claim.statement.toLowerCase()
    let score = 0
    
    // Check if any keyword appears in statement
    for (const keyword of keywords) {
      if (statementLower.includes(keyword)) {
        score += 2
      }
    }
    
    // Check citations (title/url)
    for (const citation of claim.citations) {
      const citationText = `${citation.title || ''} ${citation.url || ''}`.toLowerCase()
      for (const keyword of keywords) {
        if (citationText.includes(keyword)) {
          score += 1
        }
      }
    }
    
    return { claim, score }
  })

  // Sort by score descending, take top 3
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.claim)
}

