import { describe, it, expect } from 'vitest'
import { extractDomain, normalizeDomain } from '@/lib/utils/domain'

describe('normalizeDomain', () => {
  it('converts to lowercase', () => {
    expect(normalizeDomain('EXAMPLE.COM')).toBe('example.com')
  })

  it('removes www. prefix', () => {
    expect(normalizeDomain('www.example.com')).toBe('example.com')
  })

  it('handles www. with uppercase', () => {
    expect(normalizeDomain('WWW.EXAMPLE.COM')).toBe('example.com')
  })

  it('trims whitespace', () => {
    expect(normalizeDomain('  example.com  ')).toBe('example.com')
  })

  it('handles domain without www', () => {
    expect(normalizeDomain('example.com')).toBe('example.com')
  })
})

describe('extractDomain', () => {
  it('extracts domain from https://www.fullstory.com/pricing', () => {
    expect(extractDomain('https://www.fullstory.com/pricing')).toBe('fullstory.com')
  })

  it('extracts domain from http://example.com', () => {
    expect(extractDomain('http://example.com')).toBe('example.com')
  })

  it('extracts domain from example.com/path', () => {
    expect(extractDomain('example.com/path')).toBe('example.com')
  })

  it('extracts domain from bare domain', () => {
    expect(extractDomain('example.com')).toBe('example.com')
  })

  it('handles www. prefix', () => {
    expect(extractDomain('https://www.example.com')).toBe('example.com')
  })

  it('handles URLs with query parameters', () => {
    expect(extractDomain('https://example.com/path?query=value')).toBe('example.com')
  })

  it('handles URLs with fragments', () => {
    expect(extractDomain('https://example.com/path#fragment')).toBe('example.com')
  })

  it('handles URLs with ports', () => {
    expect(extractDomain('https://example.com:8080/path')).toBe('example.com')
  })

  it('handles subdomains', () => {
    expect(extractDomain('https://subdomain.example.com')).toBe('subdomain.example.com')
  })

  it('returns null for invalid input - empty string', () => {
    expect(extractDomain('')).toBeNull()
  })

  it('returns null for invalid input - whitespace only', () => {
    expect(extractDomain('   ')).toBeNull()
  })

  it('returns null for invalid input - null', () => {
    expect(extractDomain(null)).toBeNull()
  })

  it('returns null for invalid input - undefined', () => {
    expect(extractDomain(undefined)).toBeNull()
  })

  it('returns null for not a url - plain text', () => {
    expect(extractDomain('not a url')).toBeNull()
  })

  it('returns null for not a url - invalid characters', () => {
    expect(extractDomain('!!!invalid!!!')).toBeNull()
  })

  it('handles domains with hyphens', () => {
    expect(extractDomain('https://my-example.com')).toBe('my-example.com')
  })

  it('handles domains with multiple subdomains', () => {
    expect(extractDomain('https://sub1.sub2.example.com')).toBe('sub1.sub2.example.com')
  })
})

