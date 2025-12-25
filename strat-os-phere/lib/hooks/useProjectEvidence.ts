/**
 * Hook for fetching and normalizing evidence for a project
 * 
 * Provides a single source of truth for evidence data, with impact-first sorting
 */

'use client'

import { useMemo } from 'react'
import type { NormalizedEvidenceBundle, NormalizedEvidenceItem } from '@/lib/evidence/types'
import type { OpportunityV3Item } from '@/lib/schemas/opportunityV3'

// Support both V3 and V2 opportunity formats
// V2 opportunities may not have citations at all, so we make this flexible
type OpportunityItem = OpportunityV3Item | {
  title: string
  [key: string]: unknown // Allow any additional properties
}

export type EvidenceStrength = 'Strong' | 'Directional' | 'Weak'

export interface EvidenceTableItem {
  id: string
  evidence: string // short statement / summary
  impact: number // 0-10 scale
  strength: EvidenceStrength
  source: string // domain or type (pricing page, docs, reviews)
  linkedTo: string | null // opportunity name if applicable
  date: string | null // captured / last seen
  url: string
  type: string
  domain: string | null
  snippet: string | null
}

/**
 * Compute evidence strength from item properties
 */
function computeStrength(item: NormalizedEvidenceItem): EvidenceStrength {
  // Consider type (official sources are stronger)
  const strongTypes = ['pricing', 'docs', 'security']
  const directionalTypes = ['reviews', 'changelog', 'jobs']
  
  if (strongTypes.includes(item.type)) {
    // Recent official sources are strong
    if (item.publishedAt || item.retrievedAt) {
      const date = item.publishedAt || item.retrievedAt
      if (date) {
        const daysAgo = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
        if (daysAgo < 90) return 'Strong'
      }
    }
    return 'Directional'
  }
  
  if (directionalTypes.includes(item.type)) {
    return 'Directional'
  }
  
  return 'Weak'
}

/**
 * Compute impact score (0-10) from item properties
 */
function computeImpact(item: NormalizedEvidenceItem): number {
  // Start with scoreHint if present (assumed to be 0-10)
  if (item.scoreHint !== null && item.scoreHint !== undefined) {
    return Math.min(10, Math.max(0, item.scoreHint))
  }
  
  // Compute from type and recency
  let impact = 5 // baseline
  
  // Official sources have higher impact
  const officialTypes = ['pricing', 'docs', 'security']
  if (officialTypes.includes(item.type)) {
    impact += 2
  }
  
  // Recent items have higher impact
  const date = item.publishedAt || item.retrievedAt
  if (date) {
    const daysAgo = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (daysAgo < 30) {
      impact += 2
    } else if (daysAgo < 90) {
      impact += 1
    }
  }
  
  // Items with snippets/titles are more valuable
  if (item.snippet || item.title) {
    impact += 1
  }
  
  return Math.min(10, Math.max(0, impact))
}

/**
 * Match evidence items to opportunities by URL
 */
function findLinkedOpportunity(
  item: NormalizedEvidenceItem,
  opportunities: OpportunityItem[]
): string | null {
  const itemUrl = item.url.toLowerCase()
  
  for (const opp of opportunities) {
    // Check citations (V3 format)
    if ('citations' in opp && Array.isArray(opp.citations)) {
      for (const citation of opp.citations) {
        if (citation.url && citation.url.toLowerCase() === itemUrl) {
          return opp.title
        }
      }
    }
    
    // Check evidence.citations (V2 format)
    if ('evidence' in opp && opp.evidence && typeof opp.evidence === 'object') {
      const evidence = opp.evidence as { citations?: Array<{ url?: string }> }
      if (Array.isArray(evidence.citations)) {
        for (const citation of evidence.citations) {
          if (citation.url && citation.url.toLowerCase() === itemUrl) {
            return opp.title
          }
        }
      }
    }
    
    // Check proof points citations (V3 format)
    if ('proof_points' in opp && Array.isArray(opp.proof_points)) {
      for (const proofPoint of opp.proof_points) {
        if (proofPoint && typeof proofPoint === 'object' && 'citations' in proofPoint) {
          const proofCitations = proofPoint.citations
          if (Array.isArray(proofCitations)) {
            for (const citation of proofCitations) {
              if (citation && typeof citation === 'object' && 'url' in citation) {
                const url = citation.url
                if (typeof url === 'string' && url.toLowerCase() === itemUrl) {
                  return opp.title
                }
              }
            }
          }
        }
      }
    }
  }
  
  return null
}

/**
 * Normalize evidence bundle to table items
 */
function normalizeToTableItems(
  bundle: NormalizedEvidenceBundle | null,
  opportunities: OpportunityItem[] = []
): EvidenceTableItem[] {
  if (!bundle || !bundle.items || bundle.items.length === 0) {
    return []
  }
  
  return bundle.items.map((item) => {
    const impact = computeImpact(item)
    const strength = computeStrength(item)
    const linkedTo = findLinkedOpportunity(item, opportunities)
    
    // Use snippet or title as evidence statement, fallback to URL
    const evidence = item.snippet || item.title || item.url
    
    // Format source (domain or type)
    const source = item.domain || item.type || 'Unknown'
    
    // Use published date if available, otherwise retrieved date
    const date = item.publishedAt || item.retrievedAt || null
    
    return {
      id: item.id,
      evidence,
      impact,
      strength,
      source,
      linkedTo,
      date,
      url: item.url,
      type: item.type,
      domain: item.domain || null,
      snippet: item.snippet || null,
    }
  })
}

/**
 * Sort evidence items by impact DESC, strength DESC, date DESC
 */
function sortByImpact(items: EvidenceTableItem[]): EvidenceTableItem[] {
  const strengthOrder: Record<EvidenceStrength, number> = {
    Strong: 3,
    Directional: 2,
    Weak: 1,
  }
  
  return [...items].sort((a, b) => {
    // First by impact (DESC)
    if (a.impact !== b.impact) {
      return b.impact - a.impact
    }
    
    // Then by strength (DESC)
    if (a.strength !== b.strength) {
      return strengthOrder[b.strength] - strengthOrder[a.strength]
    }
    
    // Finally by date (DESC - most recent first)
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
    if (a.date) return -1
    if (b.date) return 1
    
    return 0
  })
}

/**
 * Hook for accessing project evidence
 * 
 * @param bundle - Normalized evidence bundle (can be null or undefined)
 * @param opportunities - Optional opportunities array for linking (V3 or V2 format)
 * @returns Sorted evidence items ready for table display
 */
export function useProjectEvidence(
  bundle: NormalizedEvidenceBundle | null | undefined,
  opportunities: OpportunityItem[] = []
): EvidenceTableItem[] {
  return useMemo(() => {
    const safeBundle = bundle ?? null
    const items = normalizeToTableItems(safeBundle, opportunities)
    return sortByImpact(items)
  }, [bundle, opportunities])
}

