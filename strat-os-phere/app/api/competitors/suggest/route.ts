import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { tavilySearch } from '@/lib/tavily/client'
import { logger } from '@/lib/logger'
import { normalizeUrl, toDisplayDomain } from '@/lib/url/normalizeUrl'
import {
  isBlockedDomain,
  isBlockedPath,
  isLikelyAggregator,
  isLikelyCompanyDomain,
  normalizeDomain,
} from '@/lib/competitors/domainFilters'

export const runtime = 'nodejs'

const SuggestCompetitorsRequestSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters'),
  context: z
    .object({
      market: z.string().optional(),
    })
    .optional(),
})

export type CompetitorCandidate = {
  name: string
  url: string
  domain: string
  score: number
  reason?: string
}

export type SuggestCompetitorsResponse = {
  ok: boolean
  candidates: CompetitorCandidate[]
  error?: string
}

/**
 * Extract company name from domain or title
 */
function extractCompanyName(domain: string, title?: string): string {
  // Try to extract from title first (if it's not a listicle)
  if (title && !isLikelyAggregator(title)) {
    const titleWords = title.split(/\s+/)
    // Short titles (≤5 words) are more likely to be company names
    if (titleWords.length <= 5 && titleWords.length > 0) {
      // Remove common prefixes
      const cleaned = title
        .replace(/^(top|best|the)\s+/i, '')
        .replace(/\s+(alternatives?|competitors?|vs|comparison).*$/i, '')
        .trim()
      if (cleaned.length > 0 && cleaned.length < 50) {
        return cleaned
      }
    }
  }

  // Fallback to domain extraction
  const parts = domain.split('.')
  if (parts.length >= 2) {
    const companyPart = parts[parts.length - 2]
    return companyPart.charAt(0).toUpperCase() + companyPart.slice(1)
  }
  return domain
}

/**
 * Normalize URL to root domain (https://hostname)
 */
function normalizeToRoot(url: string): string | null {
  try {
    const normalized = normalizeUrl(url)
    if (!normalized.ok) {
      return null
    }
    const urlObj = new URL(normalized.url)
    // Strip tracking params and fragments
    urlObj.search = ''
    urlObj.hash = ''
    // Return root domain only (no path)
    return `https://${urlObj.hostname}`
  } catch {
    return null
  }
}

/**
 * Score a candidate based on quality indicators
 */
function scoreCandidate(
  candidate: {
    url: string
    domain: string
    title?: string
    content?: string
  },
  query: string
): number {
  let score = 0

  try {
    const urlObj = new URL(candidate.url)
    const path = urlObj.pathname.toLowerCase()

    // High score for homepage-like URLs
    if (path === '/' || path === '') {
      score += 10
    } else if (path.split('/').length <= 2) {
      // Short paths are better
      score += 5
    }

    // Penalize deep paths
    if (path.includes('/blog') || path.includes('/docs') || path.includes('/careers')) {
      score -= 5
    }

    // Score based on title match
    if (candidate.title) {
      const titleLower = candidate.title.toLowerCase()
      const queryLower = query.toLowerCase()
      
      // Exact match in title
      if (titleLower.includes(queryLower)) {
        score += 8
      }
      
      // Penalize aggregator keywords
      if (isLikelyAggregator(candidate.title)) {
        score -= 10
      }
    }

    // Score based on content quality
    if (candidate.content && candidate.content.length > 100) {
      score += 2
    }

    // Domain quality check
    if (isLikelyCompanyDomain(candidate.domain, candidate.url)) {
      score += 5
    }
  } catch {
    // If URL parsing fails, keep base score
  }

  return Math.max(0, score)
}

