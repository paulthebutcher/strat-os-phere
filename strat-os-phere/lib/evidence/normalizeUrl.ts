/**
 * Normalize URLs for consistent caching and deduplication
 * - Strips UTM parameters and other tracking params
 * - Lowercases hostname
 * - Trims trailing slashes (except for root)
 * - Normalizes protocol to https
 */

export function normalizeUrl(url: string): string {
  try {
    // Add protocol if missing
    let normalized = url.trim()
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`
    }

    const urlObj = new URL(normalized)

    // Normalize protocol to https
    urlObj.protocol = 'https:'

    // Lowercase hostname
    urlObj.hostname = urlObj.hostname.toLowerCase()

    // Remove www. prefix
    if (urlObj.hostname.startsWith('www.')) {
      urlObj.hostname = urlObj.hostname.slice(4)
    }

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

    // Normalize path: remove trailing slash unless it's root
    let pathname = urlObj.pathname
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1)
    }
    urlObj.pathname = pathname

    // Sort query parameters for consistency
    const sortedParams = new URLSearchParams()
    Array.from(urlObj.searchParams.keys())
      .sort()
      .forEach((key) => {
        sortedParams.append(key, urlObj.searchParams.get(key)!)
      })
    urlObj.search = sortedParams.toString()

    return urlObj.toString()
  } catch (error) {
    // If URL parsing fails, return original (trimmed)
    return url.trim()
  }
}

