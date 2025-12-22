import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { toDisplayDomain } from '@/lib/url/normalizeUrl'
import type {
  ResolvedSource,
  SuggestedCompetitor,
  SourceType,
  ConfidenceLevel,
  DiscoveryResponse,
} from '@/lib/onboarding/types'

export const runtime = 'nodejs'

const DiscoverRequestSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  contextText: z.string().optional(),
  evidenceWindowDays: z.number().int().min(30).max(365).default(90),
})

/**
 * POST /api/onboarding/discover
 * Discovers sources and competitors for a company using Tavily search.
 * Accepts company name (not URL) and optional context text.
 */
export async function POST(request: Request): Promise<NextResponse<DiscoveryResponse | { error: string }>> {
  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if Tavily is configured
    const tavilyApiKey = process.env.TAVILY_API_KEY
    if (!tavilyApiKey) {
      return NextResponse.json(
        { error: 'Tavily API key is not configured' },
        { status: 503 }
      )
    }

    // Parse and validate request
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const validationResult = DiscoverRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(', ')}` },
        { status: 400 }
      )
    }

    const { companyName, contextText, evidenceWindowDays } = validationResult.data

    // Query 1: Official + key pages
    const officialQuery = `${companyName} official site pricing documentation changelog`
    const officialResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: officialQuery,
        max_results: 10,
        search_depth: 'basic',
      }),
    })

    if (!officialResponse.ok) {
      const errorText = await officialResponse.text()
      logger.error('[onboarding-discover] Tavily official query failed', {
        status: officialResponse.status,
        error: errorText,
      })
      return NextResponse.json(
        { error: 'Failed to search for official sources' },
        { status: 500 }
      )
    }

    const officialData = await officialResponse.json()
    const officialResults = officialData.results || []

    // Extract official domain from first result
    let officialDomain: string | undefined
    if (officialResults.length > 0 && officialResults[0].url) {
      try {
        const url = new URL(officialResults[0].url)
        officialDomain = url.hostname.replace(/^www\./, '')
      } catch {
        // Ignore URL parse errors
      }
    }

    // Normalize sources from official query
    const resolvedSources: ResolvedSource[] = []
    const seenUrls = new Set<string>()

    // Helper to normalize URL and add to sources
    const addSource = (
      url: string,
      label: string,
      type: SourceType,
      confidence: ConfidenceLevel
    ) => {
      try {
        // Ensure https
        let normalizedUrl = url
        if (!normalizedUrl.startsWith('http')) {
          normalizedUrl = `https://${normalizedUrl}`
        }
        const urlObj = new URL(normalizedUrl)
        
        // Only include https links
        if (urlObj.protocol !== 'https:') {
          return
        }

        const urlKey = urlObj.origin + urlObj.pathname
        if (seenUrls.has(urlKey)) {
          return
        }
        seenUrls.add(urlKey)

        // Prefer same root domain for pricing/docs/careers
        if (officialDomain && type !== 'website') {
          const sourceDomain = urlObj.hostname.replace(/^www\./, '')
          if (sourceDomain !== officialDomain && !sourceDomain.endsWith(`.${officialDomain}`)) {
            // Lower confidence if different domain
            if (confidence === 'high') {
              confidence = 'medium'
            }
          }
        }

        resolvedSources.push({
          label,
          url: normalizedUrl,
          type,
          confidence,
          enabled: true,
        })
      } catch {
        // Skip invalid URLs
      }
    }

    // Find official website (first result)
    if (officialResults.length > 0) {
      const firstResult = officialResults[0]
      if (firstResult.url) {
        addSource(firstResult.url, `${companyName} - Official site`, 'website', 'high')
      }
    }

    // Search for common page types on the official domain
    if (officialDomain) {
      const commonPages: Array<{ path: string; label: string; type: SourceType }> = [
        { path: '/pricing', label: 'Pricing', type: 'pricing' },
        { path: '/plans', label: 'Pricing', type: 'pricing' },
        { path: '/prices', label: 'Pricing', type: 'pricing' },
        { path: '/docs', label: 'Documentation', type: 'docs' },
        { path: '/documentation', label: 'Documentation', type: 'docs' },
        { path: '/help', label: 'Documentation', type: 'docs' },
        { path: '/support', label: 'Documentation', type: 'docs' },
        { path: '/changelog', label: 'Changelog', type: 'changelog' },
        { path: '/releases', label: 'Changelog', type: 'changelog' },
        { path: '/updates', label: 'Changelog', type: 'changelog' },
        { path: '/whats-new', label: 'Changelog', type: 'changelog' },
        { path: '/careers', label: 'Careers', type: 'careers' },
        { path: '/jobs', label: 'Careers', type: 'careers' },
      ]

      for (const page of commonPages) {
        const testUrl = `https://${officialDomain}${page.path}`
        addSource(testUrl, `${companyName} - ${page.label}`, page.type, 'medium')
      }
    }

    // Also check official results for specific page types
    for (const result of officialResults.slice(1, 10)) {
      if (!result.url) continue

      const urlLower = result.url.toLowerCase()
      let type: SourceType = 'other'
      let label = result.title || 'Page'

      if (urlLower.includes('pricing') || urlLower.includes('price') || urlLower.includes('plan')) {
        type = 'pricing'
        label = `${companyName} - Pricing`
      } else if (urlLower.includes('doc') || urlLower.includes('help') || urlLower.includes('support')) {
        type = 'docs'
        label = `${companyName} - Documentation`
      } else if (urlLower.includes('changelog') || urlLower.includes('release') || urlLower.includes('update')) {
        type = 'changelog'
        label = `${companyName} - Changelog`
      } else if (urlLower.includes('career') || urlLower.includes('job')) {
        type = 'careers'
        label = `${companyName} - Careers`
      }

      addSource(result.url, label, type, 'medium')
    }

    // Query 2: Competitors
    let competitorQuery = `${companyName} alternatives competitors`
    if (contextText) {
      competitorQuery = `${companyName} ${contextText} alternatives competitors`
    }

    const competitorResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: competitorQuery,
        max_results: 10,
        search_depth: 'basic',
      }),
    })

    const suggestedCompetitors: SuggestedCompetitor[] = []
    const seenCompetitorDomains = new Set<string>()

    if (competitorResponse.ok) {
      const competitorData = await competitorResponse.json()
      const competitorResults = competitorData.results || []

      for (const result of competitorResults.slice(0, 8)) {
        if (!result.url) continue

        try {
          const urlObj = new URL(result.url.startsWith('http') ? result.url : `https://${result.url}`)
          const domain = urlObj.hostname.replace(/^www\./, '')

          // Skip if same as official domain
          if (officialDomain && domain === officialDomain) {
            continue
          }

          // Skip if already seen
          if (seenCompetitorDomains.has(domain)) {
            continue
          }
          seenCompetitorDomains.add(domain)

          // Extract name from title or domain
          const name = result.title || domain.split('.')[0] || domain

          // Determine confidence based on result quality
          let confidence: ConfidenceLevel = 'medium'
          if (result.content && result.content.length > 100) {
            confidence = 'high'
          } else if (!result.content || result.content.length < 50) {
            confidence = 'low'
          }

          suggestedCompetitors.push({
            name,
            url: urlObj.toString(),
            domain,
            confidence,
            rationale: result.content?.substring(0, 150),
          })
        } catch {
          // Skip invalid URLs
        }
      }
    }

    // Ensure we have at least the official website
    if (resolvedSources.length === 0 && officialResults.length > 0) {
      const firstResult = officialResults[0]
      if (firstResult.url) {
        try {
          let normalizedUrl = firstResult.url
          if (!normalizedUrl.startsWith('http')) {
            normalizedUrl = `https://${normalizedUrl}`
          }
          const urlObj = new URL(normalizedUrl)
          if (urlObj.protocol === 'https:') {
            resolvedSources.push({
              label: `${companyName} - Official site`,
              url: normalizedUrl,
              type: 'website',
              confidence: 'high',
              enabled: true,
            })
          }
        } catch {
          // Ignore
        }
      }
    }

    const response: DiscoveryResponse = {
      resolvedSources: resolvedSources.slice(0, 15), // Limit to 15 sources
      suggestedCompetitors: suggestedCompetitors.slice(0, 8), // Limit to 8 competitors
      debug: officialDomain ? { officialDomain } : undefined,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    logger.error('[onboarding-discover] Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error occurred' },
      { status: 500 }
    )
  }
}

