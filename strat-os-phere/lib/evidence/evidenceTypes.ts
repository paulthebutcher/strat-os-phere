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
 * Canonical evidence source type union
 * Represents the normalized output of evidence type normalization
 * Includes 'marketing_site' for backward compatibility with existing codebase
 */
export type EvidenceSourceType =
  | 'pricing'
  | 'docs'
  | 'reviews'
  | 'changelog'
  | 'status'
  | 'jobs'
  | 'marketing_site'
  | 'other'

/**
 * Type map for evidence type normalization
 * Maps input strings to canonical EvidenceSourceType values
 * Uses Record<string, EvidenceSourceType> to catch duplicate keys at compile time
 */
const TYPE_MAP: Record<string, EvidenceSourceType> = {
  // Direct canonical types (for consistency)
  'marketing_site': 'marketing_site',
  'pricing': 'pricing',
  'docs': 'docs',
  'changelog': 'changelog',
  'reviews': 'reviews',
  'jobs': 'jobs',
  'status': 'status',
  
  // Variations mapped to canonical types
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
} as const

// Development-only invariant: ensure no duplicate keys
if (process.env.NODE_ENV !== 'production') {
  const keys = Object.keys(TYPE_MAP)
  const uniqueKeys = new Set(keys)
  if (keys.length !== uniqueKeys.size) {
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index)
    throw new Error(
      `Duplicate keys detected in TYPE_MAP: ${duplicates.join(', ')}. ` +
      'This indicates a coding error that must be fixed.'
    )
  }
}

/**
 * Map any source_type value to a canonical evidence type
 * Unknown types default to 'other'
 */
export function normalizeEvidenceType(sourceType: string | null | undefined): EvidenceSourceType {
  if (!sourceType) {
    return 'other'
  }

  const normalized = sourceType.toLowerCase().trim()
  
  // Direct match in type map (includes both canonical types and variations)
  const mapped = TYPE_MAP[normalized]
  if (mapped) {
    return mapped
  }

  // Fallback to 'other' for unknown types
  return 'other'
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

