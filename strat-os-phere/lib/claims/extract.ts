/**
 * Deterministic claim extraction from evidence bundles
 * No LLM required - uses heuristics and pattern matching
 */

import type { NormalizedEvidenceBundle, NormalizedEvidenceItem } from '@/lib/evidence/types'
import type { Claim, ClaimCategory, ClaimSupport } from './types'
import type { Citation } from '@/lib/evidence/citations'
import { normalizeCitations } from '@/lib/evidence/citations'
import { mapEvidenceTypeToSourceType } from '@/lib/evidence/citations'

const MAX_CLAIMS = 25

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | undefined {
  try {
    return new URL(url).hostname
  } catch {
    return undefined
  }
}

/**
 * Normalize domain for comparison
 */
function normalizeDomain(domain: string): string {
  return domain.replace(/^www\./, '').toLowerCase()
}

/**
 * Check if domain is first-party
 */
function isFirstParty(domain: string | undefined, primaryDomain: string | undefined): boolean {
  if (!domain || !primaryDomain) return false
  return normalizeDomain(domain) === normalizeDomain(primaryDomain)
}

/**
 * Compute support strength for a claim
 */
function computeSupportStrength(
  citations: Citation[],
  primaryDomain?: string
): ClaimSupport {
  if (citations.length === 0) return 'weak'
  
  // Count distinct URLs
  const distinctUrls = new Set(citations.map(c => c.url))
  
  // Check for first-party + third-party mix
  let hasFirstParty = false
  let hasThirdParty = false
  
  for (const citation of citations) {
    const domain = citation.domain || extractDomain(citation.url)
    if (domain && primaryDomain) {
      if (isFirstParty(domain, primaryDomain)) {
        hasFirstParty = true
      } else {
        hasThirdParty = true
      }
    }
  }
  
  // Strong: 2+ citations across distinct URLs OR first-party + third-party
  if (distinctUrls.size >= 2 || (hasFirstParty && hasThirdParty)) {
    return 'strong'
  }
  
  // Medium: 1 citation but from first-party
  if (citations.length === 1 && hasFirstParty) {
    return 'medium'
  }
  
  // Weak: otherwise
  return 'weak'
}

/**
 * Compute recency in days
 */
function computeRecencyDays(item: NormalizedEvidenceItem): number | null {
  const dateStr = item.publishedAt || item.retrievedAt
  if (!dateStr) return null
  
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    return diffDays >= 0 ? diffDays : null
  } catch {
    return null
  }
}

/**
 * Simple Jaccard similarity for near-duplicate detection
 */
function jaccardSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 2))
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2))
  
  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)))
  const union = new Set([...wordsA, ...wordsB])
  
  return union.size === 0 ? 0 : intersection.size / union.size
}

/**
 * Normalize statement for deduplication
 */
function normalizeStatement(statement: string): string {
  return statement
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract candidate claim lines from pricing evidence
 */
function extractPricingClaims(items: NormalizedEvidenceItem[]): string[] {
  const claims: string[] = []
  const patterns = [
    /(?:plan|pricing|price|cost|billed|subscription).*?(?:per|month|year|seat|user|annually|monthly)/gi,
    /starting at.*?\$/gi,
    /contact sales/gi,
    /enterprise.*?pricing/gi,
  ]
  
  for (const item of items) {
    const text = `${item.title || ''} ${item.snippet || ''}`.toLowerCase()
    for (const pattern of patterns) {
      const matches = text.match(pattern)
      if (matches) {
        // Extract sentence containing the match
        const sentences = text.split(/[.!?]/)
        for (const sentence of sentences) {
          if (pattern.test(sentence)) {
            const cleaned = sentence.trim().replace(/\s+/g, ' ')
            if (cleaned.length > 10 && cleaned.length < 200) {
              claims.push(cleaned)
            }
          }
        }
      }
    }
  }
  
  return claims.slice(0, 8)
}

/**
 * Extract candidate claim lines from reviews evidence
 */
function extractReviewClaims(items: NormalizedEvidenceItem[]): string[] {
  const claims: string[] = []
  const complaintPatterns = [
    /\b(?:too|very|extremely)\s+(?:hard|difficult|slow|expensive|complicated|confusing)/gi,
    /\b(?:lack|missing|no)\s+(?:support|documentation|features?)/gi,
    /\b(?:poor|bad|terrible)\s+(?:support|onboarding|experience|ui|ux)/gi,
    /\b(?:bug|glitch|issue|problem).*?(?:frequent|often|always)/gi,
  ]
  
  const praisePatterns = [
    /\b(?:great|excellent|amazing|love|perfect).*?(?:support|onboarding|experience|ui|ux|features?)/gi,
    /\b(?:easy|simple|intuitive|fast|quick).*?(?:to use|setup|get started)/gi,
  ]
  
  for (const item of items) {
    const text = `${item.title || ''} ${item.snippet || ''}`.toLowerCase()
    const allPatterns = [...complaintPatterns, ...praisePatterns]
    
    for (const pattern of allPatterns) {
      const matches = text.match(pattern)
      if (matches) {
        const sentences = text.split(/[.!?]/)
        for (const sentence of sentences) {
          if (pattern.test(sentence)) {
            const cleaned = sentence.trim().replace(/\s+/g, ' ')
            if (cleaned.length > 10 && cleaned.length < 200) {
              claims.push(cleaned)
            }
          }
        }
      }
    }
  }
  
  return claims.slice(0, 8)
}

/**
 * Extract candidate claim lines from jobs evidence
 */
function extractJobClaims(items: NormalizedEvidenceItem[]): string[] {
  const claims: string[] = []
  const patterns = [
    /\b(?:required|must have|looking for).*?(?:skill|experience|knowledge)/gi,
    /\b(?:enterprise|soc2|sso|rbac|security|compliance)/gi,
    /\b(?:remote|hybrid|onsite)/gi,
  ]
  
  for (const item of items) {
    const text = `${item.title || ''} ${item.snippet || ''}`.toLowerCase()
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        const sentences = text.split(/[.!?]/)
        for (const sentence of sentences) {
          if (pattern.test(sentence)) {
            const cleaned = sentence.trim().replace(/\s+/g, ' ')
            if (cleaned.length > 10 && cleaned.length < 200) {
              claims.push(cleaned)
            }
          }
        }
      }
    }
  }
  
  return claims.slice(0, 8)
}