/**
 * POST /api/competitors/suggest
 * Searches for competitor companies using Tavily and returns a filtered list.
 * Only returns primary company websites, no listicles/aggregators.
 * 
 * Input: { query: string, context?: { market?: string } }
 * Output: { candidates: Array<{ name: string; url: string; domain: string; score: number; reason?: string }> }
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Check if Tavily is configured
    const tavilyApiKey = process.env.TAVILY_API_KEY
    if (!tavilyApiKey) {
      return NextResponse.json({
        ok: false,
        candidates: [],
        error: 'Tavily API key is not configured',
      } satisfies SuggestCompetitorsResponse)
    }

    // Parse and validate request
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({
        ok: false,
        candidates: [],
        error: 'Invalid JSON in request body',
      } satisfies SuggestCompetitorsResponse)
    }

    const validationResult = SuggestCompetitorsRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        ok: false,
        candidates: [],
        error: `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(', ')}`,
      } satisfies SuggestCompetitorsResponse)
    }

    const { query, context } = validationResult.data

    // Build Tavily query
    let tavilyQuery = query.trim()
    // Remove common aggregator keywords from query to improve results
    const cleanedQuery = tavilyQuery
      .replace(/\b(alternatives?|competitors?|best|top|vs|compare)\b/gi, '')
      .trim()
    
    if (context?.market) {
      tavilyQuery = `${context.market} ${cleanedQuery}`
    } else {
      tavilyQuery = cleanedQuery
    }

    // Call Tavily
    let tavilyResults: Array<{ title?: string; url: string; content?: string }> = []
    try {
      const searchResult = await tavilySearch({
        query: tavilyQuery,
        maxResults: 20, // Get more results to filter from
        searchDepth: 'basic',
      })
      tavilyResults = searchResult.results.map((r) => ({
        title: r.title || '',
        url: r.url,
        content: r.content,
      }))
    } catch (error) {
      logger.error('[competitors/suggest] Tavily search failed', {
        error: error instanceof Error ? error.message : String(error),
      })
      return NextResponse.json({
        ok: false,
        candidates: [],
        error: 'Couldn\'t fetch suggestions. Try again.',
      } satisfies SuggestCompetitorsResponse)
    }

    if (tavilyResults.length === 0) {
      return NextResponse.json({
        ok: true,
        candidates: [],
      } satisfies SuggestCompetitorsResponse)
    }

    // Extract and score company candidates from Tavily results
    const candidateMap = new Map<string, CompetitorCandidate & { title?: string; content?: string }>()

    for (const result of tavilyResults) {
      try {
        // Skip if URL path indicates listicle
        if (isBlockedPath(result.url)) {
          continue
        }

        // Extract and normalize domain
        const domain = normalizeDomain(result.url)
        const normalizedDomain = domain.toLowerCase().replace(/^www\./, '')

        // Skip if domain is blocked
        if (isBlockedDomain(normalizedDomain)) {
          continue
        }

        // Skip if title looks like an aggregator
        if (result.title && isLikelyAggregator(result.title)) {
          continue
        }

        // Validate domain structure (should be registrable domain)
        const domainParts = normalizedDomain.split('.')
        if (domainParts.length < 2 || domainParts.length > 3) {
          continue
        }

        // Check if domain looks like a company domain
        if (!isLikelyCompanyDomain(normalizedDomain, result.url)) {
          continue
        }

        // Normalize to root domain
        const rootUrl = normalizeToRoot(result.url)
        if (!rootUrl) {
          continue
        }

        // Extract company name
        const companyName = extractCompanyName(normalizedDomain, result.title)

        // Score the candidate
        const score = scoreCandidate(
          {
            url: rootUrl,
            domain: normalizedDomain,
            title: result.title,
            content: result.content,
          },
          query
        )

        // Deduplicate by domain, keep highest scoring
        const existing = candidateMap.get(normalizedDomain)
        if (!existing || score > existing.score) {
          candidateMap.set(normalizedDomain, {
            name: companyName,
            url: rootUrl,
            domain: normalizedDomain,
            score,
            title: result.title,
            content: result.content,
          })
        }
      } catch {
        // Skip invalid URLs
        continue
      }
    }

    // Convert to candidates array, sort by score, and limit to top 12
    const candidates: CompetitorCandidate[] = Array.from(candidateMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((item) => ({
        name: item.name,
        url: item.url,
        domain: item.domain,
        score: item.score,
      }))

    // Fail-safe: if filtering removed too much, return empty with helpful message
    if (candidates.length === 0) {
      return NextResponse.json({
        ok: true,
        candidates: [],
        error: 'No clean company domains found. Try another query or add manually.',
      } satisfies SuggestCompetitorsResponse)
    }

    return NextResponse.json({
      ok: true,
      candidates,
    } satisfies SuggestCompetitorsResponse)
  } catch (error) {
    logger.error('[competitors/suggest] Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({
      ok: false,
      candidates: [],
      error: error instanceof Error ? error.message : 'Unexpected error occurred',
    } satisfies SuggestCompetitorsResponse)
  }
}

