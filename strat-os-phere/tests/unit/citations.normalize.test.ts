/**
 * PR6: Unit tests for citation normalization
 */

import { describe, it, expect } from 'vitest'
import { normalizeCitation, normalizeCitations } from '@/lib/citations/normalize'

describe('normalizeCitation', () => {
  it('normalizes string URL', () => {
    const result = normalizeCitation('https://example.com')
    expect(result).toEqual({ url: 'https://example.com' })
  })

  it('normalizes object with url field', () => {
    const result = normalizeCitation({ url: 'https://example.com' })
    expect(result).toEqual({ url: 'https://example.com' })
  })

  it('normalizes object with href field', () => {
    const result = normalizeCitation({ href: 'https://example.com' })
    expect(result).toEqual({ url: 'https://example.com' })
  })

  it('normalizes object with link field', () => {
    const result = normalizeCitation({ link: 'https://example.com' })
    expect(result).toEqual({ url: 'https://example.com' })
  })

  it('normalizes title from title or pageTitle', () => {
    const result1 = normalizeCitation({ url: 'https://example.com', title: 'Test Title' })
    expect(result1?.title).toBe('Test Title')

    const result2 = normalizeCitation({ url: 'https://example.com', pageTitle: 'Page Title' })
    expect(result2?.title).toBe('Page Title')
  })

  it('normalizes evidenceType from various fields', () => {
    const result1 = normalizeCitation({ url: 'https://example.com', type: 'pricing' })
    expect(result1?.evidenceType).toBe('pricing')

    const result2 = normalizeCitation({ url: 'https://example.com', evidence_type: 'docs' })
    expect(result2?.evidenceType).toBe('docs')

    const result3 = normalizeCitation({ url: 'https://example.com', evidenceType: 'reviews' })
    expect(result3?.evidenceType).toBe('reviews')
  })

  it('normalizes retrievedAt from various fields', () => {
    const iso = '2026-01-02T12:00:00Z'
    const result1 = normalizeCitation({ url: 'https://example.com', retrievedAt: iso })
    expect(result1?.retrievedAt).toMatch(/^2026-01-02T12:00:00/)

    const result2 = normalizeCitation({ url: 'https://example.com', retrieved_at: iso })
    expect(result2?.retrievedAt).toMatch(/^2026-01-02T12:00:00/)
  })

  it('normalizes publishedAt from various fields', () => {
    const iso = '2026-01-01T10:00:00Z'
    const result1 = normalizeCitation({ url: 'https://example.com', publishedAt: iso })
    expect(result1?.publishedAt).toMatch(/^2026-01-01T10:00:00/)

    const result2 = normalizeCitation({ url: 'https://example.com', published_at: iso })
    expect(result2?.publishedAt).toMatch(/^2026-01-01T10:00:00/)
  })

  it('normalizes confidence from 0-100 range to 0-1', () => {
    const result = normalizeCitation({ url: 'https://example.com', confidence: 87 })
    expect(result?.confidence).toBeCloseTo(0.87, 2)
  })

  it('keeps confidence in 0-1 range as-is', () => {
    const result = normalizeCitation({ url: 'https://example.com', confidence: 0.75 })
    expect(result?.confidence).toBe(0.75)
  })

  it('returns null for missing URL', () => {
    const result = normalizeCitation({ title: 'No URL' })
    expect(result).toBeNull()
  })

  it('returns null for invalid URL', () => {
    const result = normalizeCitation({ url: 'not-a-url' })
    // Invalid URLs without a dot should fail validation
    expect(result).toBeNull()
  })

  it('handles null input', () => {
    const result = normalizeCitation(null)
    expect(result).toBeNull()
  })
})

describe('normalizeCitations', () => {
  it('normalizes array of citations', () => {
    const input = [
      'https://example.com',
      { url: 'https://example2.com', title: 'Test' },
      { href: 'https://example3.com' },
    ]
    const result = normalizeCitations(input)
    expect(result.length).toBe(3)
    expect(result[0].url).toBe('https://example.com')
    expect(result[1].url).toBe('https://example2.com')
    expect(result[2].url).toBe('https://example3.com')
  })

  it('normalizes object with citations field', () => {
    const input = {
      citations: [
        { url: 'https://example.com' },
        { url: 'https://example2.com' },
      ],
    }
    const result = normalizeCitations(input)
    expect(result.length).toBe(2)
  })

  it('normalizes object with evidence_citations field', () => {
    const input = {
      evidence_citations: [
        { url: 'https://example.com' },
      ],
    }
    const result = normalizeCitations(input)
    expect(result.length).toBe(1)
  })

  it('deduplicates by URL', () => {
    const input = [
      { url: 'https://example.com' },
      { url: 'https://example.com' },
      { url: 'https://example2.com' },
    ]
    const result = normalizeCitations(input)
    expect(result.length).toBe(2)
  })

  it('drops invalid entries', () => {
    const input = [
      { url: 'https://example.com' },
      { title: 'No URL' },
      { url: 'https://example2.com' },
    ]
    const result = normalizeCitations(input)
    expect(result.length).toBe(2)
  })

  it('handles empty array', () => {
    const result = normalizeCitations([])
    expect(result).toEqual([])
  })

  it('handles null input', () => {
    const result = normalizeCitations(null)
    expect(result).toEqual([])
  })

  it('normalizes single citation object', () => {
    const input = { url: 'https://example.com', title: 'Test' }
    const result = normalizeCitations(input)
    expect(result.length).toBe(1)
    expect(result[0].url).toBe('https://example.com')
    expect(result[0].title).toBe('Test')
  })

  it('converts confidence 87 to 0.87', () => {
    const input = [
      { url: 'https://example.com', confidence: 87 },
    ]
    const result = normalizeCitations(input)
    expect(result[0].confidence).toBeCloseTo(0.87, 2)
  })
})