/**
 * Extract candidate claim lines from changelog evidence
 */
function extractChangelogClaims(items: NormalizedEvidenceItem[]): string[] {
  const claims: string[] = []
  const patterns = [
    /\b(?:added|launched|introduced|released|announced).*?(?:feature|functionality|capability)/gi,
    /\b(?:improved|enhanced|updated|upgraded)/gi,
    /\b(?:deprecated|removed|discontinued)/gi,
    /\d{4}-\d{2}-\d{2}.*?(?:release|version|update)/gi, // Date + release
  ]
  
  for (const item of items) {
    const text = `${item.title || ''} ${item.snippet || ''}`.toLowerCase()
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        const sentences = text.split(/[.!?]/)
        for (const sentence of sentences) {
          if (pattern.test(sentence)) {
            const cleaned = sentence.trim().replace(/\s+/g, ' ')
            if (cleaned.length > 10 && cleaned.length < 200) {
              claims.push(cleaned)
            }
          }
        }
      }
    }
  }
  
  return claims.slice(0, 8)
}

/**
 * Extract candidate claim lines from status evidence
 */
function extractStatusClaims(items: NormalizedEvidenceItem[]): string[] {
  const claims: string[] = []
  const patterns = [
    /\b(?:uptime|availability|downtime|outage)/gi,
    /\b(?:degraded|partial outage|maintenance|incident)/gi,
    /\b\d+\.\d+%.*?(?:uptime|availability)/gi,
  ]
  
  for (const item of items) {
    const text = `${item.title || ''} ${item.snippet || ''}`.toLowerCase()
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        const sentences = text.split(/[.!?]/)
        for (const sentence of sentences) {
          if (pattern.test(sentence)) {
            const cleaned = sentence.trim().replace(/\s+/g, ' ')
            if (cleaned.length > 10 && cleaned.length < 200) {
              claims.push(cleaned)
            }
          }
        }
      }
    }
  }
  
  return claims.slice(0, 8)
}

/**
 * Extract candidate claim lines from docs evidence
 */
function extractDocsClaims(items: NormalizedEvidenceItem[]): string[] {
  const claims: string[] = []
  const patterns = [
    /\b(?:integration|api|sso|rbac|authentication|authorization)/gi,
    /\b(?:supports|supports|compatible with)/gi,
    /\b(?:documentation|docs|guide|tutorial)/gi,
  ]
  
  for (const item of items) {
    const text = `${item.title || ''} ${item.snippet || ''}`.toLowerCase()
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        const sentences = text.split(/[.!?]/)
        for (const sentence of sentences) {
          if (pattern.test(sentence)) {
            const cleaned = sentence.trim().replace(/\s+/g, ' ')
            if (cleaned.length > 10 && cleaned.length < 200) {
              claims.push(cleaned)
            }
          }
        }
      }
    }
  }
  
  return claims.slice(0, 8)
}

/**
 * Map evidence type to claim category
 */
function mapEvidenceTypeToCategory(type: string): ClaimCategory {
  const mapping: Record<string, ClaimCategory> = {
    pricing: 'pricing',
    reviews: 'reviews',
    jobs: 'jobs',
    changelog: 'changelog',
    status: 'status',
    docs: 'docs',
    blog: 'marketing',
    community: 'marketing',
    security: 'docs',
    other: 'other',
  }
  return mapping[type] || 'other'
}

