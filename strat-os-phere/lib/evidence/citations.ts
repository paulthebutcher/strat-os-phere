/**
 * Citation helpers for Opportunities V3
 * Formats evidence bundles for LLM prompts and normalizes citation inputs
 */

import type {
  NormalizedEvidenceBundle,
  NormalizedEvidenceType,
} from './types'

/**
 * Maps NormalizedEvidenceType to CitationSchema source_type
 */
export function mapEvidenceTypeToSourceType(
  evidenceType: NormalizedEvidenceType
): 'marketing_site' | 'changelog' | 'pricing' | 'reviews' | 'jobs' | 'docs' | 'status' {
  const mapping: Record<NormalizedEvidenceType, 'marketing_site' | 'changelog' | 'pricing' | 'reviews' | 'jobs' | 'docs' | 'status'> = {
    pricing: 'pricing',
    reviews: 'reviews',
    jobs: 'jobs',
    changelog: 'changelog',
    docs: 'docs',
    blog: 'marketing_site',
    community: 'marketing_site',
    security: 'docs',
    other: 'marketing_site',
  }
  return mapping[evidenceType] ?? 'marketing_site'
}

/**
 * Evidence item structure for prompt formatting
 */
export type EvidenceItem = {
  url: string
  title?: string
  excerpt?: string
  retrievedAt?: string
  publishedAt?: string
  sourceKind?: 'first_party' | 'third_party' | 'unknown'
  domain?: string
  evidenceType?: NormalizedEvidenceType
}

/**
 * Options for formatting evidence bundle
 */
export interface FormatEvidenceBundleOptions {
  maxItemsPerType?: number
  maxExcerptChars?: number
  primaryDomain?: string // For determining first_party vs third_party
}

/**
 * Result of formatting evidence bundle for prompt
 */
export interface FormattedEvidenceBundle {
  byType: Record<NormalizedEvidenceType, EvidenceItem[]>
  promptBlock: string
  stats: {
    totalItems: number
    byTypeCounts: Record<string, number>
    firstPartyCount: number
  }
  allowedUrls: Set<string> // URLs that can be cited
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | undefined {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return undefined
  }
}

/**
 * Determine if a domain is first-party
 */
function isFirstParty(domain: string | undefined, primaryDomain: string | undefined): boolean {
  if (!domain || !primaryDomain) return false
  // Normalize domains (remove www, compare)
  const normalize = (d: string) => d.replace(/^www\./, '').toLowerCase()
  return normalize(domain) === normalize(primaryDomain)
}

/**
 * Format evidence bundle for prompt inclusion
 */
export function formatEvidenceBundleForPrompt(
  bundle: NormalizedEvidenceBundle,
  opts: FormatEvidenceBundleOptions = {}
): FormattedEvidenceBundle {
  const {
    maxItemsPerType = 8,
    maxExcerptChars = 800,
    primaryDomain,
  } = opts

  // Group items by type
  const byType: Record<NormalizedEvidenceType, EvidenceItem[]> = {
    pricing: [],
    docs: [],
    reviews: [],
    jobs: [],
    changelog: [],
    blog: [],
    community: [],
    security: [],
    other: [],
  }

  // Extract primary domain from bundle if not provided
  const bundlePrimaryDomain = primaryDomain || extractDomain(bundle.primaryUrl || '')

  let firstPartyCount = 0
  const allowedUrls = new Set<string>()

  // Process each item
  for (const item of bundle.items) {
    const itemDomain = item.domain || extractDomain(item.url)
    const sourceKind = isFirstParty(itemDomain, bundlePrimaryDomain)
      ? 'first_party'
      : itemDomain
      ? 'third_party'
      : 'unknown'

    if (sourceKind === 'first_party') {
      firstPartyCount++
    }

    const evidenceItem: EvidenceItem = {
      url: item.url,
      title: item.title,
      excerpt: item.snippet
        ? item.snippet.substring(0, maxExcerptChars)
        : undefined,
      retrievedAt: item.retrievedAt || undefined,
      publishedAt: item.publishedAt || undefined,
      sourceKind,
      domain: itemDomain,
      evidenceType: item.type,
    }

    // Limit items per type
    if (byType[item.type].length < maxItemsPerType) {
      byType[item.type].push(evidenceItem)
      allowedUrls.add(item.url)
    }
  }

  // Build prompt block
  const sections: string[] = []
  const typeLabels: Record<NormalizedEvidenceType, string> = {
    pricing: 'PRICING',
    reviews: 'REVIEWS',
    docs: 'DOCS',
    changelog: 'CHANGELOG',
    jobs: 'JOBS',
    blog: 'BLOG',
    community: 'COMMUNITY',
    security: 'SECURITY',
    other: 'OTHER',
  }

  for (const [type, items] of Object.entries(byType) as [NormalizedEvidenceType, EvidenceItem[]][]) {
    if (items.length > 0) {
      sections.push(`## Evidence: ${typeLabels[type]}`)
      for (const item of items) {
        sections.push(`- URL: ${item.url}`)
        if (item.title) {
          sections.push(`  Title: ${item.title}`)
        }
        if (item.excerpt) {
          sections.push(`  Excerpt: ${item.excerpt}`)
        }
        if (item.publishedAt) {
          sections.push(`  Published: ${item.publishedAt}`)
        }
        if (item.retrievedAt) {
          sections.push(`  Retrieved: ${item.retrievedAt}`)
        }
        if (item.domain) {
          sections.push(`  Domain: ${item.domain}`)
        }
        if (item.sourceKind) {
          sections.push(`  Source: ${item.sourceKind}`)
        }
        sections.push('')
      }
    }
  }

  const promptBlock = sections.length > 0
    ? sections.join('\n')
    : 'No evidence available.'

  // Compute stats
  const byTypeCounts: Record<string, number> = {}
  let totalItems = 0
  for (const [type, items] of Object.entries(byType)) {
    byTypeCounts[type] = items.length
    totalItems += items.length
  }

  return {
    byType,
    promptBlock,
    stats: {
      totalItems,
      byTypeCounts,
      firstPartyCount,
    },
    allowedUrls,
  }
}

