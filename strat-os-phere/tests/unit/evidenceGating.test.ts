import { describe, it, expect } from 'vitest'
import {
  summarizeCitations,
  computeCoverage,
  computeConfidence,
  shouldShowNumericScore,
  directionalFromScore,
  gateScore,
  type CoverageStatus,
  type ConfidenceLevel,
  type DirectionalSignal,
} from '@/lib/scoring/evidenceGating'

describe('summarizeCitations', () => {
  it('handles empty citations', () => {
    const result = summarizeCitations([])
    expect(result.totalCitations).toBe(0)
    expect(result.sourceTypes).toEqual([])
    expect(result.newestCitationDate).toBeNull()
    expect(result.oldestCitationDate).toBeNull()
  })

  it('summarizes citations with source types', () => {
    const citations = [
      { url: 'https://example.com', source_type: 'pricing' },
      { url: 'https://example2.com', sourceType: 'reviews' },
      { url: 'https://example3.com', source_type: 'pricing' },
    ]
    const result = summarizeCitations(citations)
    expect(result.totalCitations).toBe(3)
    expect(result.sourceTypes).toContain('pricing')
    expect(result.sourceTypes).toContain('reviews')
  })

  it('handles citations without dates', () => {
    const citations = [
      { url: 'https://example.com', source_type: 'pricing' },
      { url: 'https://example2.com', sourceType: 'reviews' },
    ]
    const result = summarizeCitations(citations)
    expect(result.newestCitationDate).toBeNull()
    expect(result.oldestCitationDate).toBeNull()
  })

  it('extracts and sorts dates correctly', () => {
    const citations = [
      { url: 'https://example.com', source_type: 'pricing', date: '2024-01-10T00:00:00Z' },
      { url: 'https://example2.com', sourceType: 'reviews', date: '2024-01-20T00:00:00Z' },
      { url: 'https://example3.com', source_type: 'docs', date: '2024-01-15T00:00:00Z' },
    ]
    const result = summarizeCitations(citations)
    expect(result.newestCitationDate).toBe('2024-01-20T00:00:00.000Z')
    expect(result.oldestCitationDate).toBe('2024-01-10T00:00:00.000Z')
  })

  it('handles mixed date field names', () => {
    const citations = [
      { url: 'https://example.com', source_type: 'pricing', published_at: '2024-01-10T00:00:00Z' },
      { url: 'https://example2.com', sourceType: 'reviews', extracted_at: '2024-01-20T00:00:00Z' },
    ]
    const result = summarizeCitations(citations)
    expect(result.newestCitationDate).toBeTruthy()
    expect(result.oldestCitationDate).toBeTruthy()
  })

  it('computes evidence window days', () => {
    const citations = [
      { url: 'https://example.com', source_type: 'pricing', date: '2024-01-10T00:00:00Z' },
      { url: 'https://example2.com', sourceType: 'reviews', date: '2024-01-20T00:00:00Z' },
    ]
    const result = summarizeCitations(citations)
    expect(result.evidenceWindowDays).toBe(10)
  })
})

describe('computeCoverage', () => {
  it('returns insufficient for < 2 citations', () => {
    const summary = {
      totalCitations: 1,
      sourceTypes: ['pricing'],
      newestCitationDate: null,
      oldestCitationDate: null,
    }
    expect(computeCoverage(summary)).toBe('insufficient')
  })

  it('returns insufficient for < 2 source types', () => {
    const summary = {
      totalCitations: 3,
      sourceTypes: ['pricing'],
      newestCitationDate: null,
      oldestCitationDate: null,
    }
    expect(computeCoverage(summary)).toBe('insufficient')
  })

  it('returns partial for 2+ citations and 2 source types', () => {
    const summary = {
      totalCitations: 2,
      sourceTypes: ['pricing', 'reviews'],
      newestCitationDate: null,
      oldestCitationDate: null,
    }
    expect(computeCoverage(summary)).toBe('partial')
  })

  it('returns complete for 4+ citations and 3+ source types', () => {
    const summary = {
      totalCitations: 4,
      sourceTypes: ['pricing', 'reviews', 'docs'],
      newestCitationDate: null,
      oldestCitationDate: null,
    }
    expect(computeCoverage(summary)).toBe('complete')
  })

  it('returns complete for 5+ citations and 3+ source types', () => {
    const summary = {
      totalCitations: 10,
      sourceTypes: ['pricing', 'reviews', 'docs', 'changelog'],
      newestCitationDate: null,
      oldestCitationDate: null,
    }
    expect(computeCoverage(summary)).toBe('complete')
  })
})

