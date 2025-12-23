import type { TavilyResponse, TavilyRawResult } from '@/lib/tavily/client'

/**
 * Normalized evidence result with canonical URLs, domain extraction, and trimmed excerpts.
 */

export type NormalizedEvidenceResult = {
  title: string
  url: string
  canonicalUrl: string
  domain: string
  excerpt: string
  score?: number
  publishedDate?: string
}

/**
 * Canonicalizes a URL by:
 * - Lower-casing hostname
 * - Removing www. prefix
 * - Stripping trailing slash
 * - Removing common tracking parameters (utm_*, gclid, fbclid, mc_cid, mc_eid, etc.)
 * - Preserving meaningful query parameters
 *
 * @param input - URL string to canonicalize
 * @returns Canonicalized URL, or original input if parsing fails
 */
export function canonicalizeUrl(input: string): string {
  if (!input || typeof input !== 'string') {
    return input
  }

  try {
    const url = new URL(input)

    // Lower-case hostname
    url.hostname = url.hostname.toLowerCase()

    // Remove www. prefix
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.substring(4)
    }

    // Strip trailing slash from pathname (but preserve root path)
    if (url.pathname !== '/' && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1)
    }

    // Remove tracking parameters
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'gclid',
      'fbclid',
      'mc_cid',
      'mc_eid',
      'ref',
      '_ga',
      '_gid',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
    ]

    trackingParams.forEach((param) => {
      url.searchParams.delete(param)
    })

    return url.toString()
  } catch {
    // If URL parsing fails, return original input
    return input
  }
}

/**
 * Extracts domain from a URL.
 * Returns hostname without www. prefix.
 *
 * @param input - URL string
 * @returns Domain string, or empty string if parsing fails
 */
export function extractDomain(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  try {
    const url = new URL(input.startsWith('http') ? input : `https://${input}`)
    return url.hostname.replace(/^www\./, '')
  } catch {
    // Fallback: attempt regex domain extraction
    const match = input.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/i)
    if (match && match[1]) {
      return match[1].replace(/^www\./, '').toLowerCase()
    }
    return ''
  }
}

/**
 * Trims and normalizes an excerpt string:
 * - Collapses whitespace
 * - Removes excessive newlines
 * - Caps length with ellipsis
 *
 * @param input - Excerpt string to trim
 * @param maxChars - Maximum character length (default 280)
 * @returns Trimmed excerpt
 */
export function trimExcerpt(input: string, maxChars: number = 280): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Collapse whitespace (multiple spaces/newlines to single space)
  let trimmed = input.replace(/\s+/g, ' ').trim()

  // Remove excessive newlines (more than 2 consecutive newlines)
  trimmed = trimmed.replace(/\n{3,}/g, '\n\n')

  // Cap length with ellipsis
  if (trimmed.length > maxChars) {
    trimmed = trimmed.substring(0, maxChars).trim()
    // Try to break at word boundary
    const lastSpace = trimmed.lastIndexOf(' ')
    if (lastSpace > maxChars * 0.8) {
      trimmed = trimmed.substring(0, lastSpace)
    }
    trimmed += '...'
  }

  return trimmed
}

/**
 * Normalizes Tavily API results to a consistent format.
 * Ensures all required fields are present with sensible fallbacks.
 *
 * @param resp - Tavily API response
 * @param opts - Normalization options
 * @returns Array of normalized evidence results
 */
export function normalizeTavilyResults(
  resp: TavilyResponse,
  opts?: { maxExcerptChars?: number }
): NormalizedEvidenceResult[] {
  const maxExcerptChars = opts?.maxExcerptChars ?? 280

  return resp.results.map((result: TavilyRawResult) => {
    const url = result.url || ''
    const canonicalUrl = canonicalizeUrl(url)
    const domain = extractDomain(url)

    // Title fallback: use domain or URL if title is missing
    const title = result.title || domain || url

    // Excerpt preference: content > raw_content (trimmed) > empty
    let excerpt = ''
    if (result.content) {
      excerpt = trimExcerpt(result.content, maxExcerptChars)
    } else if (result.raw_content) {
      excerpt = trimExcerpt(result.raw_content, maxExcerptChars)
    }

    return {
      title,
      url,
      canonicalUrl,
      domain,
      excerpt,
      score: result.score,
      publishedDate: result.published_date,
    }
  })
}

