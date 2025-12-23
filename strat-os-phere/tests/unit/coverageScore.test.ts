/**
 * Tests for coverage scoring
 * Verifies deterministic, evidence-driven scoring based on EvidenceBundle metadata
 */

import { describe, it, expect } from 'vitest'
import { computeCoverageScore } from '@/lib/scoring/coverageScore'
import type { NormalizedEvidenceBundle } from '@/lib/evidence/types'
import { DEFAULT_THRESHOLD } from '@/lib/scoring/thresholds'

describe('computeCoverageScore', () => {
  it('returns Insufficient for null bundle', () => {
    const result = computeCoverageScore(null)
    
    expect(result.isSufficient).toBe(false)
    expect(result.score10).toBeUndefined()
    expect(result.scoreLabel).toBe('Insufficient')
    expect(result.reasons.failedChecks).toContain('No evidence bundle available')
    expect(result.reasons.typeCount).toBe(0)
    expect(result.reasons.totalTypesConsidered).toBe(9) // All evidence types
  })

  it('returns Insufficient for undefined bundle', () => {
    const result = computeCoverageScore(undefined)
    
    expect(result.isSufficient).toBe(false)
    expect(result.score10).toBeUndefined()
    expect(result.scoreLabel).toBe('Insufficient')
  })

  it('returns Insufficient for empty bundle', () => {
    const bundle: NormalizedEvidenceBundle = {
      id: 'test-1',
      projectId: 'project-1',
      createdAt: new Date().toISOString(),
      items: [],
    }
    
    const result = computeCoverageScore(bundle)
    
    expect(result.isSufficient).toBe(false)
    expect(result.score10).toBeUndefined()
    expect(result.scoreLabel).toBe('Insufficient')
    expect(result.reasons.typeCount).toBe(0)
  })

  it('returns Insufficient for bundle with only 1 evidence type', () => {
    const bundle: NormalizedEvidenceBundle = {
      id: 'test-2',
      projectId: 'project-1',
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'item-1',
          type: 'pricing',
          url: 'https://example.com/pricing',
          retrievedAt: new Date().toISOString(),
        },
        {
          id: 'item-2',
          type: 'pricing',
          url: 'https://example.com/pricing2',
          retrievedAt: new Date().toISOString(),
        },
      ],
    }
    
    const result = computeCoverageScore(bundle)
    
    expect(result.isSufficient).toBe(false)
    expect(result.score10).toBeUndefined()
    expect(result.reasons.typeCount).toBe(1)
    expect(result.reasons.failedChecks.some(check => check.includes('evidence types'))).toBe(true)
  })

  it('returns numeric score for bundle with 3+ types, recent, some first-party', () => {
    const now = new Date()
    const recentDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    
    const bundle: NormalizedEvidenceBundle = {
      id: 'test-3',
      projectId: 'project-1',
      createdAt: now.toISOString(),
      primaryUrl: 'https://example.com',
      items: [
        // First-party sources (matching primaryUrl domain)
        {
          id: 'item-1',
          type: 'pricing',
          url: 'https://example.com/pricing',
          domain: 'example.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
        {
          id: 'item-2',
          type: 'docs',
          url: 'https://example.com/docs',
          domain: 'example.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
        {
          id: 'item-3',
          type: 'reviews',
          url: 'https://example.com/reviews',
          domain: 'example.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
        // Third-party sources
        {
          id: 'item-4',
          type: 'jobs',
          url: 'https://thirdparty.com/jobs',
          domain: 'thirdparty.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
        {
          id: 'item-5',
          type: 'changelog',
          url: 'https://thirdparty.com/changelog',
          domain: 'thirdparty.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
        {
          id: 'item-6',
          type: 'blog',
          url: 'https://thirdparty.com/blog',
          domain: 'thirdparty.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
      ],
    }
    
    const result = computeCoverageScore(bundle, {
      competitorDomains: ['example.com'],
    })
    
    expect(result.isSufficient).toBe(true)
    expect(result.score10).toBeDefined()
    expect(typeof result.score10).toBe('number')
    expect(result.score10!).toBeGreaterThanOrEqual(0)
    expect(result.score10!).toBeLessThanOrEqual(10)
    expect(result.scoreLabel).toMatch(/High|Medium|Low/)
    expect(result.reasons.typeCount).toBeGreaterThanOrEqual(3)
    expect(result.reasons.firstPartyCount).toBe(3)
    expect(result.reasons.thirdPartyCount).toBe(3)
    expect(result.reasons.firstPartyRatio).toBeCloseTo(0.5, 1)
    expect(result.reasons.failedChecks).toHaveLength(0)
  })

  it('computes stable result for same inputs', () => {
    const now = new Date()
    const recentDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const bundle: NormalizedEvidenceBundle = {
      id: 'test-4',
      projectId: 'project-1',
      createdAt: now.toISOString(),
      primaryUrl: 'https://example.com',
      items: [
        {
          id: 'item-1',
          type: 'pricing',
          url: 'https://example.com/pricing',
          domain: 'example.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
        {
          id: 'item-2',
          type: 'docs',
          url: 'https://example.com/docs',
          domain: 'example.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
        {
          id: 'item-3',
          type: 'reviews',
          url: 'https://example.com/reviews',
          domain: 'example.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
        {
          id: 'item-4',
          type: 'jobs',
          url: 'https://example.com/jobs',
          domain: 'example.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
        {
          id: 'item-5',
          type: 'changelog',
          url: 'https://example.com/changelog',
          domain: 'example.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
        {
          id: 'item-6',
          type: 'blog',
          url: 'https://example.com/blog',
          domain: 'example.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
      ],
    }
    
    const result1 = computeCoverageScore(bundle, {
      competitorDomains: ['example.com'],
    })
    const result2 = computeCoverageScore(bundle, {
      competitorDomains: ['example.com'],
    })
    
    // Same inputs should produce same results
    expect(result1.isSufficient).toBe(result2.isSufficient)
    expect(result1.score10).toBe(result2.score10)
    expect(result1.scoreLabel).toBe(result2.scoreLabel)
    expect(result1.reasons.typeCount).toBe(result2.reasons.typeCount)
    expect(result1.reasons.firstPartyRatio).toBe(result2.reasons.firstPartyRatio)
    expect(result1.reasons.recencyScore).toBe(result2.reasons.recencyScore)
  })

  it('handles missing dates gracefully', () => {
    const bundle: NormalizedEvidenceBundle = {
      id: 'test-5',
      projectId: 'project-1',
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'item-1',
          type: 'pricing',
          url: 'https://example.com/pricing',
          // No publishedAt or retrievedAt
        },
        {
          id: 'item-2',
          type: 'docs',
          url: 'https://example.com/docs',
          // No publishedAt or retrievedAt
        },
        {
          id: 'item-3',
          type: 'reviews',
          url: 'https://example.com/reviews',
          // No publishedAt or retrievedAt
        },
        {
          id: 'item-4',
          type: 'jobs',
          url: 'https://example.com/jobs',
          // No publishedAt or retrievedAt
        },
        {
          id: 'item-5',
          type: 'changelog',
          url: 'https://example.com/changelog',
          // No publishedAt or retrievedAt
        },
        {
          id: 'item-6',
          type: 'blog',
          url: 'https://example.com/blog',
          // No publishedAt or retrievedAt
        },
      ],
    }
    
    const result = computeCoverageScore(bundle)
    
    // Should still compute a score if we have enough sources and types
    // Recency score will be neutral (0.5) when no dates are available
    expect(result.reasons.recencyScore).toBe(0.5)
    expect(result.reasons.medianAgeDays).toBeUndefined()
  })

  it('respects custom threshold', () => {
    const now = new Date()
    const recentDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const bundle: NormalizedEvidenceBundle = {
      id: 'test-6',
      projectId: 'project-1',
      createdAt: now.toISOString(),
      items: [
        {
          id: 'item-1',
          type: 'pricing',
          url: 'https://example.com/pricing',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
        {
          id: 'item-2',
          type: 'docs',
          url: 'https://example.com/docs',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
      ],
    }
    
    // Custom threshold requiring more sources
    const customThreshold = {
      ...DEFAULT_THRESHOLD,
      minTotalSources: 10,
    }
    
    const result = computeCoverageScore(bundle, {
      threshold: customThreshold,
    })
    
    expect(result.isSufficient).toBe(false)
    expect(result.reasons.failedChecks.some(check => check.includes('10 sources'))).toBe(true)
  })

  it('computes first-party ratio correctly', () => {
    const now = new Date()
    const recentDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const bundle: NormalizedEvidenceBundle = {
      id: 'test-7',
      projectId: 'project-1',
      createdAt: now.toISOString(),
      primaryUrl: 'https://example.com',
      items: [
        // 3 first-party
        {
          id: 'item-1',
          type: 'pricing',
          url: 'https://example.com/pricing',
          domain: 'example.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
        {
          id: 'item-2',
          type: 'docs',
          url: 'https://example.com/docs',
          domain: 'example.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
        {
          id: 'item-3',
          type: 'reviews',
          url: 'https://example.com/reviews',
          domain: 'example.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
        // 3 third-party
        {
          id: 'item-4',
          type: 'jobs',
          url: 'https://thirdparty.com/jobs',
          domain: 'thirdparty.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
        {
          id: 'item-5',
          type: 'changelog',
          url: 'https://thirdparty.com/changelog',
          domain: 'thirdparty.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
        {
          id: 'item-6',
          type: 'blog',
          url: 'https://thirdparty.com/blog',
          domain: 'thirdparty.com',
          publishedAt: recentDate.toISOString(),
          retrievedAt: now.toISOString(),
        },
      ],
    }
    
    const result = computeCoverageScore(bundle, {
      competitorDomains: ['example.com'],
    })
    
    expect(result.reasons.firstPartyCount).toBe(3)
    expect(result.reasons.thirdPartyCount).toBe(3)
    expect(result.reasons.firstPartyRatio).toBeCloseTo(0.5, 1)
  })
})

