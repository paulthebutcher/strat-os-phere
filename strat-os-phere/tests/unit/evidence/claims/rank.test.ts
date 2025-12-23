import { describe, it, expect } from 'vitest'
import { rankClaims } from '@/lib/evidence/claims/rank'
import type { EvidenceClaim } from '@/lib/evidence/claims/types'

function createClaim(
  id: string,
  evidenceType: EvidenceClaim['evidenceType'],
  publishedAt?: string,
  retrievedAt?: string,
  confidence?: EvidenceClaim['confidence'],
  domain = 'example.com'
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
    retrievedAt: retrievedAt || null,
    confidence,
  }
}

describe('rankClaims', () => {
  it('ranks recent claims higher', () => {
    const now = new Date()
    const recent = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    const old = new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000) // 200 days ago

    const claims: EvidenceClaim[] = [
      createClaim('old', 'pricing', old.toISOString()),
      createClaim('recent', 'pricing', recent.toISOString()),
    ]

    const result = rankClaims(claims)
    expect(result[0].id).toBe('recent')
  })

  it('ranks first-party claims higher', () => {
    const claims: EvidenceClaim[] = [
      createClaim('third-party', 'pricing', undefined, undefined, undefined, 'thirdparty.com'),
      createClaim('first-party', 'pricing', undefined, undefined, undefined, 'competitor.com'),
    ]

    const result = rankClaims(claims, ['competitor.com'])
    expect(result[0].id).toBe('first-party')
  })

  it('ranks high-value types higher', () => {
    const claims: EvidenceClaim[] = [
      createClaim('blog', 'blog'),
      createClaim('pricing', 'pricing'),
    ]

    const result = rankClaims(claims)
    expect(result[0].id).toBe('pricing')
  })

  it('ranks high confidence claims higher', () => {
    const claims: EvidenceClaim[] = [
      createClaim('low', 'pricing', undefined, undefined, 'low'),
      createClaim('high', 'pricing', undefined, undefined, 'high'),
    ]

    const result = rankClaims(claims)
    expect(result[0].id).toBe('high')
  })

  it('handles claims without dates', () => {
    const claims: EvidenceClaim[] = [
      createClaim('no-date', 'pricing'),
    ]

    const result = rankClaims(claims)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('no-date')
  })
})

