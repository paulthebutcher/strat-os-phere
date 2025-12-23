import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { tavilySearch } from '@/lib/tavily/client'
import { resolveCompanyCandidatesSafe, isPrimaryResearchPage, type SourcePage } from '@/lib/competitors/resolveCompanyCandidates'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

const CompetitorDiscoveryRequestSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  contextText: z.string().optional(),
})

/**
 * POST /api/try/competitors
 * Discovers competitor company candidates for the try flow (unauthenticated).
 * Returns actual companies (not research pages) with name, URL, logo, and seed URLs.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Check if Tavily is configured
    const tavilyApiKey = process.env.TAVILY_API_KEY
    if (!tavilyApiKey) {
      return NextResponse.json(
        { error: 'Tavily API key is not configured', candidates: [] },
        { status: 503 }
      )
    }

    // Parse and validate request
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body', candidates: [] },
        { status: 400 }
      )
    }

    const validationResult = CompetitorDiscoveryRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(', ')}`,
          candidates: [],
        },
        { status: 400 }
      )
    }

    const { companyName, contextText } = validationResult.data

    // Build competitor search query
    let competitorQuery = `${companyName} alternatives competitors`
    if (contextText) {
      competitorQuery = `${companyName} ${contextText} alternatives competitors`
    }

    // Call Tavily to find competitor pages
    let tavilyResponse
    try {
      tavilyResponse = await tavilySearch({
        query: competitorQuery,
        maxResults: 10,
        searchDepth: 'basic',
      })
    } catch (error) {
      logger.error('[try/competitors] Tavily search failed', {
        error: error instanceof Error ? error.message : String(error),
        query: competitorQuery,
      })
      // Return empty candidates (non-blocking - user can add manually)
      return NextResponse.json({
        candidates: [],
        error: 'Failed to fetch competitor suggestions',
      })
    }

    // Convert Tavily results to SourcePage format
    const sourcePages: SourcePage[] = tavilyResponse.results.map(result => ({
      title: result.title || '',
      url: result.url,
      domain: result.url ? new URL(result.url).hostname.replace(/^www\./, '') : undefined,
      content: result.content,
    }))

    // Resolve company candidates from source pages
    const candidates = resolveCompanyCandidatesSafe(sourcePages, { limit: 20 })

    // Diagnostic logging (dev/prod)
    const blockedExamples = sourcePages.filter(isPrimaryResearchPage).slice(0, 5)
    logger.info('[try/competitors] Resolved candidates', {
      sourcePagesCount: sourcePages.length,
      candidatesCount: candidates.length,
      blockedExamples: blockedExamples.map(p => ({ title: p.title, url: p.url })),
      query: competitorQuery,
    })

    // Runtime safeguard: log if any listicles slipped through
    if (candidates.length > 0) {
      const candidateTitles = candidates.map(c => c.name.toLowerCase())
      const suspiciousTitles = candidateTitles.filter(title => 
        ['alternatives', 'competitors', 'top', 'best', 'vs', 'compare'].some(kw => title.includes(kw))
      )
      if (suspiciousTitles.length > 0) {
        logger.warn('[try/competitors] Suspicious candidate titles detected', {
          suspiciousTitles,
          candidates: candidates.map(c => ({ name: c.name, domain: c.domain })),
        })
      }
    }

    return NextResponse.json({
      candidates,
      query: competitorQuery,
    })
  } catch (error) {
    logger.error('[try/competitors] Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    })
    // Always return candidates array (even if empty) so UI can fall back to manual entry
    return NextResponse.json(
      {
        candidates: [],
        error: error instanceof Error ? error.message : 'Unexpected error occurred',
      },
      { status: 500 }
    )
  }
}

