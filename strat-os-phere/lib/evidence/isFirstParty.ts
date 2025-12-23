/**
 * First-party detection for evidence items
 * Determines if an evidence item is first-party (from the company/competitor itself)
 * vs third-party (from external sources)
 */

import { toDisplayDomain } from '@/lib/url/normalizeUrl'
import type { NormalizedEvidenceItem } from './types'

/**
 * Extracts canonical domain from a URL
 * Removes protocol, www, and path to get just the domain
 */
function extractCanonicalDomain(url: string): string | null {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    // Fallback: try manual extraction
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/i)
    if (match && match[1]) {
      return match[1].replace(/^www\./, '').toLowerCase()
    }
    return null
  }
}

/**
 * Checks if an evidence item is first-party
 * 
 * A source is considered first-party if:
 * 1. Its domain matches any of the provided competitor/company domains
 * 2. OR if the item has a source_kind field explicitly set to 'first_party'
 * 
 * @param item - Evidence item to check
 * @param competitorDomains - Array of competitor/company domains to match against
 * @returns true if the item is first-party
 */
export function isFirstParty(
  item: NormalizedEvidenceItem,
  competitorDomains: string[] = []
): boolean {
  // If source_kind is explicitly set, use that
  // Note: NormalizedEvidenceItem doesn't have source_kind, but we check for it
  // in case it's added in the future or comes from a different source
  const sourceKind = (item as any).source_kind
  if (sourceKind === 'first_party') {
    return true
  }
  if (sourceKind === 'third_party') {
    return false
  }

  // Extract domain from item URL
  const itemDomain = item.domain 
    ? item.domain.toLowerCase().replace(/^www\./, '')
    : item.url 
    ? extractCanonicalDomain(item.url)
    : null

  if (!itemDomain) {
    return false
  }

  // Normalize competitor domains
  const normalizedCompetitorDomains = competitorDomains
    .map(d => {
      try {
        return extractCanonicalDomain(d) || d.toLowerCase().replace(/^www\./, '')
      } catch {
        return d.toLowerCase().replace(/^www\./, '')
      }
    })
    .filter((d): d is string => d !== null)

  // Check if item domain matches any competitor domain
  return normalizedCompetitorDomains.some(compDomain => {
    // Exact match
    if (itemDomain === compDomain) {
      return true
    }
    // Subdomain match: item is subdomain of competitor (e.g., docs.company.com matches company.com)
    if (itemDomain.endsWith(`.${compDomain}`)) {
      return true
    }
    // Competitor is subdomain of item (e.g., company.com matches www.company.com)
    if (compDomain.endsWith(`.${itemDomain}`)) {
      return true
    }
    return false
  })
}

/**
 * Extracts competitor domains from an evidence bundle
 * Uses primaryUrl and company name if available
 */
export function extractCompetitorDomains(
  primaryUrl?: string | null,
  companyName?: string | null
): string[] {
  const domains: string[] = []

  if (primaryUrl) {
    const domain = extractCanonicalDomain(primaryUrl)
    if (domain) {
      domains.push(domain)
    }
  }

  // If we have a company name but no URL, we can't reliably extract a domain
  // So we skip it - first-party detection will only work with explicit URLs

  return domains
}

