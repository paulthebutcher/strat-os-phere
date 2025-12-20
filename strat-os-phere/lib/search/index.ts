import type { SearchProvider } from './provider'
import { createTavilyProvider } from './tavily'
import { createSerpAPIProvider } from './serpapi'

let provider: SearchProvider | null = null

/**
 * Get the configured search provider
 * Prefers Tavily if TAVILY_API_KEY is set, otherwise falls back to SerpAPI
 */
export function getSearchProvider(): SearchProvider {
  if (provider) {
    return provider
  }

  // Prefer Tavily if available
  if (process.env.TAVILY_API_KEY) {
    provider = createTavilyProvider()
    return provider
  }

  // Fall back to SerpAPI
  if (process.env.SERPAPI_API_KEY) {
    provider = createSerpAPIProvider()
    return provider
  }

  throw new Error(
    'No search provider configured. Set either TAVILY_API_KEY or SERPAPI_API_KEY environment variable.'
  )
}

