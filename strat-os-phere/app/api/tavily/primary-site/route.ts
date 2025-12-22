import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { normalizeUrl, toDisplayDomain } from '@/lib/url/normalizeUrl'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

const TavilyPrimarySiteRequestSchema = z.object({
  primaryUrl: z.string().min(1),
})

type SuggestedSourceType =
  | 'pricing'
  | 'docs'
  | 'changelog'
  | 'jobs'
  | 'status'
  | 'integrations'
  | 'reviews'
  | 'blog'
  | 'other'

interface SuggestedSource {
  label: string
  url: string
  type: SuggestedSourceType
}

interface SuggestedCompetitor {
  name: string
  url: string
  rationale: string
}

type TavilySuccessResponse = {
  ok: true
  normalizedUrl: string
  site: {
    title?: string
    description?: string
    faviconUrl?: string
    domain: string
  }
  summary: {
    oneLiner: string
    bullets: string[]
    confidence: 'high' | 'medium' | 'low'
  }
  suggestedSources: SuggestedSource[]
  suggestedCompetitors: SuggestedCompetitor[]
  suggestedKeywords: string[]
}

type TavilyErrorResponse = {
  ok: false
  error: 'TAVILY_NOT_CONFIGURED' | 'INVALID_URL' | 'TAVILY_ERROR' | 'UNAUTHORIZED' | 'INTERNAL_ERROR'
  message: string
}

type TavilyResponse = TavilySuccessResponse | TavilyErrorResponse

/**
 * POST /api/tavily/primary-site
 * Analyzes a primary competitor URL using Tavily to discover site info,
 * suggested sources to scrape, and recommended competitors.
 */
