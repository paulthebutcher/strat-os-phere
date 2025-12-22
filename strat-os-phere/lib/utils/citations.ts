/**
 * Citation date extraction utilities
 * Centralized citation date handling to prevent type drift
 */

import { newestDate } from './dates'

/**
 * Minimal citation-like type for date extraction
 * Matches the structure used in opportunity schemas without importing server-only types
 */
export interface CitationLike {
  extracted_at?: string | null
  published_at?: string | null
  source_date?: string | null
  captured_at?: string | null
  created_at?: string | null
  date?: string | null
}

/**
 * Extract the newest citation date from an array of citations
 * Checks multiple date fields in order of preference:
 * 1. extracted_at (most common for our use case)
 * 2. published_at
 * 3. source_date
 * 4. captured_at
 * 5. created_at
 * 6. date (generic fallback)
 * 
 * Returns null if no valid dates are found
 */
export function newestCitationDate(
  citations: CitationLike[] | null | undefined
): Date | null {
  if (!citations || !Array.isArray(citations) || citations.length === 0) {
    return null
  }

  // Collect all date candidates from citations
  const dateCandidates: unknown[] = []

  for (const citation of citations) {
    // Prefer extracted_at as it's the most semantically correct for our use case
    if (citation.extracted_at) {
      dateCandidates.push(citation.extracted_at)
    } else if (citation.published_at) {
      dateCandidates.push(citation.published_at)
    } else if (citation.source_date) {
      dateCandidates.push(citation.source_date)
    } else if (citation.captured_at) {
      dateCandidates.push(citation.captured_at)
    } else if (citation.created_at) {
      dateCandidates.push(citation.created_at)
    } else if (citation.date) {
      dateCandidates.push(citation.date)
    }
  }

  // Use the centralized newestDate utility
  return newestDate(dateCandidates)
}

