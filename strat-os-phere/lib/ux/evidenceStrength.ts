/**
 * Evidence Strength - Compute strength indicators for opportunities
 * 
 * Provides utilities to compute evidence strength labels and determine
 * when evidence is weak (near minimum thresholds).
 * 
 * Thresholds align with PR5 gating:
 * - Limited: exactly 3 citations or only 2 types (minimum threshold)
 * - Moderate: 4-9 citations across 3+ types
 * - Strong: 10+ citations across 4+ types
 */

import type { Citation } from '@/lib/opportunities/opportunityV1'

/**
 * Evidence strength level
 */
export type EvidenceStrength = 'Limited' | 'Moderate' | 'Strong'

/**
 * Evidence strength result
 */
export interface EvidenceStrengthResult {
  strength: EvidenceStrength
  citationCount: number
  typeCount: number
  types: string[]
  isWeak: boolean // true if near minimum thresholds (exactly 3 citations or only 2 types)
}

/**
 * Compute evidence strength from citations
 * 
 * @param citations - Array of citations from OpportunityV1
 * @returns Evidence strength result with counts and strength label
 */
export function computeEvidenceStrength(
  citations: Citation[]
): EvidenceStrengthResult {
  const citationCount = citations.length
  const distinctTypes = new Set(citations.map((c) => c.sourceType))
  const typeCount = distinctTypes.size
  const types = Array.from(distinctTypes)

  // Determine strength level
  let strength: EvidenceStrength
  if (citationCount >= 10 && typeCount >= 4) {
    strength = 'Strong'
  } else if (citationCount >= 4 && typeCount >= 3) {
    strength = 'Moderate'
  } else {
    strength = 'Limited'
  }

  // Check if evidence is weak (near minimum thresholds)
  // Weak = exactly 3 citations OR only 2 types
  const isWeak = citationCount === 3 || typeCount === 2

  return {
    strength,
    citationCount,
    typeCount,
    types,
    isWeak,
  }
}

/**
 * Format evidence strength label for display
 * 
 * @param result - Evidence strength result
 * @returns Formatted string like "Moderate (6 citations across 3 types)"
 */
export function formatEvidenceStrengthLabel(
  result: EvidenceStrengthResult
): string {
  const { strength, citationCount, typeCount } = result
  return `${strength} (${citationCount} citation${citationCount !== 1 ? 's' : ''} across ${typeCount} type${typeCount !== 1 ? 's' : ''})`
}

/**
 * Format source type for display
 * 
 * @param sourceType - Citation source type
 * @returns Human-readable label
 */
export function formatSourceType(sourceType: string): string {
  // Convert snake_case to Title Case
  return sourceType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

