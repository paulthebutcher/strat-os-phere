/**
 * Adapter for extracting citations from result artifacts
 * 
 * Provides a unified interface to collect citations from various artifact shapes
 * (v2/v3/legacy) without requiring schema changes.
 */

import { extractCitationsFromArtifact, type NormalizedCitation } from '@/lib/results/evidence'

/**
 * Citation input shape that matches what evidenceGating expects
 */
export type CitationInput = {
  url?: string
  source_type?: string
  sourceType?: string
  date?: string
  published_at?: string
  extracted_at?: string
  extractedAt?: string
  publishedAt?: string
  timestamp?: string | number
}

/**
 * Converts NormalizedCitation to CitationInput format
 */
function normalizeToInput(citation: NormalizedCitation): CitationInput {
  return {
    url: citation.url,
    sourceType: citation.sourceType,
    date: citation.date?.toISOString(),
  }
}

/**
 * Collects citations from result content
 * 
 * Searches common locations for citations across the app:
 * - content.citations
 * - content.evidence_citations
 * - content.opportunities[].citations
 * - content.opportunities[].evidence?.citations
 * - content.criteria[].citations
 * - content.scorecard?.citations
 * 
 * Returns a flattened array, de-duplicated by url+date if possible (safe de-dupe).
 */
export function collectCitationsFromResultContent(content: any): CitationInput[] {
  if (!content || typeof content !== 'object') {
    return []
  }
  
  // Use existing extractCitationsFromArtifact which handles all the locations
  const normalizedCitations = extractCitationsFromArtifact(content)
  
  // Convert to CitationInput format and de-duplicate
  const seen = new Set<string>()
  const result: CitationInput[] = []
  
  for (const citation of normalizedCitations) {
    // Create a key for de-duplication (url + date if available)
    const key = citation.date
      ? `${citation.url}|${citation.date.toISOString()}`
      : citation.url
    
    if (!seen.has(key)) {
      seen.add(key)
      result.push(normalizeToInput(citation))
    }
  }
  
  return result
}

