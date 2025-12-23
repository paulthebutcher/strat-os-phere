import { describe, it, expect } from 'vitest'
import {
  canonicalizeUrl,
  extractDomain,
  normalizeClaimText,
  computeClaimFingerprintSync,
} from '@/lib/evidence/claims/normalize'

describe('normalize', () => {
  describe('canonicalizeUrl', () => {
    it('strips UTM parameters', () => {
      const url = 'https://example.com/page?utm_source=test&utm_medium=email&foo=bar'
      const result = canonicalizeUrl(url)
      expect(result).not.toContain('utm_source')
      expect(result).not.toContain('utm_medium')
      expect(result).toContain('foo=bar')
    })

    it('removes trailing slash', () => {
      const url = 'https://example.com/page/'
      const result = canonicalizeUrl(url)
      expect(result).not.toMatch(/\/$/)
    })

    it('normalizes protocol to https', () => {
      const url = 'http://example.com/page'
      const result = canonicalizeUrl(url)
      expect(result).toMatch(/^https:/)
    })

    it('lowercases hostname', () => {
      const url = 'https://EXAMPLE.COM/page'
      const result = canonicalizeUrl(url)
      expect(result).toContain('example.com')
    })
  })

  describe('extractDomain', () => {
    it('extracts domain from URL', () => {
      const url = 'https://www.example.com/path/to/page'
      const result = extractDomain(url)
      expect(result).toBe('example.com')
    })

    it('removes www prefix', () => {
      const url = 'https://www.example.com'
      const result = extractDomain(url)
      expect(result).toBe('example.com')
    })

    it('lowercases domain', () => {
      const url = 'https://EXAMPLE.COM'
      const result = extractDomain(url)
      expect(result).toBe('example.com')
    })
  })

  describe('normalizeClaimText', () => {
    it('trims whitespace', () => {
      const text = '  claim text  '
      const result = normalizeClaimText(text)
      expect(result).toBe('claim text')
    })

    it('collapses multiple spaces', () => {
      const text = 'claim    text   with   spaces'
      const result = normalizeClaimText(text)
      expect(result).toBe('claim text with spaces')
    })

    it('collapses newlines', () => {
      const text = 'claim\n\ntext\nwith\nnewlines'
      const result = normalizeClaimText(text)
      expect(result).toBe('claim text with newlines')
    })
  })

  describe('computeClaimFingerprintSync', () => {
    it('generates same fingerprint for identical inputs', () => {
      const fp1 = computeClaimFingerprintSync('claim', 'https://example.com', 'pricing')
      const fp2 = computeClaimFingerprintSync('claim', 'https://example.com', 'pricing')
      expect(fp1).toBe(fp2)
    })

    it('generates different fingerprints for different claims', () => {
      const fp1 = computeClaimFingerprintSync('claim 1', 'https://example.com', 'pricing')
      const fp2 = computeClaimFingerprintSync('claim 2', 'https://example.com', 'pricing')
      expect(fp1).not.toBe(fp2)
    })

    it('includes excerpt in fingerprint when provided', () => {
      const fp1 = computeClaimFingerprintSync('claim', 'https://example.com', 'pricing', 'excerpt 1')
      const fp2 = computeClaimFingerprintSync('claim', 'https://example.com', 'pricing', 'excerpt 2')
      expect(fp1).not.toBe(fp2)
    })
  })
})

