import "server-only";
import { MAX_PAGES_PER_COMPETITOR } from '@/lib/constants'
import type { EvidenceSourceType } from '@/lib/supabase/types'

/**
 * Build a list of target URLs to scrape for a competitor
 * Generates common page paths based on the domain
 */

export interface TargetUrl {
  url: string
  label: string // e.g., "Homepage", "Pricing", "Features"
  expectedSourceType?: EvidenceSourceType // Hint for source type detection
}

/**
 * Build target URLs for a given domain
 * Returns up to MAX_PAGES_PER_COMPETITOR URLs with diverse source types
 */
export function buildTargetUrls(domainOrUrl: string): TargetUrl[] {
  // Normalize to domain
  let domain = domainOrUrl.trim()
  
  // If it's already a full URL, extract domain
  try {
    const url = new URL(domain.startsWith('http') ? domain : `https://${domain}`)
    domain = url.hostname.replace(/^www\./, '')
  } catch {
    // If URL parsing fails, assume it's already a domain
    domain = domain.replace(/^www\./, '').replace(/^https?:\/\//, '').split('/')[0]
  }

  const baseUrl = `https://${domain}`
  
  // Prioritize high-signal sources: pricing, changelog, docs
  // Then fall back to marketing pages
  const targets: TargetUrl[] = [
    { url: baseUrl, label: 'Homepage', expectedSourceType: 'marketing_site' },
    { url: `${baseUrl}/pricing`, label: 'Pricing', expectedSourceType: 'pricing' },
    { url: `${baseUrl}/changelog`, label: 'Changelog', expectedSourceType: 'changelog' },
    { url: `${baseUrl}/releases`, label: 'Releases', expectedSourceType: 'changelog' },
    { url: `${baseUrl}/updates`, label: 'Updates', expectedSourceType: 'changelog' },
    { url: `${baseUrl}/docs`, label: 'Documentation', expectedSourceType: 'docs' },
    { url: `${baseUrl}/documentation`, label: 'Documentation', expectedSourceType: 'docs' },
    { url: `${baseUrl}/careers`, label: 'Careers', expectedSourceType: 'jobs' },
    { url: `${baseUrl}/jobs`, label: 'Jobs', expectedSourceType: 'jobs' },
    { url: `${baseUrl}/features`, label: 'Features', expectedSourceType: 'marketing_site' },
    { url: `${baseUrl}/product`, label: 'Product', expectedSourceType: 'marketing_site' },
  ]

  // Return up to MAX_PAGES_PER_COMPETITOR, prioritizing high-signal sources
  return targets.slice(0, MAX_PAGES_PER_COMPETITOR)
}

