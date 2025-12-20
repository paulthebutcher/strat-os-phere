import type { SearchProvider, SearchResult } from './provider'

/**
 * SerpAPI search provider implementation
 * Uses SerpAPI for web search
 */
export function createSerpAPIProvider(): SearchProvider {
  const apiKey = process.env.SERPAPI_API_KEY

  if (!apiKey) {
    throw new Error('SERPAPI_API_KEY environment variable is not set')
  }

  return {
    async search(query: string, maxResults = 10): Promise<SearchResult[]> {
      try {
        const params = new URLSearchParams({
          q: query,
          api_key: apiKey,
          engine: 'google',
          num: String(Math.min(maxResults, 100)), // SerpAPI allows up to 100
        })

        const response = await fetch(
          `https://serpapi.com/search.json?${params.toString()}`
        )

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`SerpAPI error: ${response.status} ${errorText}`)
        }

        const data = await response.json()

        if (!data.organic_results || !Array.isArray(data.organic_results)) {
          throw new Error('Invalid response format from SerpAPI')
        }

        return data.organic_results
          .slice(0, maxResults)
          .map((result: any) => ({
            title: result.title || '',
            url: result.link || '',
            snippet: result.snippet,
            domain: extractDomain(result.link || ''),
          }))
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Failed to search with SerpAPI')
      }
    },
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

