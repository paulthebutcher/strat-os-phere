/**
 * Resolves company candidates from research pages (e.g., "Top X Alternatives" pages)
 * 
 * This module filters out research pages and extracts actual competitor companies
 * from search results, with hard fallbacks to ensure users can always add competitors manually.
 */

import type { TavilyRawResult } from '@/lib/tavily/client'
import { toDisplayDomain } from '@/lib/url/normalizeUrl'

export type SourcePage = {
  title: string
  url: string
  domain?: string
  content?: string
}

export type CompanyCandidate = {
  name: string
  primaryUrl: string // https://company.com
  domain: string // company.com
  logoUrl?: string // best-effort
  confidence: 'high' | 'medium' | 'low'
  derivedFrom: SourcePage[] // citations for "why suggested"
  seedUrls: string[] // URLs we will add to state for later scraping
}

// Known research/list domains that should be filtered out
const RESEARCH_DOMAINS = new Set([
  'g2.com',
  'capterra.com',
  'gartner.com',
  'trustradius.com',
  'softwareadvice.com',
  'getapp.com',
  'producthunt.com',
  'alternativeto.net',
  'medium.com',
  'blog',
  'articles',
  'news',
])

// Keywords that indicate a research/list page
const RESEARCH_KEYWORDS = [
  'alternatives',
  'competitors',
  'top',
  'best',
  'vs',
  'compare',
  'comparison',
  'list of',
  'review',
  'reviews',
  'roundup',
  'guide to',
]

/**
 * Checks if a page is likely a research/list page (not a company homepage)
 */
function isResearchPage(page: SourcePage): boolean {
  const titleLower = (page.title || '').toLowerCase()
  const urlLower = page.url.toLowerCase()
  const domain = page.domain || toDisplayDomain(page.url)

  // Check domain
  if (domain && RESEARCH_DOMAINS.has(domain)) {
    return true
  }

  // Check if domain contains research indicators
  if (domain && (domain.includes('blog') || domain.includes('news') || domain.includes('article'))) {
    return true
  }

  // Check title for research keywords
  for (const keyword of RESEARCH_KEYWORDS) {
    if (titleLower.includes(keyword)) {
      return true
    }
  }

  // Check URL path for research indicators
  const urlPath = new URL(page.url).pathname.toLowerCase()
  if (urlPath.includes('/alternatives') || urlPath.includes('/competitors') || urlPath.includes('/compare')) {
    return true
  }

  return false
}

/**
 * Extracts company name from a URL or title
 */
function extractCompanyName(url: string, title?: string): string | null {
  try {
    const domain = toDisplayDomain(url)
    // Remove common TLDs and get the main part
    const parts = domain.split('.')
    if (parts.length >= 2) {
      const mainPart = parts[parts.length - 2] // e.g., "pagerduty" from "pagerduty.com"
      // Capitalize first letter
      return mainPart.charAt(0).toUpperCase() + mainPart.slice(1)
    }
  } catch {
    // Fallback to title if available
    if (title) {
      // Try to extract company name from title (remove common prefixes)
      const cleaned = title
        .replace(/^(top|best|the)\s+/i, '')
        .replace(/\s+(alternatives?|competitors?|vs|comparison).*$/i, '')
        .trim()
      if (cleaned.length > 0 && cleaned.length < 50) {
        return cleaned
      }
    }
  }
  return null
}

/**
 * Determines if a URL looks like a company homepage
 */
function isLikelyHomepage(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname.toLowerCase()
    
    // Homepage indicators
    if (path === '/' || path === '') {
      return true
    }
    
    // Exclude common non-homepage paths
    const excludePaths = ['/blog', '/news', '/articles', '/pricing', '/docs', '/help', '/support']
    if (excludePaths.some(exclude => path.startsWith(exclude))) {
      return false
    }
    
    // If path is short and doesn't look like a blog/article, might be homepage
    if (path.split('/').length <= 2 && !path.includes('blog') && !path.includes('article')) {
      return true
    }
    
    return false
  } catch {
    return false
  }
}

