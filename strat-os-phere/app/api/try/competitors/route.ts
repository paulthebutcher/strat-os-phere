import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { tavilySearch } from '@/lib/tavily/client'
import { resolveCompanyCandidatesSafe } from '@/lib/competitors/resolveCompanyCandidates'
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

    // Resolve company candidates from Tavily results
    const candidates = resolveCompanyCandidatesSafe(tavilyResponse.results, 20)

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

