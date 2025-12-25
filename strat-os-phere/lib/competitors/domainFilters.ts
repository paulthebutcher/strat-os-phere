/**
 * Domain filtering utilities for competitor suggestions
 * Ensures we only suggest real company domains, not listicles/aggregators
 */

/**
 * Blocked domains that should never appear as competitors (listicles/aggregators)
 */
const BLOCKED_DOMAINS = new Set([
  'g2.com',
  'capterra.com',
  'getapp.com',
  'softwareadvice.com',
  'trustpilot.com',
  'sitejabber.com',
  'wikipedia.org',
  'reddit.com',
  'x.com',
  'twitter.com',
  'linkedin.com',
  'gartner.com',
  'trustradius.com',
  'producthunt.com',
  'alternativeto.net',
  'zapier.com',
  'nerdwallet.com',
  'forbes.com',
  'techradar.com',
  'pcmag.com',
  'crowd.dev',
  'medium.com',
])

/**
 * Blocked URL path patterns (listicle pages)
 */
const BLOCKED_PATH_PATTERNS = [
  /\/best-/i,
  /\/top-/i,
  /\/alternatives/i,
  /\/compare/i,
  /\/comparison/i,
  /\/list/i,
  /\/rank/i,
  /\/review/i,
  /\/vs\//i,
  /\/roundup/i,
]

/**
 * Blocked keywords in titles/URLs that indicate listicles
 */
const BLOCKED_KEYWORDS = [
  'alternatives',
  'competitors',
  'top',
  'best',
  'vs',
  'compare',
  'list of',
  'review',
  'reviews',
  'roundup',
]

/**
 * Check if a domain is in the blocklist
 */
export function isBlockedDomain(domain: string): boolean {
  const normalized = domain.toLowerCase().replace(/^www\./, '')
  return BLOCKED_DOMAINS.has(normalized)
}

/**
 * Check if a URL path indicates a listicle page
 */
export function isBlockedPath(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname.toLowerCase()
    return BLOCKED_PATH_PATTERNS.some((pattern) => pattern.test(path))
  } catch {
    return false
  }
}

/**
 * Check if a title/name looks like a listicle
 */
export function isLikelyAggregator(title: string): boolean {
  const lower = title.toLowerCase()
  return BLOCKED_KEYWORDS.some((keyword) => lower.includes(keyword))
}

/**
 * Check if a domain looks like a company domain (not a blog/aggregator)
 */
export function isLikelyCompanyDomain(domain: string, url?: string): boolean {
  const normalized = domain.toLowerCase().replace(/^www\./, '')
  
  // Block known aggregators
  if (isBlockedDomain(normalized)) {
    return false
  }
  
  // Block blog subdomains
  if (normalized.startsWith('blog.') || normalized.includes('.blog.')) {
    return false
  }
  
  // Block if URL path indicates non-homepage
  if (url) {
    if (isBlockedPath(url)) {
      return false
    }
    
    try {
      const urlObj = new URL(url)
      const path = urlObj.pathname.toLowerCase()
      
      // Reject deep paths that suggest blog/docs/careers pages
      const nonHomepagePaths = ['/blog', '/docs', '/documentation', '/careers', '/news', '/articles']
      if (nonHomepagePaths.some(p => path.startsWith(p))) {
        return false
      }
    } catch {
      // If URL parsing fails, continue with domain check
    }
  }
  
  // Prefer domains with short paths (homepage-like)
  // This is a heuristic: company.com is better than company.com/blog/article
  return true
}

/**
 * Normalize domain for comparison (lowercase, remove www)
 */
export function normalizeDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    // Fallback: try to extract domain manually
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/i)
    if (match && match[1]) {
      return match[1].toLowerCase().replace(/^www\./, '')
    }
    return url.toLowerCase()
  }
}

