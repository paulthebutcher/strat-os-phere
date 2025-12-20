import type { SearchProvider, SearchResult } from './provider'

/**
 * Tavily search provider implementation
 * Uses Tavily API for web search
 */
export function createTavilyProvider(): SearchProvider {
  const apiKey = process.env.TAVILY_API_KEY

  if (!apiKey) {
    throw new Error('TAVILY_API_KEY environment variable is not set')
  }

  return {
    async search(query: string, maxResults = 10): Promise<SearchResult[]> {
      try {
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: apiKey,
            query,
            max_results: maxResults,
            search_depth: 'basic',
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Tavily API error: ${response.status} ${errorText}`)
        }

        const data = await response.json()

        if (!data.results || !Array.isArray(data.results)) {
          throw new Error('Invalid response format from Tavily API')
        }

        return data.results.map((result: any) => ({
          title: result.title || '',
          url: result.url || '',
          snippet: result.content || result.snippet,
          domain: extractDomain(result.url || ''),
        }))
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Failed to search with Tavily')
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

