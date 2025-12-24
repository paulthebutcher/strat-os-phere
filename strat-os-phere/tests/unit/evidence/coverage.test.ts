import { describe, it, expect } from 'vitest'
import { computeEvidenceCoverage } from '@/lib/evidence'
import type { EvidenceClaim, ClaimsByType } from '@/lib/evidence'

function createClaim(
  id: string,
  evidenceType: EvidenceClaim['evidenceType'],
  domain = 'example.com',
  publishedAt?: string
): EvidenceClaim {
  return {
    id,
    claimText: `Claim ${id}`,
    evidenceType,
    url: `https://${domain}/page`,
    canonicalUrl: `https://${domain}/page`,
    domain,
    fingerprint: `fp-${id}`,
    publishedAt: publishedAt || null,
    retrievedAt: publishedAt || null,
  }
}

describe('computeEvidenceCoverage', () => {
  it('returns "Insufficient" when below MVC', () => {
    const claimsByType: ClaimsByType = {
      pricing: [],
      docs: [],
      reviews: [],
      jobs: [],
      changelog: [],
      blog: [createClaim('1', 'blog')],
      community: [],
      security: [],
      other: [],
    }

    const coverage = computeEvidenceCoverage(claimsByType)
    expect(coverage.overallConfidenceLabel).toBe('Insufficient')
  })

  it('returns "High" when MVC met and good coverage', () => {
    const now = new Date()
    const recent = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()

    const claimsByType: ClaimsByType = {
      pricing: [createClaim('1', 'pricing', 'competitor.com', recent)],
      docs: [createClaim('2', 'docs', 'competitor.com', recent), createClaim('3', 'docs', 'competitor.com', recent)],
      reviews: [createClaim('4', 'reviews', 'competitor.com', recent)],
      jobs: [],
      changelog: [],
      blog: [],
      community: [],
      security: [],
      other: [],
    }

    const coverage = computeEvidenceCoverage(claimsByType, ['competitor.com'])
    expect(coverage.overallConfidenceLabel).toBe('High')
  })

  it('computes first-party ratio correctly', () => {
    const claimsByType: ClaimsByType = {
      pricing: [
        createClaim('1', 'pricing', 'competitor.com'),
        createClaim('2', 'pricing', 'thirdparty.com'),
      ],
      docs: [],
      reviews: [],
      jobs: [],
      changelog: [],
      blog: [],
      community: [],
      security: [],
      other: [],
    }

    const coverage = computeEvidenceCoverage(claimsByType, ['competitor.com'])
    expect(coverage.firstPartyRatio).toBe(0.5)
  })

  it('identifies coverage gaps', () => {
    const claimsByType: ClaimsByType = {
      pricing: [createClaim('1', 'pricing')],
      docs: [],
      reviews: [],
      jobs: [],
      changelog: [],
      blog: [],
      community: [],
      security: [],
      other: [],
    }

    const coverage = computeEvidenceCoverage(claimsByType)
    expect(coverage.gaps.length).toBeGreaterThan(0)
    expect(coverage.gaps.some(g => g.type === 'docs')).toBe(true)
  })

  it('returns empty coverage for no claims', () => {
    const claimsByType: ClaimsByType = {
      pricing: [],
      docs: [],
      reviews: [],
      jobs: [],
      changelog: [],
      blog: [],
      community: [],
      security: [],
      other: [],
    }

    const coverage = computeEvidenceCoverage(claimsByType)
    expect(coverage.typesPresent).toEqual([])
    expect(coverage.overallConfidenceLabel).toBe('Insufficient')
  })
})

