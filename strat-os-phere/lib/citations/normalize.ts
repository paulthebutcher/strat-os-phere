/**
 * PR6: Citation normalization layer
 * 
 * Handles legacy citation shapes and normalizes them to the canonical Citation type.
 * This provides backward compatibility with older stored artifacts.
 */

import type { Citation } from './types'
import type { NormalizedEvidenceType } from '@/lib/evidence/types'
import { isValidUrl, canonicalizeUrl, clampConfidence } from './utils'

export type CitationInput = unknown

/**
 * Normalized evidence type mapping
 * Maps various string values to NormalizedEvidenceType
 */
function normalizeEvidenceType(input: unknown): NormalizedEvidenceType | undefined {
  if (!input || typeof input !== 'string') return undefined
  
  const normalized = input.toLowerCase().trim()
  
  // Map common variants to canonical types
  const mapping: Record<string, NormalizedEvidenceType> = {
    pricing: 'pricing',
    'pricing_page': 'pricing',
    docs: 'docs',
    documentation: 'docs',
    doc: 'docs',
    reviews: 'reviews',
    review: 'reviews',
    jobs: 'jobs',
    job: 'jobs',
    changelog: 'changelog',
    changelogs: 'changelog',
    blog: 'blog',
    community: 'community',
    security: 'security',
    status: 'other', // status maps to 'other' since it's not in NormalizedEvidenceType
    marketing_site: 'blog',
    marketing: 'blog',
    social: 'blog',
    other: 'other',
  }
  
  // Direct match
  if (mapping[normalized]) {
    return mapping[normalized]
  }
  
  // Partial matches
  if (normalized.includes('pricing')) return 'pricing'
  if (normalized.includes('review')) return 'reviews'
  if (normalized.includes('job')) return 'jobs'
  if (normalized.includes('changelog')) return 'changelog'
  if (normalized.includes('doc')) return 'docs'
  if (normalized.includes('blog') || normalized.includes('marketing')) return 'blog'
  if (normalized.includes('community')) return 'community'
  if (normalized.includes('security')) return 'security'
  if (normalized.includes('status')) return 'other' // status maps to 'other'
  
  return undefined
}

/**
 * Parses a date-like value to an ISO string
 * Returns undefined if parsing fails
 * If input is already a valid ISO string, returns it as-is
 */
function parseDateToISO(input: unknown): string | undefined {
  if (!input) return undefined
  
  try {
    // If it's already a valid ISO string, return as-is
    if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(input)) {
      // Validate it parses correctly
      const testDate = new Date(input)
      if (!isNaN(testDate.getTime())) {
        return input
      }
    }
    
    let date: Date | null = null
    
    if (input instanceof Date) {
      date = isNaN(input.getTime()) ? null : input
    } else if (typeof input === 'string') {
      const parsed = new Date(input)
      date = isNaN(parsed.getTime()) ? null : parsed
    } else if (typeof input === 'number') {
      const parsed = new Date(input)
      date = isNaN(parsed.getTime()) ? null : parsed
    }
    
    if (date) {
      return date.toISOString()
    }
  } catch {
    // Ignore parsing errors
  }
  
  return undefined
}

/**
 * Normalizes a single citation input to the canonical Citation type
 * Returns null if the citation cannot be normalized (e.g., missing URL)
 */
export function normalizeCitation(input: CitationInput): Citation | null {
  if (!input) return null
  
  // Handle string URLs directly
  if (typeof input === 'string') {
    const url = canonicalizeUrl(input)
    if (!isValidUrl(url)) return null
    return { url }
  }
  
  // Handle objects
  if (typeof input !== 'object') return null
  
  const record = input as Record<string, unknown>
  
  // Extract URL from various possible fields
  const urlRaw = record.url || record.href || record.link || record.citation || record.source_url
  if (!urlRaw || typeof urlRaw !== 'string') return null
  
  const url = canonicalizeUrl(urlRaw)
  if (!isValidUrl(url)) return null
  
  // Extract title
  const title = record.title || record.pageTitle || record.name
  const titleStr = typeof title === 'string' ? title.trim() || undefined : undefined
  
  // Extract evidence type from various fields
  const typeRaw = record.type || record.evidence_type || record.evidenceType || record.source_type || record.sourceType
  const evidenceType = normalizeEvidenceType(typeRaw)
  
  // Extract retrievedAt from various fields
  const retrievedAtRaw = record.retrievedAt || record.retrieved_at || record.extractedAt || record.extracted_at || record.date || record.created_at || record.createdAt
  const retrievedAt = parseDateToISO(retrievedAtRaw)
  
  // Extract publishedAt from various fields
  const publishedAtRaw = record.publishedAt || record.published_at || record.publishedDate || record.published_date || record.publishDate || record.source_date
  const publishedAt = parseDateToISO(publishedAtRaw)
  
  // Extract confidence (handle both 0-1 and 0-100 ranges)
  const confidenceRaw = record.confidence || record.confidence_score || record.score
  const confidence = clampConfidence(
    typeof confidenceRaw === 'number' ? confidenceRaw : undefined
  )
  
  const citation: Citation = {
    url,
    ...(titleStr && { title: titleStr }),
    ...(evidenceType && { evidenceType }),
    ...(retrievedAt && { retrievedAt }),
    ...(publishedAt && { publishedAt }),
    ...(confidence !== undefined && { confidence }),
  }
  
  return citation
}

/**
 * Normalizes citations from various input shapes
 * 
 * Handles:
 * - Single citation object
 * - Array of citations
 * - Object with citations field
 * - Array of mixed shapes
 * 
 * Returns an array of normalized citations, filtering out invalid ones
 */
export function normalizeCitations(input: CitationInput): Citation[] {
  if (!input) return []
  
  // Handle arrays
  if (Array.isArray(input)) {
    const normalized: Citation[] = []
    const seenUrls = new Set<string>()
    
    for (const item of input) {
      const citation = normalizeCitation(item)
      if (citation) {
        // Deduplicate by canonical URL
        if (!seenUrls.has(citation.url)) {
          normalized.push(citation)
          seenUrls.add(citation.url)
        }
      }
    }
    
    return normalized
  }
  
  // Handle object with citations field
  if (typeof input === 'object') {
    const record = input as Record<string, unknown>
    
    // Check for citations array
    if (Array.isArray(record.citations)) {
      return normalizeCitations(record.citations)
    }
    
    // Check for evidence_citations array
    if (Array.isArray(record.evidence_citations)) {
      return normalizeCitations(record.evidence_citations)
    }
    
    // Check for sources array
    if (Array.isArray(record.sources)) {
      return normalizeCitations(record.sources)
    }
    
    // Check for references array
    if (Array.isArray(record.references)) {
      return normalizeCitations(record.references)
    }
    
    // Try to normalize as a single citation
    const citation = normalizeCitation(input)
    return citation ? [citation] : []
  }
  
  return []
}

