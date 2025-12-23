/**
 * PR6: Canonical Citation types
 * 
 * Standard citation shape used throughout the application.
 * All citations should be normalized to this shape for consistent rendering.
 */

import type { NormalizedEvidenceType } from '@/lib/evidence/types'

/**
 * Confidence score normalized to 0-1 range
 */
export type CitationConfidence = number

/**
 * Canonical Citation type
 * 
 * All citations should conform to this shape after normalization.
 * The normalization layer handles legacy shapes and missing fields.
 */
export type Citation = {
  /** Required: The citation URL */
  url: string
  /** Optional: Title or page title */
  title?: string
  /** Optional: Evidence type (reuses NormalizedEvidenceType from evidence types) */
  evidenceType?: NormalizedEvidenceType
  /** Optional: ISO string of when the citation was retrieved */
  retrievedAt?: string
  /** Optional: ISO string of when the source was published */
  publishedAt?: string
  /** Optional: Confidence score (0-1 range) */
  confidence?: CitationConfidence
}

