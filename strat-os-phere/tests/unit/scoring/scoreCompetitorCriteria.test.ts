import { describe, it, expect } from 'vitest'
import { scoreCompetitorCriteria } from '@/lib/scoring/scoreCompetitorCriteria'
import type { NormalizedCitation } from '@/lib/results/evidence'

describe('scoreCompetitorCriteria', () => {
  it('should return unscored when no citations provided', () => {
    const result = scoreCompetitorCriteria([])
    
    expect(result.status).toBe('unscored')
    expect(result.value).toBeNull()
    expect(result.reason).toBe('insufficient_evidence')
    expect(result.evidenceCount).toBe(0)
    expect(result.sourceTypes).toEqual([])
  })

  it('should return scored when citations exist', () => {
    const citations: NormalizedCitation[] = [
      { url: 'https://example.com/1', sourceType: 'docs', date: new Date() },
      { url: 'https://example.com/2', sourceType: 'pricing', date: new Date() },
      { url: 'https://example.com/3', sourceType: 'reviews', date: new Date() },
    ]
    
    const result = scoreCompetitorCriteria(citations)
    
    expect(result.status).toBe('scored')
    expect(result.value).not.toBeNull()
    expect(result.value).toBeGreaterThanOrEqual(0)
    expect(result.value).toBeLessThanOrEqual(10)
    expect(result.evidenceCount).toBe(3)
    expect(result.sourceTypes.length).toBe(3)
  })

  it('should handle missing dates but still score', () => {
    const citations: NormalizedCitation[] = [
      { url: 'https://example.com/1', sourceType: 'docs' },
      { url: 'https://example.com/2', sourceType: 'pricing' },
    ]
    
    const result = scoreCompetitorCriteria(citations)
    
    expect(result.status).toBe('scored')
    expect(result.value).not.toBeNull()
    expect(result.newestEvidenceAt).toBeUndefined()
    expect(result.oldestEvidenceAt).toBeUndefined()
    // Recency score should be 0 when dates are missing
    // With 2 citations: coverageScore=2, recencyScore=0, diversityScore=1 = 3.0
    expect(result.value).toBe(3.0)
  })

  it('should compute higher scores with more citations', () => {
    const fewCitations: NormalizedCitation[] = [
      { url: 'https://example.com/1', sourceType: 'docs', date: new Date() },
    ]
    
    const manyCitations: NormalizedCitation[] = Array.from({ length: 12 }, (_, i) => ({
      url: `https://example.com/${i}`,
      sourceType: i % 3 === 0 ? 'docs' : i % 3 === 1 ? 'pricing' : 'reviews',
      date: new Date(),
    }))
    
    const fewResult = scoreCompetitorCriteria(fewCitations)
    const manyResult = scoreCompetitorCriteria(manyCitations)
    
    expect(manyResult.value).toBeGreaterThan(fewResult.value!)
  })

  it('should reward recent evidence', () => {
    const now = new Date()
    const recentDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    const oldDate = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000) // 100 days ago
    
    const recentCitations: NormalizedCitation[] = [
      { url: 'https://example.com/1', sourceType: 'docs', date: recentDate },
      { url: 'https://example.com/2', sourceType: 'pricing', date: recentDate },
    ]
    
    const oldCitations: NormalizedCitation[] = [
      { url: 'https://example.com/1', sourceType: 'docs', date: oldDate },
      { url: 'https://example.com/2', sourceType: 'pricing', date: oldDate },
    ]
    
    const recentResult = scoreCompetitorCriteria(recentCitations)
    const oldResult = scoreCompetitorCriteria(oldCitations)
    
    // Recent should score higher due to recencyScore
    expect(recentResult.value).toBeGreaterThan(oldResult.value!)
  })

  it('should reward source diversity', () => {
    const singleType: NormalizedCitation[] = [
      { url: 'https://example.com/1', sourceType: 'docs', date: new Date() },
      { url: 'https://example.com/2', sourceType: 'docs', date: new Date() },
      { url: 'https://example.com/3', sourceType: 'docs', date: new Date() },
    ]
    
    const diverseTypes: NormalizedCitation[] = [
      { url: 'https://example.com/1', sourceType: 'docs', date: new Date() },
      { url: 'https://example.com/2', sourceType: 'pricing', date: new Date() },
      { url: 'https://example.com/3', sourceType: 'reviews', date: new Date() },
    ]
    
    const singleResult = scoreCompetitorCriteria(singleType)
    const diverseResult = scoreCompetitorCriteria(diverseTypes)
    
    // Diverse should score higher due to diversityScore
    expect(diverseResult.value).toBeGreaterThan(singleResult.value!)
  })

  it('should clamp scores to 0-10 range', () => {
    // Create citations that would theoretically exceed 10
    const manyRecentDiverseCitations: NormalizedCitation[] = Array.from({ length: 20 }, (_, i) => ({
      url: `https://example.com/${i}`,
      sourceType: ['docs', 'pricing', 'reviews', 'jobs', 'changelog'][i % 5],
      date: new Date(), // Very recent
    }))
    
    const result = scoreCompetitorCriteria(manyRecentDiverseCitations)
    
    expect(result.value).toBeLessThanOrEqual(10)
    expect(result.value).toBeGreaterThanOrEqual(0)
  })
})