/**
 * Citation type matching the Zod schema
 */
export type Citation = {
  url: string
  title?: string | null
  source_type: 'marketing_site' | 'changelog' | 'pricing' | 'reviews' | 'jobs' | 'docs' | 'status'
  extracted_at?: string | null
  source_date_range?: string | null
  confidence?: 'low' | 'medium' | 'high' | number | null
  domain?: string | null
  published_at?: string | null
  source_kind?: 'first_party' | 'third_party' | 'unknown' | null
  retrievedAt?: string | null
  publishedAt?: string | null
  evidenceType?: string | null
}

/**
 * Normalize citations from various formats (backward compatibility)
 * Accepts: string[], { url: string }[], or full Citation objects
 */
export function normalizeCitations(raw: unknown): Citation[] {
  if (!raw) return []
  if (!Array.isArray(raw)) return []

  const normalized: Citation[] = []
  const seenUrls = new Set<string>()

  for (const item of raw) {
    // Handle string URLs
    if (typeof item === 'string') {
      try {
        const url = new URL(item).href
        if (!seenUrls.has(url)) {
          seenUrls.add(url)
          normalized.push({
            url,
            source_type: 'marketing_site', // Default
          })
        }
      } catch {
        // Invalid URL, skip
      }
      continue
    }

    // Handle objects
    if (typeof item !== 'object' || item === null) continue

    const obj = item as Record<string, unknown>

    // Must have url
    if (!obj.url || typeof obj.url !== 'string') continue

    try {
      const url = new URL(obj.url).href

      // Deduplicate by URL
      if (seenUrls.has(url)) continue
      seenUrls.add(url)

      // Normalize the citation object
      const citation: Citation = {
        url,
        source_type: (obj.source_type as Citation['source_type']) || 'marketing_site',
      }

      // Optional fields
      if (obj.title != null) citation.title = String(obj.title) || null
      if (obj.extracted_at != null) citation.extracted_at = String(obj.extracted_at) || null
      if (obj.retrievedAt != null) citation.retrievedAt = String(obj.retrievedAt) || null
      if (obj.source_date_range != null) citation.source_date_range = String(obj.source_date_range) || null
      if (obj.confidence != null) {
        if (typeof obj.confidence === 'number' || obj.confidence === 'low' || obj.confidence === 'medium' || obj.confidence === 'high') {
          citation.confidence = obj.confidence
        }
      }
      if (obj.domain != null) citation.domain = String(obj.domain) || null
      if (obj.published_at != null) citation.published_at = String(obj.published_at) || null
      if (obj.publishedAt != null) citation.publishedAt = String(obj.publishedAt) || null
      if (obj.source_kind === 'first_party' || obj.source_kind === 'third_party' || obj.source_kind === 'unknown') {
        citation.source_kind = obj.source_kind
      }
      if (obj.evidenceType != null) citation.evidenceType = String(obj.evidenceType) || null

      normalized.push(citation)
    } catch {
      // Invalid URL, skip
    }
  }

  return normalized
}

/**
 * Filter citations to only include URLs from the allowed set
 */
export function filterCitationsByAllowedUrls(
  citations: Citation[],
  allowedUrls: Set<string>
): Citation[] {
  return citations.filter((citation) => allowedUrls.has(citation.url))
}

