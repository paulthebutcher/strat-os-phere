/**
 * URL utilities for evidence processing
 * Canonicalizes URLs and extracts domains for consistent storage and comparison
 */

/**
 * Canonicalizes a URL by:
 * - Stripping UTM parameters and other tracking params
 * - Removing fragments (#)
 * - Normalizing trailing slashes (removes trailing slash except for root)
 * - Preserving the core URL structure
 * 
 * @param url - URL string to canonicalize
 * @returns Canonicalized URL string
 */
export function canonicalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)

    // Remove UTM and common tracking parameters
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'ref',
      'source',
      'medium',
      'campaign',
      'fbclid',
      'gclid',
      'msclkid',
    ]

    trackingParams.forEach((param) => {
      urlObj.searchParams.delete(param)
    })

    // Remove fragment
    urlObj.hash = ''

    // Normalize trailing slash: remove unless it's root path
    let pathname = urlObj.pathname
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1)
    }
    urlObj.pathname = pathname

    return urlObj.toString()
  } catch {
    // If URL parsing fails, return original
    return url
  }
}

/**
 * Extracts the domain from a URL
 * 
 * @param url - URL string
 * @returns Domain string (e.g., "example.com")
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    // Remove www. prefix if present
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    // If URL parsing fails, try basic extraction
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\?#]+)/i)
    if (match && match[1]) {
      return match[1].replace(/^www\./, '')
    }
    return url
  }
}

