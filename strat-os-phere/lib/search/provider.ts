/**
 * Search provider interface for web search functionality
 * Implementations can use Tavily, SerpAPI, or other search providers
 */

export interface SearchResult {
  title: string
  url: string
  snippet?: string
  domain?: string
}

export interface SearchProvider {
  /**
   * Search for a query and return results
   */
  search(query: string, maxResults?: number): Promise<SearchResult[]>
}

