/**
 * Tests for evidence citation helpers (formatEvidenceBundleForPrompt, normalizeCitations, etc.)
 */

import { describe, it, expect } from 'vitest'
import {
  formatEvidenceBundleForPrompt,
  normalizeCitations,
  filterCitationsByAllowedUrls,
  mapEvidenceTypeToSourceType,
  type Citation,
} from '@/lib/evidence/citations'
import type { NormalizedEvidenceBundle } from '@/lib/evidence/types'

describe('mapEvidenceTypeToSourceType', () => {
  it('maps evidence types correctly', () => {
    expect(mapEvidenceTypeToSourceType('pricing')).toBe('pricing')
    expect(mapEvidenceTypeToSourceType('reviews')).toBe('reviews')
    expect(mapEvidenceTypeToSourceType('docs')).toBe('docs')
    expect(mapEvidenceTypeToSourceType('changelog')).toBe('changelog')
    expect(mapEvidenceTypeToSourceType('jobs')).toBe('jobs')
    expect(mapEvidenceTypeToSourceType('blog')).toBe('marketing_site')
    expect(mapEvidenceTypeToSourceType('community')).toBe('marketing_site')
    expect(mapEvidenceTypeToSourceType('security')).toBe('docs')
    expect(mapEvidenceTypeToSourceType('other')).toBe('marketing_site')
  })
})

describe('formatEvidenceBundleForPrompt', () => {
  it('formats empty bundle correctly', () => {
    const bundle: NormalizedEvidenceBundle = {
      id: 'test-id',
      projectId: 'test-project',
      createdAt: '2025-01-01T00:00:00Z',
      items: [],
    }

    const result = formatEvidenceBundleForPrompt(bundle)

    expect(result.stats.totalItems).toBe(0)
    expect(result.promptBlock).toBe('No evidence available.')
    expect(result.allowedUrls.size).toBe(0)
    expect(result.stats.firstPartyCount).toBe(0)
  })

  it('formats bundle with items correctly', () => {
    const bundle: NormalizedEvidenceBundle = {
      id: 'test-id',
      projectId: 'test-project',
      createdAt: '2025-01-01T00:00:00Z',
      items: [
        {
          id: 'item-1',
          type: 'pricing',
          url: 'https://example.com/pricing',
          title: 'Pricing Page',
          snippet: 'Our pricing is $10/month',
          domain: 'example.com',
          retrievedAt: '2025-01-01T00:00:00Z',
          publishedAt: '2024-12-01T00:00:00Z',
        },
        {
          id: 'item-2',
          type: 'reviews',
          url: 'https://review-site.com/review',
          title: 'Customer Review',
          snippet: 'Great product!',
          domain: 'review-site.com',
          retrievedAt: '2025-01-01T00:00:00Z',
        },
      ],
    }

    const result = formatEvidenceBundleForPrompt(bundle, {
      primaryDomain: 'example.com',
    })

    expect(result.stats.totalItems).toBe(2)
    expect(result.promptBlock).toContain('Evidence: PRICING')
    expect(result.promptBlock).toContain('Evidence: REVIEWS')
    expect(result.promptBlock).toContain('https://example.com/pricing')
    expect(result.promptBlock).toContain('https://review-site.com/review')
    expect(result.allowedUrls.has('https://example.com/pricing')).toBe(true)
    expect(result.allowedUrls.has('https://review-site.com/review')).toBe(true)
    expect(result.stats.firstPartyCount).toBe(1) // example.com is first-party
  })

  it('limits items per type', () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      id: `item-${i}`,
      type: 'pricing' as const,
      url: `https://example.com/item-${i}`,
      title: `Item ${i}`,
      domain: 'example.com',
    }))

    const bundle: NormalizedEvidenceBundle = {
      id: 'test-id',
      projectId: 'test-project',
      createdAt: '2025-01-01T00:00:00Z',
      items,
    }

    const result = formatEvidenceBundleForPrompt(bundle, {
      maxItemsPerType: 8,
    })

    expect(result.byType.pricing.length).toBe(8)
    expect(result.stats.totalItems).toBe(8)
  })

  it('truncates excerpts', () => {
    const longSnippet = 'a'.repeat(1000)
    const bundle: NormalizedEvidenceBundle = {
      id: 'test-id',
      projectId: 'test-project',
      createdAt: '2025-01-01T00:00:00Z',
      items: [
        {
          id: 'item-1',
          type: 'pricing',
          url: 'https://example.com/pricing',
          snippet: longSnippet,
          domain: 'example.com',
        },
      ],
    }

    const result = formatEvidenceBundleForPrompt(bundle, {
      maxExcerptChars: 500,
    })

    const item = result.byType.pricing[0]
    expect(item.excerpt?.length).toBeLessThanOrEqual(500)
  })
})

