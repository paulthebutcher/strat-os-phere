/**
 * Evidence report generation
 * Summarizes evidence bundles for debugging and validation
 */

import type { NormalizedEvidenceBundle, NormalizedEvidenceType } from './types'

export type EvidenceType = NormalizedEvidenceType

export interface EvidenceReport {
  totalSources: number
  countsByType: Record<EvidenceType, number>
  firstPartyCount: number
  thirdPartyCount: number
  unknownPartyCount: number
  recency: {
    mostRecentRetrievedAt: string | null
    oldestRetrievedAt: string | null
    publishedAtCoverage: number // percentage of sources with publishedAt
  }
  topDomains: Array<{ domain: string; count: number }>
  missingTypes: EvidenceType[]
  coverage: number // number of types present / total types
}

const ALL_EVIDENCE_TYPES: EvidenceType[] = [
  'pricing',
  'docs',
  'reviews',
  'jobs',
  'changelog',
  'blog',
  'community',
  'security',
  'other',
]

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/**
 * Check if a domain matches a primary URL (first-party detection)
 */
function isFirstParty(domain: string | null | undefined, primaryUrl: string | null | undefined): boolean {
  if (!domain || !primaryUrl) return false
  
  try {
    const primaryDomain = extractDomain(primaryUrl)
    if (!primaryDomain) return false
    
    // Exact match or subdomain match
    return domain === primaryDomain || domain.endsWith(`.${primaryDomain}`)
  } catch {
    return false
  }
}

/**
 * Safely parse a date string
 */
function safeParseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  try {
    const parsed = new Date(dateStr)
    return isNaN(parsed.getTime()) ? null : parsed
  } catch {
    return null
  }
}

/**
 * Summarize an evidence bundle into a report
 */
export function summarizeEvidenceBundle(bundle: NormalizedEvidenceBundle | null): EvidenceReport {
  if (!bundle || bundle.items.length === 0) {
    return {
      totalSources: 0,
      countsByType: ALL_EVIDENCE_TYPES.reduce((acc, type) => ({ ...acc, [type]: 0 }), {} as Record<EvidenceType, number>),
      firstPartyCount: 0,
      thirdPartyCount: 0,
      unknownPartyCount: 0,
      recency: {
        mostRecentRetrievedAt: null,
        oldestRetrievedAt: null,
        publishedAtCoverage: 0,
      },
      topDomains: [],
      missingTypes: [...ALL_EVIDENCE_TYPES],
      coverage: 0,
    }
  }

  // Count by type
  const countsByType = ALL_EVIDENCE_TYPES.reduce((acc, type) => ({ ...acc, [type]: 0 }), {} as Record<EvidenceType, number>)
  
  // Track first-party vs third-party
  let firstPartyCount = 0
  let thirdPartyCount = 0
  let unknownPartyCount = 0
  
  // Track dates
  const retrievedDates: Date[] = []
  const publishedDates: Date[] = []
  let publishedAtCount = 0
  
  // Track domains
  const domainCounts = new Map<string, number>()

  for (const item of bundle.items) {
    // Count by type
    const type = item.type ?? 'other'
    countsByType[type] = (countsByType[type] ?? 0) + 1
    
    // Track domain
    const domain = item.domain ?? extractDomain(item.url)
    if (domain) {
      domainCounts.set(domain, (domainCounts.get(domain) ?? 0) + 1)
    }
    
    // First-party detection
    if (domain) {
      if (isFirstParty(domain, bundle.primaryUrl ?? undefined)) {
        firstPartyCount++
      } else {
        thirdPartyCount++
      }
    } else {
      unknownPartyCount++
    }
    
    // Track dates
    const retrievedAt = safeParseDate(item.retrievedAt)
    if (retrievedAt) {
      retrievedDates.push(retrievedAt)
    }
    
    const publishedAt = safeParseDate(item.publishedAt)
    if (publishedAt) {
      publishedDates.push(publishedAt)
      publishedAtCount++
    }
  }

  // Compute recency stats
  const mostRecentRetrievedAt = retrievedDates.length > 0
    ? retrievedDates.sort((a, b) => b.getTime() - a.getTime())[0]?.toISOString() ?? null
    : null
  
  const oldestRetrievedAt = retrievedDates.length > 0
    ? retrievedDates.sort((a, b) => a.getTime() - b.getTime())[0]?.toISOString() ?? null
    : null

  const publishedAtCoverage = bundle.items.length > 0
    ? Math.round((publishedAtCount / bundle.items.length) * 100)
    : 0

  // Top domains
  const topDomains = Array.from(domainCounts.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Missing types
  const missingTypes = ALL_EVIDENCE_TYPES.filter((type) => (countsByType[type] ?? 0) === 0)

  // Coverage = number of types present / total types
  const presentTypes = ALL_EVIDENCE_TYPES.filter((type) => (countsByType[type] ?? 0) > 0).length
  const coverage = Math.round((presentTypes / ALL_EVIDENCE_TYPES.length) * 100)

  return {
    totalSources: bundle.items.length,
    countsByType,
    firstPartyCount,
    thirdPartyCount,
    unknownPartyCount,
    recency: {
      mostRecentRetrievedAt,
      oldestRetrievedAt,
      publishedAtCoverage,
    },
    topDomains,
    missingTypes,
    coverage,
  }
}

