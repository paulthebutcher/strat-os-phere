import { describe, it, expect } from 'vitest'
import {
  canonicalizeEvidenceKey,
  dedupeEvidenceByKey,
} from '@/lib/evidence/dedupeEvidence'

describe('canonicalizeEvidenceKey', () => {
  describe('URL normalization', () => {
    it('strips query parameters', () => {
      const key1 = canonicalizeEvidenceKey({
        url: 'https://example.com/page?utm_source=test&id=123',
      })
      const key2 = canonicalizeEvidenceKey({
        url: 'https://example.com/page?utm_campaign=other&id=456',
      })
      expect(key1).toBe(key2)
      expect(key1).toBe('https://example.com/page')
    })

    it('strips fragments', () => {
      const key1 = canonicalizeEvidenceKey({
        url: 'https://example.com/page#section1',
      })
      const key2 = canonicalizeEvidenceKey({
        url: 'https://example.com/page#section2',
      })
      expect(key1).toBe(key2)
      expect(key1).toBe('https://example.com/page')
    })

    it('lowercases hostname', () => {
      const key1 = canonicalizeEvidenceKey({
        url: 'https://EXAMPLE.COM/page',
      })
      const key2 = canonicalizeEvidenceKey({
        url: 'https://example.com/page',
      })
      expect(key1).toBe(key2)
    })

    it('removes trailing slashes', () => {
      const key1 = canonicalizeEvidenceKey({
        url: 'https://example.com/page/',
      })
      const key2 = canonicalizeEvidenceKey({
        url: 'https://example.com/page',
      })
      expect(key1).toBe(key2)
    })

    it('removes www. prefix', () => {
      const key1 = canonicalizeEvidenceKey({
        url: 'https://www.example.com/page',
      })
      const key2 = canonicalizeEvidenceKey({
        url: 'https://example.com/page',
      })
      expect(key1).toBe(key2)
    })

    it('handles URLs with tracking parameters', () => {
      const key1 = canonicalizeEvidenceKey({
        url: 'https://example.com/page?utm_source=google&utm_medium=cpc&ref=test',
      })
      const key2 = canonicalizeEvidenceKey({
        url: 'https://example.com/page?gclid=123&fbclid=456',
      })
      expect(key1).toBe(key2)
      expect(key1).toBe('https://example.com/page')
    })
  })

  describe('Title fallback', () => {
    it('uses normalized title when URL is missing', () => {
      const key = canonicalizeEvidenceKey({
        url: '',
        title: '  Some Title  ',
      })
      expect(key).toBe('title:some title')
    })

    it('normalizes title (lowercase, trim, collapse whitespace)', () => {
      const key1 = canonicalizeEvidenceKey({
        url: '',
        title: '  Some   Title  ',
      })
      const key2 = canonicalizeEvidenceKey({
        url: '',
        title: 'some title',
      })
      expect(key1).toBe(key2)
      expect(key1).toBe('title:some title')
    })

    it('handles empty title', () => {
      const key = canonicalizeEvidenceKey({
        url: '',
        title: '',
      })
      expect(key).toBe('')
    })
  })

  describe('Error handling', () => {
    it('falls back to title when URL parsing fails', () => {
      const key = canonicalizeEvidenceKey({
        url: 'this is not a url at all',
        title: 'Fallback Title',
      })
      expect(key).toBe('title:fallback title')
    })

    it('returns empty string when both URL and title are invalid', () => {
      const key = canonicalizeEvidenceKey({
        url: 'this is not a url at all',
        title: '',
      })
      expect(key).toBe('')
    })
  })
})

describe('dedupeEvidenceByKey', () => {
  it('removes duplicates by canonical key', () => {
    const items = [
      { url: 'https://example.com/page?utm_source=test', title: 'Page 1' },
      { url: 'https://example.com/page?utm_campaign=other', title: 'Page 2' },
      { url: 'https://example.com/other', title: 'Other Page' },
    ]

    const result = dedupeEvidenceByKey(items)
    expect(result).toHaveLength(2)
    expect(result[0].title).toBe('Page 1') // First occurrence kept
    expect(result[1].title).toBe('Other Page')
  })

  it('handles case-insensitive hostname deduplication', () => {
    const items = [
      { url: 'https://EXAMPLE.COM/page', title: 'Page 1' },
      { url: 'https://example.com/page', title: 'Page 2' },
    ]

    const result = dedupeEvidenceByKey(items)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Page 1')
  })

  it('handles www. prefix deduplication', () => {
    const items = [
      { url: 'https://www.example.com/page', title: 'Page 1' },
      { url: 'https://example.com/page', title: 'Page 2' },
    ]

    const result = dedupeEvidenceByKey(items)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Page 1')
  })

  it('deduplicates by title when URLs are missing', () => {
    const items = [
      { url: '', title: '  Same Title  ' },
      { url: '', title: 'same title' },
      { url: '', title: 'Different Title' },
    ]

    const result = dedupeEvidenceByKey(items)
    expect(result).toHaveLength(2)
  })

  it('skips items with empty keys', () => {
    const items = [
      { url: 'this is not a url at all', title: '' },
      { url: 'https://example.com/page', title: 'Valid Page' },
    ]

    const result = dedupeEvidenceByKey(items)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Valid Page')
  })

  it('returns empty array for empty input', () => {
    const result = dedupeEvidenceByKey([])
    expect(result).toEqual([])
  })

  it('preserves order of first occurrence', () => {
    const items = [
      { url: 'https://example.com/page', title: 'First' },
      { url: 'https://example.com/other', title: 'Second' },
      { url: 'https://example.com/page?ref=test', title: 'Third' }, // duplicate of first
      { url: 'https://example.com/another', title: 'Fourth' },
    ]

    const result = dedupeEvidenceByKey(items)
    expect(result).toHaveLength(3)
    expect(result.map((i) => i.title)).toEqual(['First', 'Second', 'Fourth'])
  })
})

