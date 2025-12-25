/**
 * PR4.5: Evidence deduplication with canonical key generation
 * Provides deterministic identity for evidence items
 */

import { canonicalizeUrl } from './normalize'

export interface CanonicalizeEvidenceKeyInput {
  url: string
  title?: string
}

/**
 * Generate a canonical key for evidence deduplication
 * 
 * Rules:
 * - Normalize URL: strip query params, fragments, lowercase hostname, remove trailing slashes
 * - Prefer canonical root + path (not full URL with tracking)
 * - If URL missing, fall back to normalized title hash
 */
export function canonicalizeEvidenceKey(input: CanonicalizeEvidenceKeyInput): string {
  const { url, title } = input

  // If URL is provided, use canonicalized URL as key
  if (url && url.trim()) {
    // First, try to parse the original URL to see if it's valid
    // If it's not parseable, we'll fall back to title
    let isValidUrl = false
    try {
      const testUrl = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : `https://${url}`
      new URL(testUrl)
      isValidUrl = true
    } catch {
      // URL is not valid, will fall back to title
      isValidUrl = false
    }

    if (isValidUrl) {
      // Use existing canonicalizeUrl which already handles:
      // - Lowercase hostname
      // - Remove www. prefix
      // - Strip trailing slash
      // - Remove tracking parameters
      const canonical = canonicalizeUrl(url)
      
      try {
        // Ensure URL has protocol for parsing
        const urlToParse = canonical.startsWith('http://') || canonical.startsWith('https://') 
          ? canonical 
          : `https://${canonical}`
        const urlObj = new URL(urlToParse)
        urlObj.hash = '' // Remove fragments
        urlObj.search = '' // Remove query params (as per PR requirements)
        
        // Return protocol + hostname + pathname (no query params, no fragments)
        return urlObj.toString()
      } catch {
        // Should not happen if original URL was valid, but handle gracefully
      }
    }
    // If URL is invalid, fall through to title-based key
  }

  // Fallback: use normalized title hash
  if (title && title.trim()) {
    // Normalize title: lowercase, trim, collapse whitespace
    const normalized = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
    
    // Return a simple hash-like key (not cryptographic, just for deduplication)
    // In practice, we could use a proper hash, but for deduplication a normalized string is sufficient
    return `title:${normalized}`
  }

  // Last resort: return empty string (shouldn't happen in practice)
  return ''
}

/**
 * Deduplicate evidence items by canonical key
 * Keeps the first occurrence of each canonical key
 */
export function dedupeEvidenceByKey<T extends CanonicalizeEvidenceKeyInput>(
  items: T[]
): T[] {
  const seen = new Map<string, T>()
  
  for (const item of items) {
    const key = canonicalizeEvidenceKey(item)
    
    // Skip empty keys (invalid items)
    if (!key) {
      continue
    }
    
    // Keep first occurrence
    if (!seen.has(key)) {
      seen.set(key, item)
    }
  }
  
  return Array.from(seen.values())
}

