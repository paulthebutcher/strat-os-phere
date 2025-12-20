/**
 * Domain extraction and normalization utilities
 */

/**
 * Normalizes a domain string by:
 * - Converting to lowercase
 * - Removing www. prefix if present
 * - Trimming whitespace
 * 
 * @param domain - Domain string to normalize (e.g., "www.example.com" or "Example.COM")
 * @returns Normalized domain (e.g., "example.com")
 */
export function normalizeDomain(domain: string): string {
  return domain.toLowerCase().trim().replace(/^www\./, '')
}

/**
 * Extracts and normalizes a domain from a URL string.
 * Handles various URL formats:
 * - Full URLs: https://www.example.com/path -> example.com
 * - URLs with protocol: http://example.com -> example.com
 * - URLs without protocol: example.com/path -> example.com
 * - Bare domains: example.com -> example.com
 * - Domains with www: www.example.com -> example.com
 * 
 * @param input - URL or domain string
 * @returns Normalized domain (e.g., "example.com") or null if invalid
 */
export function extractDomain(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') {
    return null
  }

  const trimmed = input.trim()
  if (!trimmed) {
    return null
  }

  try {
    // If it doesn't start with http:// or https://, add a protocol for URL parsing
    let urlString = trimmed
    if (!trimmed.match(/^https?:\/\//i)) {
      urlString = `https://${trimmed}`
    }

    const url = new URL(urlString)
    const hostname = url.hostname

    if (!hostname) {
      return null
    }

    // Validate that hostname looks like a domain (has at least one dot or is localhost)
    // This prevents matching plain text like "not" or "invalid"
    if (!hostname.match(/^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i) && hostname !== 'localhost') {
      return null
    }

    return normalizeDomain(hostname)
  } catch {
    // If URL parsing fails, try to extract domain from the string directly
    // This handles cases like "example.com/path" or bare domains
    // Use a stricter regex that requires a TLD (at least 2 characters after the last dot)
    const match = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+\.?[a-z]{2,})/i)
    if (match && match[1]) {
      const domain = match[1].replace(/\.$/, '') // Remove trailing dot if present
      // Validate it has at least one dot and a TLD
      if (domain.includes('.') && domain.split('.').pop() && domain.split('.').pop()!.length >= 2) {
        return normalizeDomain(domain)
      }
    }

    return null
  }
}

