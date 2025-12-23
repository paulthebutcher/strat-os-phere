import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { tavilySearch } from '@/lib/tavily/client'
import { normalizeTavilyResults } from '@/lib/evidence/normalize'
import { TavilyError } from '@/lib/tavily/client'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

/**
 * Dev-only endpoint for testing Tavily search.
 * GET /api/dev/tavily?q=...
 *
 * Query parameters:
 * - q (required): Search query
 * - maxResults (optional): Maximum number of results (default 8)
 * - searchDepth (optional): "basic" or "advanced" (default "basic")
 *
 * Returns normalized Tavily search results.
 * Disabled in production (returns 404).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Check if dev endpoint is enabled
  const isProduction = process.env.NODE_ENV === 'production'
  const devEndpointEnabled = process.env.TAVILY_DEV_ENDPOINT_ENABLED === 'true'

  if (isProduction && !devEndpointEnabled) {
    // Return 404 in production to avoid surfacing the endpoint
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    // Validate query parameter
    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        {
          error: 'Missing or empty query parameter "q"',
          message: 'Please provide a search query: ?q=...',
        },
        { status: 400 }
      )
    }

    // Parse optional parameters
    const maxResultsParam = searchParams.get('maxResults')
    const maxResults = maxResultsParam ? parseInt(maxResultsParam, 10) : undefined
    if (maxResults !== undefined && (isNaN(maxResults) || maxResults < 1 || maxResults > 20)) {
      return NextResponse.json(
        {
          error: 'Invalid maxResults parameter',
          message: 'maxResults must be a number between 1 and 20',
        },
        { status: 400 }
      )
    }

    const searchDepthParam = searchParams.get('searchDepth')
    const searchDepth =
      searchDepthParam === 'advanced' ? ('advanced' as const) : ('basic' as const)

    // Call Tavily API
    const tavilyResponse = await tavilySearch({
      query: query.trim(),
      maxResults: maxResults ?? 8,
      searchDepth,
      includeAnswer: false,
      includeRawContent: false,
      includeImages: false,
    })

    // Normalize results
    const normalizedResults = normalizeTavilyResults(tavilyResponse)

    // Return response
    return NextResponse.json(
      {
        query: tavilyResponse.query,
        count: normalizedResults.length,
        results: normalizedResults,
        rawCount: tavilyResponse.results.length,
      },
      { status: 200 }
    )
  } catch (error) {
    // Handle TavilyError with safe error payload
    if (error instanceof TavilyError) {
      logger.error('[dev/tavily] Tavily error', {
        code: error.code,
        status: error.status,
        message: error.message,
      })

      return NextResponse.json(
        {
          error: 'Tavily API error',
          code: error.code,
          status: error.status,
          message: error.message,
        },
        { status: error.code === 'MISSING_API_KEY' ? 503 : error.status ?? 500 }
      )
    }

    // Handle unexpected errors
    logger.error('[dev/tavily] Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

