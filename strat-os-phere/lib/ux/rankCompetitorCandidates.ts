/**
 * Client-side ranking heuristics for competitor candidates
 * Sorts candidates by confidence score (higher = better match)
 */

export interface CompetitorCandidate {
  name: string
  website: string // canonical root, e.g. https://opsgenie.com
  domain: string // opsgenie.com
}

export interface RankedCandidate extends CompetitorCandidate {
  score: number
  reasons: string[]
}

// Common TLDs that get a small bonus
const COMMON_TLDS = new Set(['com', 'io', 'co', 'app', 'ai', 'dev'])

// Keywords that indicate listicles/aggregators (penalty)
const LISTICLE_KEYWORDS = ['compare', 'best', 'top', 'review', 'alternatives', 'vs', 'versus']

// Check if domain is a subdomain (e.g., blog.example.com)
function isSubdomain(domain: string): boolean {
  const parts = domain.split('.')
  // Root domain would have 2-3 parts (e.g., example.com or example.co.uk)
  // Subdomain would have 3+ parts where first part is not www
  return parts.length > 2 && parts[0] !== 'www'
}

// Extract domain tokens (for name matching)
function getDomainTokens(domain: string): Set<string> {
  const parts = domain.replace(/^www\./, '').split('.')
  const tokens = new Set<string>()
  
  // Add main domain part (e.g., "pagerduty" from "pagerduty.com")
  if (parts.length >= 2) {
    tokens.add(parts[parts.length - 2].toLowerCase())
  }
  
  return tokens
}

// Extract name tokens (for domain matching)
function getNameTokens(name: string): Set<string> {
  // Split on common separators and non-alphabetic characters
  const tokens = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  
  return new Set(tokens)
}

// Check if name matches domain (e.g., "PagerDuty" ~ "pagerduty.com")
function nameMatchesDomain(name: string, domain: string): boolean {
  const nameTokens = getNameTokens(name)
  const domainTokens = getDomainTokens(domain)
  
  // Check if any name token is contained in domain tokens
  for (const nameToken of nameTokens) {
    for (const domainToken of domainTokens) {
      if (domainToken.includes(nameToken) || nameToken.includes(domainToken)) {
        return true
      }
    }
  }
  
  return false
}

// Check if website is exactly the root domain (https://domain.com with no path)
function isRootDomainUrl(website: string, domain: string): boolean {
  try {
    const url = new URL(website)
    // Check that path is empty or just "/"
    const path = url.pathname.trim()
    if (path !== '' && path !== '/') {
      return false
    }
    // Check that hostname matches domain (normalize www)
    const hostname = url.hostname.replace(/^www\./, '').toLowerCase()
    const normalizedDomain = domain.replace(/^www\./, '').toLowerCase()
    return hostname === normalizedDomain
  } catch {
    return false
  }
}

// Check if domain contains listicle keywords
function containsListicleKeywords(domain: string): boolean {
  const lower = domain.toLowerCase()
  return LISTICLE_KEYWORDS.some((keyword) => lower.includes(keyword))
}

// Calculate confidence score for a candidate
function calculateScore(candidate: CompetitorCandidate): { score: number; reasons: string[] } {
  let score = 50 // Base score
  const reasons: string[] = []
  
  const { name, website, domain } = candidate
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '')
  
  // Bonus: website is root domain (no path)
  if (isRootDomainUrl(website, domain)) {
    score += 20
    reasons.push('root domain URL')
  }
  
  // Bonus: not a subdomain
  if (!isSubdomain(normalizedDomain)) {
    score += 15
    reasons.push('primary domain')
  } else {
    score -= 10
    reasons.push('subdomain (penalty)')
  }
  
  // Bonus: name matches domain
  if (nameMatchesDomain(name, normalizedDomain)) {
    score += 25
    reasons.push('name matches domain')
  }
  
  // Small bonus: common TLD
  const tld = normalizedDomain.split('.').pop() || ''
  if (COMMON_TLDS.has(tld)) {
    score += 5
    reasons.push(`common TLD (.${tld})`)
  }
  
  // Penalty: unusually long domain
  if (normalizedDomain.length > 30) {
    score -= 15
    reasons.push('long domain (penalty)')
  }
  
  // Penalty: contains listicle keywords (defensive)
  if (containsListicleKeywords(normalizedDomain)) {
    score -= 30
    reasons.push('listicle keyword (penalty)')
  }
  
  return { score, reasons }
}

/**
 * Rank competitor candidates by confidence score.
 * Deduplicates by normalized domain (keeps highest score).
 * Returns sorted array with highest scores first.
 */
export function rankCompetitorCandidates(
  candidates: CompetitorCandidate[]
): RankedCandidate[] {
  // Deduplicate by domain, keeping highest score
  const domainMap = new Map<string, RankedCandidate>()
  
  for (const candidate of candidates) {
    const normalizedDomain = candidate.domain.toLowerCase().replace(/^www\./, '')
    const { score, reasons } = calculateScore(candidate)
    
    const ranked: RankedCandidate = {
      ...candidate,
      score,
      reasons,
    }
    
    const existing = domainMap.get(normalizedDomain)
    if (!existing || score > existing.score) {
      domainMap.set(normalizedDomain, ranked)
    }
  }
  
  // Sort by score descending
  return Array.from(domainMap.values()).sort((a, b) => b.score - a.score)
}

