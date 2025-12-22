/**
 * Generate content hash for caching and deduplication
 * Uses SHA-256 via Web Crypto API
 */

/**
 * Compute SHA-256 hash of text content
 * Returns hex string
 */
export async function hashContent(content: string): Promise<string> {
  // Use Web Crypto API (available in Node.js 18+)
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  
  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