describe('computeConfidence', () => {
  it('returns low by default', () => {
    const summary = {
      totalCitations: 1,
      sourceTypes: ['pricing'],
      newestCitationDate: null,
      oldestCitationDate: null,
    }
    expect(computeConfidence(summary)).toBe('low')
  })

  it('returns moderate when coverage is complete', () => {
    const summary = {
      totalCitations: 4,
      sourceTypes: ['pricing', 'reviews', 'docs'],
      newestCitationDate: null,
      oldestCitationDate: null,
    }
    expect(computeConfidence(summary)).toBe('moderate')
  })

  it('returns moderate for 4+ citations with recent date (within 120 days)', () => {
    const now = new Date()
    const recentDate = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000) // 100 days ago
    
    const summary = {
      totalCitations: 4,
      sourceTypes: ['pricing', 'reviews'],
      newestCitationDate: recentDate.toISOString(),
      oldestCitationDate: null,
    }
    expect(computeConfidence(summary)).toBe('moderate')
  })

  it('returns high for 8+ citations, 4+ types, recent date (within 60 days)', () => {
    const now = new Date()
    const recentDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    
    const summary = {
      totalCitations: 8,
      sourceTypes: ['pricing', 'reviews', 'docs', 'changelog'],
      newestCitationDate: recentDate.toISOString(),
      oldestCitationDate: null,
    }
    expect(computeConfidence(summary)).toBe('high')
  })

  it('does not throw on invalid dates', () => {
    const summary = {
      totalCitations: 8,
      sourceTypes: ['pricing', 'reviews', 'docs', 'changelog'],
      newestCitationDate: 'invalid-date',
      oldestCitationDate: null,
    }
    expect(() => computeConfidence(summary)).not.toThrow()
    expect(computeConfidence(summary)).toBe('low') // Falls back to low
  })

  it('returns low for old dates even with many citations', () => {
    const oldDate = new Date('2020-01-01').toISOString()
    
    const summary = {
      totalCitations: 8,
      sourceTypes: ['pricing', 'reviews', 'docs', 'changelog'],
      newestCitationDate: oldDate,
      oldestCitationDate: null,
    }
    expect(computeConfidence(summary)).toBe('low')
  })
})

describe('shouldShowNumericScore', () => {
  it('returns true only for complete coverage with moderate/high confidence', () => {
    expect(shouldShowNumericScore('complete', 'moderate')).toBe(true)
    expect(shouldShowNumericScore('complete', 'high')).toBe(true)
    expect(shouldShowNumericScore('complete', 'low')).toBe(false)
    expect(shouldShowNumericScore('partial', 'moderate')).toBe(false)
    expect(shouldShowNumericScore('partial', 'high')).toBe(false)
    expect(shouldShowNumericScore('insufficient', 'low')).toBe(false)
  })
})

describe('directionalFromScore', () => {
  it('returns strong for scores >= 7', () => {
    expect(directionalFromScore(7)).toBe('strong')
    expect(directionalFromScore(8.5)).toBe('strong')
    expect(directionalFromScore(10)).toBe('strong')
  })

  it('returns mixed for scores 4-6.99', () => {
    expect(directionalFromScore(4)).toBe('mixed')
    expect(directionalFromScore(5.5)).toBe('mixed')
    expect(directionalFromScore(6.99)).toBe('mixed')
  })

  it('returns weak for scores 1-3.99', () => {
    expect(directionalFromScore(1)).toBe('weak')
    expect(directionalFromScore(2.5)).toBe('weak')
    expect(directionalFromScore(3.99)).toBe('weak')
  })

  it('returns unclear for null/undefined', () => {
    expect(directionalFromScore(null)).toBe('unclear')
    expect(directionalFromScore(undefined)).toBe('unclear')
  })

  it('returns unclear for scores < 1', () => {
    expect(directionalFromScore(0)).toBe('unclear')
    expect(directionalFromScore(0.5)).toBe('unclear')
  })
})

