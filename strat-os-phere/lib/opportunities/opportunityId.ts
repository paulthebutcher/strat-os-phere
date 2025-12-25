/**
 * Opportunity ID encoding/decoding utilities
 * 
 * Opportunity IDs come from the schema and may not be URL-safe.
 * This module provides utilities to encode/decode them for use in URLs.
 */

/**
 * Encode an opportunity ID for use in URLs
 * Uses base64url encoding to ensure URL safety
 */
export function encodeOpportunityId(id: string): string {
  // If the ID is already URL-safe (alphanumeric, dash, underscore), return as-is
  if (/^[a-zA-Z0-9_-]+$/.test(id)) {
    return id
  }
  
  // Otherwise, encode using base64url
  // Note: Buffer is available in Node.js environments
  if (typeof Buffer !== 'undefined') {
    try {
      return Buffer.from(id, 'utf-8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
    } catch {
      // Fallback to URL encoding
    }
  }
  
  // Fallback: URL encode the entire string
  return encodeURIComponent(id)
}

/**
 * Decode an opportunity ID from a URL
 */
export function decodeOpportunityId(encoded: string): string {
  // Try to decode as base64url first
  if (typeof Buffer !== 'undefined') {
    try {
      // Add padding if needed
      let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
      while (base64.length % 4) {
        base64 += '='
      }
      return Buffer.from(base64, 'base64').toString('utf-8')
    } catch {
      // Fall through to URL decode
    }
  }
  
  // Fallback: try URL decode
  try {
    return decodeURIComponent(encoded)
  } catch {
    // If both fail, return as-is (might already be decoded)
    return encoded
  }
}

