import { describe, it, expect } from 'vitest'
import { computeEvidenceCoverage } from './coverage'

describe('computeEvidenceCoverage', () => {
  it('handles empty input', () => {
    const result = computeEvidenceCoverage(null)
    expect(result.totalCitations).toBe(0)
    expect(result.sourceTypes).toEqual([])
    expect(result.recencyLabel).toBe('Unknown')
    expect(result.coverageScore).toBe(0)
  })

  it('handles undefined input', () => {
    const result = computeEvidenceCoverage(undefined)
    expect(result.totalCitations).toBe(0)
    expect(result.coverageNotes.length).toBeGreaterThan(0)
  })

  it('counts citations from top-level array', () => {
    const input = {
      citations: [
        { url: 'https://example.com', source_type: 'pricing', date: '2024-01-01' },
        { url: 'https://example2.com', source_type: 'reviews', date: '2024-01-02' },
      ],
    }
    const result = computeEvidenceCoverage(input)
    expect(result.totalCitations).toBe(2)
    expect(result.sourceTypes.length).toBe(2)
  })

  it('detects source types', () => {
    const input = {
      opportunities: [
        {
          citations: [
            { url: 'https://example.com', source_type: 'pricing' },
            { url: 'https://example2.com', source_type: 'pricing' },
            { url: 'https://example3.com', source_type: 'reviews' },
          ],
        },
      ],
    }
    const result = computeEvidenceCoverage(input)
    expect(result.sourceTypes).toEqual([
      { type: 'pricing', count: 2 },
      { type: 'reviews', count: 1 },
    ])
  })

  it('computes recency label correctly', () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const input = {
      citations: [
        { url: 'https://example.com', source_type: 'pricing', date: yesterday.toISOString() },
      ],
    }
    const result = computeEvidenceCoverage(input)
    expect(result.recencyLabel).toBe('Last 7 days')
  })

  it('computes coverage score', () => {
    const input = {
      citations: [
        { url: 'https://example.com', source_type: 'pricing', date: new Date().toISOString() },
        { url: 'https://example2.com', source_type: 'reviews', date: new Date().toISOString() },
        { url: 'https://example3.com', source_type: 'changelog', date: new Date().toISOString() },
      ],
    }
    const result = computeEvidenceCoverage(input)
    expect(result.coverageScore).toBeGreaterThan(0)
    expect(result.coverageScore).toBeLessThanOrEqual(100)
  })

  it('generates coverage notes for low coverage', () => {
    const input = {
      citations: [{ url: 'https://example.com', source_type: 'pricing' }],
    }
    const result = computeEvidenceCoverage(input)
    expect(result.coverageNotes.length).toBeGreaterThan(0)
  })
})