/**
 * Extract claims from evidence bundle
 */
export function extractClaims(
  bundle: NormalizedEvidenceBundle
): Claim[] {
  const primaryDomain = bundle.primaryUrl ? extractDomain(bundle.primaryUrl) : undefined
  
  // Group items by type
  const itemsByType = new Map<string, NormalizedEvidenceItem[]>()
  for (const item of bundle.items) {
    const type = item.type || 'other'
    if (!itemsByType.has(type)) {
      itemsByType.set(type, [])
    }
    itemsByType.get(type)!.push(item)
  }
  
  const allClaims: Claim[] = []
  
  // Extract claims by type
  for (const [type, items] of itemsByType.entries()) {
    if (items.length === 0) continue
    
    let candidateStatements: string[] = []
    
    switch (type) {
      case 'pricing':
        candidateStatements = extractPricingClaims(items)
        break
      case 'reviews':
        candidateStatements = extractReviewClaims(items)
        break
      case 'jobs':
        candidateStatements = extractJobClaims(items)
        break
      case 'changelog':
        candidateStatements = extractChangelogClaims(items)
        break
      case 'status':
        candidateStatements = extractStatusClaims(items)
        break
      case 'docs':
      case 'security':
        candidateStatements = extractDocsClaims(items)
        break
      default:
        // For other types, extract simple sentences
        for (const item of items.slice(0, 5)) {
          const text = `${item.title || ''} ${item.snippet || ''}`
          const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10 && s.trim().length < 200)
          candidateStatements.push(...sentences.slice(0, 2))
        }
    }
    
    // Create claims from candidate statements
    for (const statement of candidateStatements) {
      // Find items that support this statement
      const supportingItems: NormalizedEvidenceItem[] = []
      const statementLower = statement.toLowerCase()
      
      for (const item of items) {
        const itemText = `${item.title || ''} ${item.snippet || ''}`.toLowerCase()
        if (itemText.includes(statementLower.substring(0, 20)) || statementLower.includes(itemText.substring(0, 20))) {
          supportingItems.push(item)
        }
      }
      
      if (supportingItems.length === 0) continue
      
      // Convert items to citations
      const citations: Citation[] = supportingItems.map(item => {
        const sourceType = mapEvidenceTypeToSourceType(item.type || 'other')
        const domain = item.domain || extractDomain(item.url)
        
        return {
          url: item.url,
          title: item.title || null,
          source_type: sourceType,
          domain: domain || null,
          published_at: item.publishedAt || null,
          source_kind: domain && primaryDomain && isFirstParty(domain, primaryDomain)
            ? 'first_party'
            : domain
            ? 'third_party'
            : 'unknown',
          retrievedAt: item.retrievedAt || null,
          publishedAt: item.publishedAt || null,
          evidenceType: item.type || null,
        }
      })
      
      // Compute support strength
      const support = computeSupportStrength(citations, primaryDomain)
      
      // Compute recency (use most recent)
      const recencies = supportingItems.map(computeRecencyDays).filter((r): r is number => r !== null)
      const recencyDays = recencies.length > 0 ? Math.min(...recencies) : null
      
      // Create claim
      const claim: Claim = {
        id: `${type}-${Math.abs(statement.split('').reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0))}`,
        statement: statement.trim().charAt(0).toUpperCase() + statement.trim().slice(1),
        category: mapEvidenceTypeToCategory(type),
        support,
        recencyDays,
        citations,
      }
      
      allClaims.push(claim)
    }
  }
  
  // Deduplicate near-duplicate claims
  const deduplicated: Claim[] = []
  const seen = new Set<string>()
  
  for (const claim of allClaims) {
    const normalized = normalizeStatement(claim.statement)
    
    // Check if we've seen a similar statement
    let isDuplicate = false
    for (const seenNormalized of seen) {
      if (jaccardSimilarity(normalized, seenNormalized) > 0.7) {
        isDuplicate = true
        break
      }
    }
    
    if (!isDuplicate) {
      seen.add(normalized)
      deduplicated.push(claim)
    }
  }
  
  // Limit to MAX_CLAIMS, prioritize strong support
  return deduplicated
    .sort((a, b) => {
      // Sort by support strength first
      const strengthOrder = { strong: 3, medium: 2, weak: 1 }
      if (strengthOrder[a.support] !== strengthOrder[b.support]) {
        return strengthOrder[b.support] - strengthOrder[a.support]
      }
      // Then by recency (more recent = better)
      const aRecency = a.recencyDays ?? Infinity
      const bRecency = b.recencyDays ?? Infinity
      return aRecency - bRecency
    })
    .slice(0, MAX_CLAIMS)
}

