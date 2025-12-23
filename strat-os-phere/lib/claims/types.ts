/**
 * Claim-centric evidence types
 * Extracts claims from evidence bundles and groups citations by claim
 */

import type { Citation } from '@/lib/evidence/citations'

export type ClaimCategory =
  | 'pricing'
  | 'docs'
  | 'reviews'
  | 'jobs'
  | 'changelog'
  | 'status'
  | 'marketing'
  | 'other'

export type ClaimSupport = 'strong' | 'medium' | 'weak'

export interface ClaimConflict {
  statement: string
  citations: Citation[]
}

export interface Claim {
  id: string
  statement: string // concise, specific
  category: ClaimCategory
  support: ClaimSupport
  recencyDays?: number | null
  citations: Citation[]
  conflicts?: ClaimConflict[]
}

export interface ClaimsBundle {
  schema_version: 1
  meta: {
    generatedAt: string
    company?: string
    evidenceWindowDays?: number
    sourceCountsByType?: Record<string, number>
  }
  claims: Claim[]
}

