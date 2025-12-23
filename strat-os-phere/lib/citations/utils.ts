/**
 * PR6: Citation utility functions
 * 
 * Helper functions for validating, formatting, and manipulating citations
 */

/**
 * Simple URL validation
 * Returns true if the string looks like a valid URL
 */
export function isValidUrl(s: string): boolean {
  if (!s || typeof s !== 'string') return false
  
  try {
    const url = new URL(s)
    // Must have http or https protocol
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    // Try with https:// prefix if no protocol
    try {
      const url = new URL('https://' + s)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Canonicalizes a URL by:
 * - Trimming whitespace
 * - Adding https:// if no protocol
 * - Removing fragments (#hash)
 * - Keeping it conservative (minimal changes)
 */
export function canonicalizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return ''
  
  let normalized = url.trim()
  
  // Remove fragments
  const hashIndex = normalized.indexOf('#')
  if (hashIndex >= 0) {
    normalized = normalized.substring(0, hashIndex)
  }
  
  // Ensure protocol
  if (!normalized.match(/^https?:\/\//i)) {
    // Only add https:// if it looks like a domain (contains a dot)
    if (normalized.includes('.')) {
      normalized = 'https://' + normalized
    } else {
      // If it doesn't look like a domain, return empty string so validation fails
      return ''
    }
  }
  
  return normalized
}

/**
 * Extracts and formats hostname from URL
 * Removes www. prefix and returns clean hostname
 */
export function formatHost(url: string): string {
  if (!url || typeof url !== 'string') return ''
  
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    // Fallback: try to extract manually
    const match = url.match(/https?:\/\/([^\/]+)/)
    if (match) {
      return match[1].replace(/^www\./, '')
    }
    return url
  }
}

/**
 * Formats an ISO date string to a human-readable format
 * Returns null if the date is invalid
 * 
 * @example "2026-01-02T12:00:00Z" -> "Jan 2, 2026"
 */
export function formatDate(iso?: string): string | null {
  if (!iso || typeof iso !== 'string') return null
  
  try {
    const date = new Date(iso)
    if (isNaN(date.getTime())) return null
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return null
  }
}

/**
 * Clamps confidence value to 0-1 range
 * Returns undefined if input is invalid
 */
export function clampConfidence(n?: number): number | undefined {
  if (typeof n !== 'number' || isNaN(n)) return undefined
  
  // Handle 0-100 range by converting to 0-1
  if (n > 1 && n <= 100) {
    return Math.max(0, Math.min(1, n / 100))
  }
  
  // Already in 0-1 range
  return Math.max(0, Math.min(1, n))
}