describe('normalizeCitations', () => {
  it('handles empty input', () => {
    expect(normalizeCitations(null)).toEqual([])
    expect(normalizeCitations(undefined)).toEqual([])
    expect(normalizeCitations([])).toEqual([])
  })

  it('handles string array (backward compatibility)', () => {
    const result = normalizeCitations([
      'https://example.com/page1',
      'https://example.com/page2',
    ])

    expect(result.length).toBe(2)
    expect(result[0].url).toBe('https://example.com/page1')
    expect(result[0].source_type).toBe('marketing_site') // Default
    expect(result[1].url).toBe('https://example.com/page2')
  })

  it('handles objects with url only', () => {
    const result = normalizeCitations([
      { url: 'https://example.com/page1' },
      { url: 'https://example.com/page2' },
    ])

    expect(result.length).toBe(2)
    expect(result[0].url).toBe('https://example.com/page1')
    expect(result[0].source_type).toBe('marketing_site') // Default
  })

  it('handles full citation objects', () => {
    const result = normalizeCitations([
      {
        url: 'https://example.com/page1',
        title: 'Page 1',
        source_type: 'pricing',
        extracted_at: '2025-01-01T00:00:00Z',
        confidence: 'high',
        domain: 'example.com',
        published_at: '2024-12-01T00:00:00Z',
        source_kind: 'first_party',
      },
    ])

    expect(result.length).toBe(1)
    expect(result[0].url).toBe('https://example.com/page1')
    expect(result[0].title).toBe('Page 1')
    expect(result[0].source_type).toBe('pricing')
    expect(result[0].extracted_at).toBe('2025-01-01T00:00:00Z')
    expect(result[0].confidence).toBe('high')
    expect(result[0].domain).toBe('example.com')
    expect(result[0].published_at).toBe('2024-12-01T00:00:00Z')
    expect(result[0].source_kind).toBe('first_party')
  })

  it('deduplicates by URL', () => {
    const result = normalizeCitations([
      'https://example.com/page1',
      'https://example.com/page1',
      { url: 'https://example.com/page1', title: 'Different' },
    ])

    expect(result.length).toBe(1)
    expect(result[0].url).toBe('https://example.com/page1')
  })

  it('handles confidence as number', () => {
    const result = normalizeCitations([
      {
        url: 'https://example.com/page1',
        confidence: 0.8,
      },
    ])

    expect(result.length).toBe(1)
    expect(result[0].confidence).toBe(0.8)
  })

  it('handles alias fields (retrievedAt, publishedAt)', () => {
    const result = normalizeCitations([
      {
        url: 'https://example.com/page1',
        retrievedAt: '2025-01-01T00:00:00Z',
        publishedAt: '2024-12-01T00:00:00Z',
      },
    ])

    expect(result.length).toBe(1)
    expect(result[0].retrievedAt).toBe('2025-01-01T00:00:00Z')
    expect(result[0].publishedAt).toBe('2024-12-01T00:00:00Z')
  })

  it('skips invalid URLs', () => {
    const result = normalizeCitations([
      'not-a-url',
      { url: 'also-not-a-url' },
      'https://example.com/valid',
    ])

    expect(result.length).toBe(1)
    expect(result[0].url).toBe('https://example.com/valid')
  })

  it('handles mixed input types', () => {
    const result = normalizeCitations([
      'https://example.com/page1',
      { url: 'https://example.com/page2', title: 'Page 2' },
      {
        url: 'https://example.com/page3',
        source_type: 'reviews',
        confidence: 'high',
      },
    ])

    expect(result.length).toBe(3)
    expect(result[0].url).toBe('https://example.com/page1')
    expect(result[1].title).toBe('Page 2')
    expect(result[2].source_type).toBe('reviews')
    expect(result[2].confidence).toBe('high')
  })
})

describe('filterCitationsByAllowedUrls', () => {
  it('filters citations to only allowed URLs', () => {
    const citations: Citation[] = [
      { url: 'https://example.com/page1', source_type: 'pricing' },
      { url: 'https://example.com/page2', source_type: 'reviews' },
      { url: 'https://other.com/page3', source_type: 'docs' },
    ]

    const allowedUrls = new Set([
      'https://example.com/page1',
      'https://example.com/page2',
    ])

    const result = filterCitationsByAllowedUrls(citations, allowedUrls)

    expect(result.length).toBe(2)
    expect(result[0].url).toBe('https://example.com/page1')
    expect(result[1].url).toBe('https://example.com/page2')
  })

  it('handles empty allowed set', () => {
    const citations: Citation[] = [
      { url: 'https://example.com/page1', source_type: 'pricing' },
    ]

    const allowedUrls = new Set<string>()

    const result = filterCitationsByAllowedUrls(citations, allowedUrls)

    expect(result.length).toBe(0)
  })

  it('handles empty citations', () => {
    const citations: Citation[] = []

    const allowedUrls = new Set(['https://example.com/page1'])

    const result = filterCitationsByAllowedUrls(citations, allowedUrls)

    expect(result.length).toBe(0)
  })
})