/**
 * Generates logo URL for a domain (best-effort, no API calls)
 */
function generateLogoUrl(domain: string): string {
  // Primary: Clearbit logo API (works as image URL, no server calls needed)
  return `https://logo.clearbit.com/${domain}`
}

/**
 * Generates seed URLs for a company candidate
 */
function generateSeedUrls(primaryUrl: string, domain: string): string[] {
  const seeds: string[] = [primaryUrl]
  
  // Add common vendor-owned pages (deterministic, no scraping)
  const commonPaths = ['/pricing', '/docs', '/documentation', '/security', '/changelog']
  for (const path of commonPaths) {
    seeds.push(`https://${domain}${path}`)
  }
  
  return seeds
}

/**
 * Normalizes domain for deduplication
 */
function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^www\./, '').trim()
}

/**
 * Resolves company candidates from Tavily search results
 * 
 * Strategy:
 * 1. Filter out obvious research pages
 * 2. Extract company mentions from URLs/titles
 * 3. De-dupe and canonicalize
 * 4. Generate seed URLs for each candidate
 */
export function resolveCompanyCandidates(
  tavilyResults: TavilyRawResult[],
  maxCandidates: number = 20
): CompanyCandidate[] {
  const candidates = new Map<string, CompanyCandidate>()
  const sourcePages: SourcePage[] = tavilyResults.map(result => ({
    title: result.title || '',
    url: result.url,
    domain: toDisplayDomain(result.url),
    content: result.content,
  }))

  // Process each result
  for (const page of sourcePages.slice(0, 8)) { // Cap at 8 source pages
    // Skip research pages
    if (isResearchPage(page)) {
      continue
    }

    // Extract company info
    const domain = page.domain || toDisplayDomain(page.url)
    const normalizedDomain = normalizeDomain(domain)
    const companyName = extractCompanyName(page.url, page.title) || normalizedDomain.split('.')[0] || domain

    // Skip if we already have this domain
    if (candidates.has(normalizedDomain)) {
      const existing = candidates.get(normalizedDomain)!
      // Add this page as a source
      existing.derivedFrom.push(page)
      // Increase confidence if we have multiple sources
      if (existing.confidence === 'low' && existing.derivedFrom.length > 1) {
        existing.confidence = 'medium'
      } else if (existing.confidence === 'medium' && existing.derivedFrom.length > 2) {
        existing.confidence = 'high'
      }
      continue
    }

    // Determine confidence
    let confidence: 'high' | 'medium' | 'low' = 'low'
    if (isLikelyHomepage(page.url)) {
      confidence = 'high'
    } else if (page.content && page.content.length > 100) {
      confidence = 'medium'
    }

    // Create candidate
    const primaryUrl = page.url.startsWith('http') ? page.url : `https://${page.url}`
    const candidate: CompanyCandidate = {
      name: companyName,
      primaryUrl,
      domain: normalizedDomain,
      logoUrl: generateLogoUrl(normalizedDomain),
      confidence,
      derivedFrom: [page],
      seedUrls: generateSeedUrls(primaryUrl, normalizedDomain),
    }

    candidates.set(normalizedDomain, candidate)
  }

  // Return sorted by confidence (high -> medium -> low), then by name
  const sorted = Array.from(candidates.values())
    .sort((a, b) => {
      const confidenceOrder = { high: 3, medium: 2, low: 1 }
      const confDiff = confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
      if (confDiff !== 0) return confDiff
      return a.name.localeCompare(b.name)
    })
    .slice(0, maxCandidates)

  return sorted
}

/**
 * Fallback: if no candidates found, return empty array
 * (UI will show manual entry option)
 */
export function resolveCompanyCandidatesSafe(
  tavilyResults: TavilyRawResult[],
  maxCandidates: number = 20
): CompanyCandidate[] {
  try {
    return resolveCompanyCandidates(tavilyResults, maxCandidates)
  } catch (error) {
    console.error('[resolveCompanyCandidates] Error resolving candidates:', error)
    return []
  }
}