describe('gateScore', () => {
  it('hides numeric score when coverage is insufficient', () => {
    const citations = [
      { url: 'https://example.com', source_type: 'pricing' },
    ]
    const result = gateScore(7.5, citations)
    expect(result.showNumeric).toBe(false)
    expect(result.score).toBeNull()
    expect(result.coverage).toBe('insufficient')
    expect(result.directional).toBe('strong') // Based on original score
  })

  it('hides numeric score when coverage is partial', () => {
    const citations = [
      { url: 'https://example.com', source_type: 'pricing' },
      { url: 'https://example2.com', sourceType: 'reviews' },
    ]
    const result = gateScore(6.0, citations)
    expect(result.showNumeric).toBe(false)
    expect(result.score).toBeNull()
    expect(result.coverage).toBe('partial')
    expect(result.directional).toBe('mixed')
  })

  it('shows numeric score when coverage is complete and confidence is moderate', () => {
    const now = new Date()
    const recentDate = new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000)
    
    const citations = [
      { url: 'https://example.com', source_type: 'pricing', date: recentDate.toISOString() },
      { url: 'https://example2.com', sourceType: 'reviews', date: recentDate.toISOString() },
      { url: 'https://example3.com', source_type: 'docs', date: recentDate.toISOString() },
      { url: 'https://example4.com', sourceType: 'changelog', date: recentDate.toISOString() },
    ]
    const result = gateScore(7.5, citations)
    expect(result.showNumeric).toBe(true)
    expect(result.score).toBe(7.5)
    expect(result.coverage).toBe('complete')
    expect(result.confidence).toBe('moderate')
  })

  it('shows numeric score when coverage is complete and confidence is high', () => {
    const now = new Date()
    const recentDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const citations = Array.from({ length: 8 }, (_, i) => ({
      url: `https://example${i}.com`,
      sourceType: ['pricing', 'reviews', 'docs', 'changelog'][i % 4],
      date: recentDate.toISOString(),
    }))
    
    const result = gateScore(8.0, citations)
    expect(result.showNumeric).toBe(true)
    expect(result.score).toBe(8.0)
    expect(result.coverage).toBe('complete')
    expect(result.confidence).toBe('high')
  })

  it('computes directional from original score when numeric is hidden', () => {
    const citations = [
      { url: 'https://example.com', source_type: 'pricing' },
    ]
    const result = gateScore(2.0, citations)
    expect(result.showNumeric).toBe(false)
    expect(result.score).toBeNull()
    expect(result.directional).toBe('weak')
  })

  it('returns unclear directional when score is null', () => {
    const citations = [
      { url: 'https://example.com', source_type: 'pricing' },
    ]
    const result = gateScore(null, citations)
    expect(result.showNumeric).toBe(false)
    expect(result.score).toBeNull()
    expect(result.directional).toBe('unclear')
  })

  it('handles citations without dates', () => {
    const citations = [
      { url: 'https://example.com', source_type: 'pricing' },
      { url: 'https://example2.com', sourceType: 'reviews' },
      { url: 'https://example3.com', source_type: 'docs' },
      { url: 'https://example4.com', sourceType: 'changelog' },
    ]
    const result = gateScore(6.0, citations)
    // Should still show numeric if coverage is complete (dates not required for coverage)
    expect(result.showNumeric).toBe(true)
    expect(result.coverage).toBe('complete')
    expect(result.confidence).toBe('moderate') // Complete coverage gives moderate
  })
})

