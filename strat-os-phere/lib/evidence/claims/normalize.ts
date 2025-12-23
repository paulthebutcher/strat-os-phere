/**
 * Evidence claim normalization
 * Canonicalizes URLs, normalizes claim text, and computes fingerprints
 */

import { normalizeUrl } from '../normalizeUrl'
import { hashContent } from '../hash'

/**
 * Canonicalize URL for consistent comparison
 * - Lowercase hostname
 * - Strip UTM and tracking params
 * - Remove trailing slash (except root)
 * - Normalize protocol to https
 */
export function canonicalizeUrl(url: string): string {
  return normalizeUrl(url)
}

/**
 * Extract domain from URL
 * Returns lowercase domain without www prefix
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    // Fallback: try manual extraction
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/i)
    if (match && match[1]) {
      return match[1].replace(/^www\./, '').toLowerCase()
    }
    return ''
  }
}

/**
 * Normalize claim text for consistent comparison
 * - Trim whitespace
 * - Collapse multiple spaces/newlines to single space
 */
export function normalizeClaimText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
}

/**
 * Compute a deterministic fingerprint for a claim
 * Used for deduplication
 * 
 * Fingerprint is based on:
 * - Normalized claim text
 * - Canonical URL
 * - Evidence type
 * - Optional excerpt (if provided)
 */
export async function computeClaimFingerprint(
  claimText: string,
  canonicalUrl: string,
  evidenceType: string,
  excerpt?: string
): Promise<string> {
  const normalizedText = normalizeClaimText(claimText)
  const normalizedUrl = canonicalizeUrl(canonicalUrl)
  
  // Build fingerprint string
  const parts = [
    normalizedText,
    normalizedUrl,
    evidenceType,
    excerpt ? normalizeClaimText(excerpt) : '',
  ].filter(Boolean)
  
  const fingerprintString = parts.join('|')
  return hashContent(fingerprintString)
}

/**
 * Synchronous version using a simple hash
 * For use in contexts where async is not available
 */
export function computeClaimFingerprintSync(
  claimText: string,
  canonicalUrl: string,
  evidenceType: string,
  excerpt?: string
): string {
  const normalizedText = normalizeClaimText(claimText)
  const normalizedUrl = canonicalizeUrl(canonicalUrl)
  
  // Build fingerprint string
  const parts = [
    normalizedText,
    normalizedUrl,
    evidenceType,
    excerpt ? normalizeClaimText(excerpt) : '',
  ].filter(Boolean)
  
  const fingerprintString = parts.join('|')
  
  // Simple hash function (not cryptographically secure, but deterministic)
  let hash = 0
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36)
}

