import { describe, it, expect } from 'vitest'
import { normalizeUrl, isProbablyDomainLike, toDisplayDomain } from '@/lib/url/normalizeUrl'

describe('normalizeUrl', () => {
  it('normalizes monday.com to https://monday.com', () => {
    const result = normalizeUrl('monday.com')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.url).toBe('https://monday.com')
    }
  })

  it('preserves http:// protocol', () => {
    const result = normalizeUrl('http://monday.com')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.url).toBe('http://monday.com')
    }
  })

  it('preserves https:// protocol', () => {
    const result = normalizeUrl('https://monday.com')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.url).toBe('https://monday.com')
    }
  })

  it('handles www.monday.com', () => {
    const result = normalizeUrl('www.monday.com')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.url).toBe('https://www.monday.com')
    }
  })

  it('handles monday.com/pricing', () => {
    const result = normalizeUrl('monday.com/pricing')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.url).toBe('https://monday.com/pricing')
    }
  })

  it('trims whitespace', () => {
    const result = normalizeUrl('  monday.com  ')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.url).toBe('https://monday.com')
    }
  })

  it('handles protocol-relative URLs (//example.com)', () => {
    const result = normalizeUrl('//monday.com')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.url).toBe('https://monday.com')
    }
  })

  it('rejects empty string', () => {
    const result = normalizeUrl('')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toContain('empty')
    }
  })

  it('rejects strings with spaces inside domain', () => {
    const result = normalizeUrl('monday .com')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toContain('spaces')
    }
  })

  it('rejects invalid URLs', () => {
    const result = normalizeUrl('not a url')
    expect(result.ok).toBe(false)
  })

  it('handles localhost', () => {
    const result = normalizeUrl('localhost:3000')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.url).toContain('localhost')
    }
  })

  it('handles URLs with query parameters', () => {
    const result = normalizeUrl('monday.com/pricing?plan=pro')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.url).toBe('https://monday.com/pricing?plan=pro')
    }
  })

  it('handles URLs with fragments', () => {
    const result = normalizeUrl('monday.com#section')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.url).toBe('https://monday.com#section')
    }
  })
})

describe('isProbablyDomainLike', () => {
  it('returns true for domains with dots', () => {
    expect(isProbablyDomainLike('monday.com')).toBe(true)
    expect(isProbablyDomainLike('www.example.com')).toBe(true)
  })

  it('returns true for URLs with protocol', () => {
    expect(isProbablyDomainLike('https://monday.com')).toBe(true)
    expect(isProbablyDomainLike('http://example.com')).toBe(true)
  })

  it('returns true for localhost', () => {
    expect(isProbablyDomainLike('localhost')).toBe(true)
    expect(isProbablyDomainLike('localhost:3000')).toBe(true)
  })

  it('returns false for empty string', () => {
    expect(isProbablyDomainLike('')).toBe(false)
  })

  it('returns false for plain text', () => {
    expect(isProbablyDomainLike('not a domain')).toBe(false)
  })
})

describe('toDisplayDomain', () => {
  it('extracts domain from full URL', () => {
    expect(toDisplayDomain('https://www.monday.com/pricing')).toBe('monday.com')
  })

  it('removes www. prefix', () => {
    expect(toDisplayDomain('https://www.example.com')).toBe('example.com')
  })

  it('handles URLs without www', () => {
    expect(toDisplayDomain('https://monday.com')).toBe('monday.com')
  })

  it('handles bare domains', () => {
    expect(toDisplayDomain('monday.com')).toBe('monday.com')
  })

  it('handles http:// URLs', () => {
    expect(toDisplayDomain('http://example.com')).toBe('example.com')
  })
})

