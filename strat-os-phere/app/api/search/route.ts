import { NextResponse } from 'next/server'
import { getSearchProvider } from '@/lib/search'

export const runtime = 'nodejs'

/**
 * Search API endpoint
 * POST /api/search
 * Body: { q: string }
 * Returns: { results: SearchResult[] }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const query = body.q as string | undefined

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    const searchProvider = getSearchProvider()
    const results = await searchProvider.search(query.trim(), 10)

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      {
        error: 'Failed to perform search',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

