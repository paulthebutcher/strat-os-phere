import { describe, it, expect } from 'vitest'
import { compressOpportunities, type OpportunityLike } from './opportunityCompression'

describe('compressOpportunities', () => {
  it('handles empty array', () => {
    const result = compressOpportunities([])
    expect(result.items).toEqual([])
    expect(result.stats.original).toBe(0)
    expect(result.stats.merged).toBe(0)
  })

  it('handles null/undefined', () => {
    const result = compressOpportunities(null as any)
    expect(result.items).toEqual([])
  })

  it('preserves non-duplicate opportunities', () => {
    const opportunities: OpportunityLike[] = [
      { id: '1', title: 'Build AI feature', score: 80 },
      { id: '2', title: 'Improve pricing', score: 70 },
    ]
    const result = compressOpportunities(opportunities)
    expect(result.items.length).toBe(2)
    expect(result.stats.merged).toBe(0)
  })

  it('merges obvious duplicates', () => {
    const opportunities: OpportunityLike[] = [
      { id: '1', title: 'Build AI feature', score: 80, citations: [{ url: 'https://example.com' }] },
      { id: '2', title: 'Build AI feature', score: 75, citations: [{ url: 'https://example2.com' }] },
    ]
    const result = compressOpportunities(opportunities)
    expect(result.items.length).toBe(1)
    expect(result.stats.merged).toBe(1)
    expect(result.items[0].mergedCount).toBe(2)
  })

  it('keeps highest score item as base', () => {
    const opportunities: OpportunityLike[] = [
      { id: '1', title: 'Build AI feature', score: 70 },
      { id: '2', title: 'Build AI feature', score: 90 },
    ]
    const result = compressOpportunities(opportunities)
    expect(result.items[0].score).toBe(90)
  })

  it('preserves citations and deduplicates by URL', () => {
    const opportunities: OpportunityLike[] = [
      {
        id: '1',
        title: 'Build AI feature',
        citations: [
          { url: 'https://example.com' },
          { url: 'https://example.com' }, // Duplicate
        ],
      },
      {
        id: '2',
        title: 'Build AI feature',
        citations: [{ url: 'https://example2.com' }],
      },
    ]
    const result = compressOpportunities(opportunities)
    expect(result.items[0].mergedCitations.length).toBe(2) // Deduplicated
  })

  it('is deterministic', () => {
    const opportunities: OpportunityLike[] = [
      { id: '1', title: 'Build AI feature', score: 80 },
      { id: '2', title: 'Build AI feature', score: 75 },
      { id: '3', title: 'Improve pricing', score: 70 },
    ]
    const result1 = compressOpportunities(opportunities)
    const result2 = compressOpportunities(opportunities)
    expect(result1.items.length).toBe(result2.items.length)
    expect(result1.stats).toEqual(result2.stats)
  })

  it('handles opportunities without IDs', () => {
    const opportunities: OpportunityLike[] = [
      { title: 'Build AI feature', score: 80 },
      { title: 'Build AI feature', score: 75 },
    ]
    const result = compressOpportunities(opportunities)
    expect(result.items.length).toBe(1)
    expect(result.items[0].mergedFromIds.length).toBeGreaterThan(0)
  })
})

