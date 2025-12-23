import { describe, it, expect } from 'vitest'
import { canonicalizeUrl, extractDomain } from '@/lib/evidence/url'

describe('canonicalizeUrl', () => {
  it('strips UTM parameters', () => {
    const result = canonicalizeUrl('https://example.com/page?utm_source=google&utm_medium=cpc&foo=bar')
    expect(result).toBe('https://example.com/page?foo=bar')
  })

  it('strips tracking parameters', () => {
    const result = canonicalizeUrl('https://example.com/page?fbclid=123&gclid=456&ref=test')
    expect(result).toBe('https://example.com/page')
  })

  it('removes fragments', () => {
    const result = canonicalizeUrl('https://example.com/page#section')
    expect(result).toBe('https://example.com/page')
  })

  it('removes trailing slash except for root', () => {
    expect(canonicalizeUrl('https://example.com/page/')).toBe('https://example.com/page')
    expect(canonicalizeUrl('https://example.com/')).toBe('https://example.com/')
  })

  it('preserves non-tracking query parameters', () => {
    const result = canonicalizeUrl('https://example.com/page?param1=value1&param2=value2')
    expect(result).toBe('https://example.com/page?param1=value1&param2=value2')
  })

  it('handles URLs without query parameters or fragments', () => {
    const result = canonicalizeUrl('https://example.com/page')
    expect(result).toBe('https://example.com/page')
  })

  it('handles invalid URLs gracefully', () => {
    const result = canonicalizeUrl('not a url')
    expect(result).toBe('not a url')
  })
})

describe('extractDomain', () => {
  it('extracts domain from full URL', () => {
    expect(extractDomain('https://www.example.com/path/to/page')).toBe('example.com')
  })

  it('removes www. prefix', () => {
    expect(extractDomain('https://www.example.com')).toBe('example.com')
  })

  it('handles URLs without www', () => {
    expect(extractDomain('https://example.com')).toBe('example.com')
  })

  it('handles http:// URLs', () => {
    expect(extractDomain('http://example.com')).toBe('example.com')
  })

  it('handles bare domains', () => {
    expect(extractDomain('example.com')).toBe('example.com')
  })

  it('handles URLs with ports', () => {
    expect(extractDomain('https://example.com:8080/path')).toBe('example.com')
  })

  it('handles invalid URLs gracefully', () => {
    const result = extractDomain('not a url')
    expect(result).toBe('not a url')
  })
})

