/**
 * Lightweight inline citations utilities
 * 
 * Provides best-effort citation extraction and formatting for readout components
 * without requiring pipeline changes or schema modifications.
 */

import type { NormalizedCitation } from './evidence'
import { extractCitationsFromAllArtifacts, normalizeCitation } from './evidence'

export interface InlineCitation {
  url: string
  label: string
  sourceType: string
}

/**
 * Formats a citation label for display
 * Maps source types to user-friendly labels
 */
export function formatCitationLabel(citation: { sourceType?: string; source_type?: string; title?: string | null }): string {
  const sourceType = citation.sourceType || citation.source_type || 'other'
  const title = citation.title

  // If we have a title, use it (truncated if too long)
  if (title) {
    return title.length > 40 ? title.substring(0, 40) + '...' : title
  }

  // Map source types to labels
  const labelMap: Record<string, string> = {
    pricing: 'Pricing',
    changelog: 'Changelog',
    reviews: 'Reviews',
    jobs: 'Jobs',
    docs: 'Documentation',
    status: 'Status',
    marketing_site: 'Marketing site',
    other: 'Source',
  }

  return labelMap[sourceType.toLowerCase()] || 'Source'
}

/**
 * Extracts citations from an artifact
 * Handles both "citations" arrays and "evidence_citations" fields
 */
export function extractCitationsFromArtifact(artifact: unknown): NormalizedCitation[] {
  if (!artifact || typeof artifact !== 'object') {
    return []
  }

  const record = artifact as Record<string, unknown>
  const citations: NormalizedCitation[] = []

  // Check for citations array
  if (Array.isArray(record.citations)) {
    for (const citation of record.citations) {
      const normalized = normalizeCitation(citation)
      if (normalized) {
        citations.push(normalized)
      }
    }
  }

  // Check for evidence_citations array
  if (Array.isArray(record.evidence_citations)) {
    for (const citation of record.evidence_citations) {
      const normalized = normalizeCitation(citation)
      if (normalized) {
        citations.push(normalized)
      }
    }
  }

  // Check for proof_points with citations (V3 opportunities)
  if (Array.isArray(record.proof_points)) {
    for (const proofPoint of record.proof_points) {
      if (proofPoint && typeof proofPoint === 'object') {
        const proofRecord = proofPoint as Record<string, unknown>
        if (Array.isArray(proofRecord.citations)) {
          for (const citation of proofRecord.citations) {
            const normalized = normalizeCitation(citation)
            if (normalized) {
              citations.push(normalized)
            }
          }
        }
      }
    }
  }

  return citations
}

/**
 * Picks 1-2 citations for inline display
 * Prioritizes more recent citations and higher confidence sources
 */
export function pickInlineCitations(
  item: unknown,
  max: number = 2
): InlineCitation[] {
  const citations = extractCitationsFromArtifact(item)
  
  if (citations.length === 0) {
    return []
  }

  // Sort by date (most recent first), then take up to max
  const sorted = [...citations].sort((a, b) => {
    if (a.date && b.date) {
      return b.date.getTime() - a.date.getTime()
    }
    if (a.date) return -1
    if (b.date) return 1
    return 0
  })

  return sorted.slice(0, max).map((citation) => ({
    url: citation.url,
    label: formatCitationLabel(citation),
    sourceType: citation.sourceType,
  }))
}

