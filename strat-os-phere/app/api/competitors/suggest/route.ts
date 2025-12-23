import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { tavilySearch } from '@/lib/tavily/client'
import { logger } from '@/lib/logger'
import { normalizeUrl, toDisplayDomain } from '@/lib/url/normalizeUrl'

export const runtime = 'nodejs'

const SuggestCompetitorsRequestSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters'),
  market: z.string().optional(),
})

export type CompetitorResult = {
  name: string
  website: string // canonical root, e.g. https://opsgenie.com
  domain: string // opsgenie.com
}

export type SuggestCompetitorsResponse = {
  ok: boolean
  results: CompetitorResult[]
  error?: string
}

// Blocked domains that should never appear as competitors (listicles/aggregators)
const BLOCKED_DOMAINS = new Set([
  'g2.com',
  'capterra.com',
  'gartner.com',
  'trustradius.com',
  'softwareadvice.com',
  'getapp.com',
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

// Blocked URL path patterns (listicle pages)
const BLOCKED_PATH_PATTERNS = [
  /\/best-/i,
  /\/top-/i,
  /\/alternatives/i,
  /\/compare/i,
  /\/comparison/i,
  /\/list/i,
  /\/rank/i,
  /\/review/i,
]

// Blocked keywords in titles/URLs that indicate listicles
const BLOCKED_KEYWORDS = [
  'alternatives',
  'competitors',
  'top',
  'best',
  'vs',
  'compare',
  'list of',
  'review',
]

/**
 * Check if a domain or URL should be blocked (listicle/aggregator)
 */
function isBlockedDomain(domain: string): boolean {
  const normalized = domain.toLowerCase().replace(/^www\./, '')
  return BLOCKED_DOMAINS.has(normalized)
}

/**
 * Check if a URL path indicates a listicle page
 */
function isBlockedPath(url: string): boolean {
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
function isListicleTitle(title: string): boolean {
  const lower = title.toLowerCase()
  return BLOCKED_KEYWORDS.some((keyword) => lower.includes(keyword))
}

/**
 * Extract company name from domain
 */
function extractCompanyName(domain: string): string {
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
    return `https://${urlObj.hostname}`
  } catch {
    return null
  }
}

/**
 * POST /api/competitors/suggest
 * Searches for competitor companies using Tavily and returns a filtered list.
 * Only returns primary company websites, no listicles/aggregators.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Check if Tavily is configured
    const tavilyApiKey = process.env.TAVILY_API_KEY
    if (!tavilyApiKey) {
      return NextResponse.json({
        ok: false,
        results: [],
        error: 'Tavily API key is not configured',
      })
    }

    // Parse and validate request
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({
        ok: false,
        results: [],
        error: 'Invalid JSON in request body',
      })
    }

    const validationResult = SuggestCompetitorsRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        ok: false,
        results: [],
        error: `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(', ')}`,
      })
    }

    const { query, market } = validationResult.data

    // Build Tavily query
    let tavilyQuery = `${query} competitors`
    if (market) {
      tavilyQuery = `${market} ${query} competitors`
    }

    // Call Tavily
    let tavilyResults: Array<{ title?: string; url: string; content?: string }> = []
    try {
      const searchResult = await tavilySearch({
        query: tavilyQuery,
        maxResults: 15,
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
      // Return empty results (non-blocking - user can add manually)
      return NextResponse.json({
        ok: false,
        results: [],
        error: 'Failed to fetch competitor suggestions',
      })
    }

    if (tavilyResults.length === 0) {
      return NextResponse.json({
        ok: true,
        results: [],
      })
    }

    // Extract company candidates from Tavily results
    const domainMap = new Map<string, { name: string; url: string; title?: string }>()

    for (const result of tavilyResults) {
      try {
        // Skip if URL path indicates listicle
        if (isBlockedPath(result.url)) {
          continue
        }

        // Extract domain
        const domain = toDisplayDomain(result.url)
        const normalizedDomain = domain.toLowerCase().replace(/^www\./, '')

        // Skip if domain is blocked
        if (isBlockedDomain(normalizedDomain)) {
          continue
        }

        // Skip if title looks like a listicle
        if (result.title && isListicleTitle(result.title)) {
          continue
        }

        // Validate domain structure (should be registrable domain)
        const domainParts = normalizedDomain.split('.')
        if (domainParts.length < 2 || domainParts.length > 3) {
          continue
        }

        // Normalize to root domain
        const rootUrl = normalizeToRoot(result.url)
        if (!rootUrl) {
          continue
        }

        // Extract company name from domain or title
        let companyName = extractCompanyName(normalizedDomain)
        if (result.title && !isListicleTitle(result.title)) {
          // Try to extract company name from title (simple heuristic)
          const titleWords = result.title.split(/\s+/)
          if (titleWords.length <= 5) {
            // Short titles are more likely to be company names
            companyName = result.title
          }
        }

        // Deduplicate by domain, keep first occurrence
        if (!domainMap.has(normalizedDomain)) {
          domainMap.set(normalizedDomain, {
            name: companyName,
            url: rootUrl,
            title: result.title,
          })
        }
      } catch {
        // Skip invalid URLs
        continue
      }
    }

    // Convert to results array and limit to 10
    const results: CompetitorResult[] = Array.from(domainMap.values())
      .slice(0, 10)
      .map((item) => ({
        name: item.name,
        website: item.url,
        domain: toDisplayDomain(item.url),
      }))

    return NextResponse.json({
      ok: true,
      results,
    })
  } catch (error) {
    logger.error('[competitors/suggest] Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    })
    // Always return results array (even if empty) so UI can fall back to manual entry
    return NextResponse.json({
      ok: false,
      results: [],
      error: error instanceof Error ? error.message : 'Unexpected error occurred',
    })
  }
}

