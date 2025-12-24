/**
 * PR4: Canonical evidence types enum/list
 * Maps DB source_type values into consistent categories
 */

export const EVIDENCE_TYPES = [
  'marketing_site',
  'pricing',
  'docs',
  'changelog',
  'reviews',
  'jobs',
  'status',
] as const

export type EvidenceType = typeof EVIDENCE_TYPES[number]

/**
 * Map any source_type value to a canonical evidence type
 * Unknown types are included in totals as-is but can be categorized as "other" if needed
 */
export function normalizeEvidenceType(sourceType: string | null | undefined): EvidenceType | 'other' {
  if (!sourceType) {
    return 'other'
  }

  const normalized = sourceType.toLowerCase().trim()
  
  // Direct match
  if (EVIDENCE_TYPES.includes(normalized as EvidenceType)) {
    return normalized as EvidenceType
  }

  // Handle variations
  const typeMap: Record<string, EvidenceType> = {
    'official_site': 'marketing_site',
    'website': 'marketing_site',
    'homepage': 'marketing_site',
    'pricing_page': 'pricing',
    'price': 'pricing',
    'documentation': 'docs',
    'doc': 'docs',
    'changelog_page': 'changelog',
    'release_notes': 'changelog',
    'review': 'reviews',
    'review_page': 'reviews',
    'careers': 'jobs',
    'job': 'jobs',
    'status_page': 'status',
    'status_page': 'status',
  }

  return typeMap[normalized] ?? 'other'
}

/**
 * Check if a source type is a known evidence type
 */
export function isKnownEvidenceType(sourceType: string | null | undefined): boolean {
  if (!sourceType) {
    return false
  }
  
  const normalized = normalizeEvidenceType(sourceType)
  return normalized !== 'other'
}

