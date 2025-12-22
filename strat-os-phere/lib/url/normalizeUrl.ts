/**
 * URL normalization utilities
 * Handles forgiving URL input (bare domains, missing protocols, etc.)
 */

export type NormalizeUrlResult =
  | { ok: true; url: string }
  | { ok: false; reason: string }

/**
 * Normalizes a URL input string to a valid URL.
 * 
 * - Trims whitespace
 * - Adds https:// if no protocol is present
 * - Handles // protocol-relative URLs
 * - Validates the result is a proper URL
 * 
 * @param input - URL or domain string (e.g., "monday.com", "www.monday.com", "https://monday.com")
 * @returns Normalized URL or error reason
 */
export function normalizeUrl(input: string): NormalizeUrlResult {
  if (typeof input !== 'string') {
    return { ok: false, reason: 'Input must be a string' }
  }

  // Trim whitespace
  const trimmed = input.trim()

  if (!trimmed) {
    return { ok: false, reason: 'URL cannot be empty' }
  }

  // Reject obviously bad values
  // Check for spaces inside what should be a domain
  if (trimmed.includes(' ') && !trimmed.startsWith('http')) {
    return { ok: false, reason: 'URL cannot contain spaces' }
  }

  // Check for missing TLD (basic heuristic: should have a dot followed by at least 2 chars)
  // But allow localhost and IP addresses
  const hasProtocol = trimmed.match(/^https?:\/\//i)
  const withoutProtocol = hasProtocol ? trimmed.replace(/^https?:\/\//i, '') : trimmed
  
  // Skip TLD check for localhost, IP addresses, or if it already has a protocol and looks valid
  if (!withoutProtocol.match(/^(localhost|(\d{1,3}\.){3}\d{1,3})/i)) {
    // Check if it looks like it might have a TLD
    const parts = withoutProtocol.split('/')[0].split('.')
    if (parts.length < 2 || (parts.length === 2 && parts[1].length < 2)) {
      // Might be missing TLD, but could also be a subdomain - be lenient
      // Only reject if it's clearly not a domain (no dots at all and not localhost)
      if (!withoutProtocol.includes('.') && !withoutProtocol.match(/^localhost/i)) {
        return { ok: false, reason: 'URL must include a domain name' }
      }
    }
  }

  let urlString = trimmed

  // Handle protocol-relative URLs (//example.com)
  if (urlString.startsWith('//')) {
    urlString = `https:${urlString}`
  }
  // Add protocol if missing
  else if (!urlString.match(/^https?:\/\//i)) {
    urlString = `https://${urlString}`
  }

  // Validate with URL constructor
  try {
    const url = new URL(urlString)
    
    // Ensure hostname exists
    if (!url.hostname) {
      return { ok: false, reason: 'Invalid URL: missing hostname' }
    }

    // Return normalized URL (always use https if we added it)
    // Preserve original protocol if it was http://
    if (trimmed.match(/^http:\/\//i) && !trimmed.match(/^https:\/\//i)) {
      return { ok: true, url: urlString.replace(/^https:\/\//i, 'http://') }
    }
    
    return { ok: true, url: urlString }
  } catch (error) {
    return { ok: false, reason: `Invalid URL: ${error instanceof Error ? error.message : 'parse error'}` }
  }
}

/**
 * Simple heuristic to check if input looks like a domain/URL.
 * Used for UI hints before full validation.
 * 
 * @param input - String to check
 * @returns true if input looks domain-like
 */
export function isProbablyDomainLike(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false
  }

  const trimmed = input.trim()
  if (!trimmed) {
    return false
  }

  // Has a dot (likely a domain)
  if (trimmed.includes('.')) {
    return true
  }

  // Starts with http:// or https://
  if (trimmed.match(/^https?:\/\//i)) {
    return true
  }

  // localhost
  if (trimmed.match(/^localhost/i)) {
    return true
  }

  return false
}

/**
 * Converts a URL to a display-friendly domain string.
 * Removes protocol and www. prefix.
 * 
 * @param url - Full URL (e.g., "https://www.monday.com/pricing")
 * @returns Display domain (e.g., "monday.com")
 */
export function toDisplayDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    // Fallback: try to extract domain manually
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/i)
    if (match && match[1]) {
      return match[1].replace(/^www\./, '')
    }
    return url
  }
}