export async function POST(request: Request): Promise<NextResponse<TavilyResponse>> {
  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: 'UNAUTHORIZED',
          message: 'Not authenticated',
        },
        { status: 401 }
      )
    }

    // Check if Tavily is configured
    const tavilyApiKey = process.env.TAVILY_API_KEY
    if (!tavilyApiKey) {
      return NextResponse.json(
        {
          ok: false,
          error: 'TAVILY_NOT_CONFIGURED',
          message: 'Tavily API key is not configured',
        },
        { status: 503 }
      )
    }

    // Parse and validate request
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: 'INVALID_URL',
          message: 'Invalid JSON in request body',
        },
        { status: 400 }
      )
    }

    const validationResult = TavilyPrimarySiteRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'INVALID_URL',
          message: `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(', ')}`,
        },
        { status: 400 }
      )
    }

    const { primaryUrl: rawUrl } = validationResult.data

    // Normalize URL
    const normalized = normalizeUrl(rawUrl)
    if (!normalized.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: 'INVALID_URL',
          message: normalized.reason,
        },
        { status: 400 }
      )
    }

    const normalizedUrl = normalized.url
    const domain = toDisplayDomain(normalizedUrl)

    // Call Tavily API to get site information
    // Using Tavily's search API to find information about the site
    try {
      const searchResponse = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query: `What is ${domain}? Company information, product description`,
          max_results: 5,
          search_depth: 'basic',
          include_domains: [domain],
        }),
      })

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text()
        logger.error('[tavily-primary-site] Tavily API error', {
          status: searchResponse.status,
          error: errorText,
        })
        return NextResponse.json(
          {
            ok: false,
            error: 'TAVILY_ERROR',
            message: `Tavily API error: ${searchResponse.status}`,
          },
          { status: 500 }
        )
      }

      const searchData = await searchResponse.json()

      // Extract site information from search results
      const firstResult = searchData.results?.[0]
      const siteTitle = firstResult?.title || domain
      const siteDescription = firstResult?.content || firstResult?.snippet || ''
      const faviconUrl = firstResult?.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

      // Generate one-liner and bullets from description
      const oneLiner = siteDescription.split('.')[0] || `${siteTitle} is a product/service.`
      const bullets: string[] = []
      if (siteDescription.length > oneLiner.length) {
        const sentences = siteDescription
          .split('.')
          .slice(1, 4)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 20)
        bullets.push(...sentences)
      }

      // Search for common page types
      const commonPages = [
        { type: 'pricing' as SuggestedSourceType, paths: ['/pricing', '/plans', '/prices'] },
        { type: 'docs' as SuggestedSourceType, paths: ['/docs', '/documentation', '/help', '/support'] },
        { type: 'changelog' as SuggestedSourceType, paths: ['/changelog', '/releases', '/updates', '/whats-new'] },
        { type: 'jobs' as SuggestedSourceType, paths: ['/careers', '/jobs', '/join-us', '/we-are-hiring'] },
        { type: 'status' as SuggestedSourceType, paths: ['/status', '/uptime', '/health'] },
        { type: 'integrations' as SuggestedSourceType, paths: ['/integrations', '/marketplace', '/apps', '/plugins'] },
        { type: 'blog' as SuggestedSourceType, paths: ['/blog', '/news', '/articles'] },
      ]

      const suggestedSources: SuggestedSource[] = []
      for (const pageType of commonPages) {
        for (const path of pageType.paths) {
          const testUrl = `${normalizedUrl.replace(/\/$/, '')}${path}`
          suggestedSources.push({
            label: `${pageType.type.charAt(0).toUpperCase() + pageType.type.slice(1)} page`,
            url: testUrl,
            type: pageType.type,
          })
          // Only add first match per type
          break
        }
      }

      // Search for competitors
      const competitorQuery = `${domain} competitors alternatives similar products`
      const competitorResponse = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query: competitorQuery,
          max_results: 5,
          search_depth: 'basic',
        }),
      })

      const suggestedCompetitors: SuggestedCompetitor[] = []
      if (competitorResponse.ok) {
        const competitorData = await competitorResponse.json()
        if (competitorData.results && Array.isArray(competitorData.results)) {
          for (const result of competitorData.results.slice(0, 5)) {
            if (result.url && !result.url.includes(domain)) {
              const competitorDomain = toDisplayDomain(result.url)
              if (competitorDomain && competitorDomain !== domain) {
                suggestedCompetitors.push({
                  name: result.title || competitorDomain,
                  url: result.url,
                  rationale: result.content?.substring(0, 100) || 'Similar product in the same market',
                })
              }
            }
          }
        }
      }

      // Generate suggested keywords
      const suggestedKeywords: string[] = []
      if (siteDescription) {
        // Extract key terms (simple heuristic)
        const words = siteDescription
          .toLowerCase()
          .split(/\s+/)
          .filter((w: string) => w.length > 4 && !['that', 'this', 'with', 'from', 'their', 'there'].includes(w))
          .slice(0, 5)
        suggestedKeywords.push(...words)
      }

      const response: TavilySuccessResponse = {
        ok: true,
        normalizedUrl,
        site: {
          title: siteTitle,
          description: siteDescription,
          faviconUrl,
          domain,
        },
        summary: {
          oneLiner,
          bullets: bullets.slice(0, 3),
          confidence: firstResult ? 'high' : 'medium',
        },
        suggestedSources: suggestedSources.slice(0, 7), // Limit to 7 sources
        suggestedCompetitors: suggestedCompetitors.slice(0, 5), // Limit to 5 competitors
        suggestedKeywords: suggestedKeywords.slice(0, 5),
      }

      return NextResponse.json(response, { status: 200 })
    } catch (tavilyError) {
      logger.error('[tavily-primary-site] Tavily call failed', {
        error: tavilyError instanceof Error ? tavilyError.message : String(tavilyError),
      })
      return NextResponse.json(
        {
          ok: false,
          error: 'TAVILY_ERROR',
          message: tavilyError instanceof Error ? tavilyError.message : 'Failed to call Tavily API',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    logger.error('[tavily-primary-site] Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      {
        ok: false,
        error: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unexpected error occurred',
      },
      { status: 500 }
    )
  }
}

