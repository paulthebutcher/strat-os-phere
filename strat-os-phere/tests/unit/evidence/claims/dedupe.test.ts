import { describe, it, expect } from 'vitest'
import { dedupeClaims } from '@/lib/evidence/claims/dedupe'
import type { EvidenceClaim } from '@/lib/evidence/claims/types'

function createClaim(
  id: string,
  claimText: string,
  url: string,
  fingerprint: string
): EvidenceClaim {
  return {
    id,
    claimText,
    evidenceType: 'pricing',
    url,
    canonicalUrl: url,
    domain: 'example.com',
    fingerprint,
  }
}

describe('dedupeClaims', () => {
  it('removes exact duplicates by fingerprint', () => {
    const claims: EvidenceClaim[] = [
      createClaim('1', 'Claim text', 'https://example.com/page', 'fp1'),
      createClaim('2', 'Claim text', 'https://example.com/page', 'fp1'), // duplicate
      createClaim('3', 'Different claim', 'https://example.com/other', 'fp2'),
    ]

    const result = dedupeClaims(claims)
    expect(result).toHaveLength(2)
    expect(result.map(c => c.id)).toEqual(['1', '3'])
  })

  it('removes near-duplicates (same URL + similar text)', () => {
    const claims: EvidenceClaim[] = [
      createClaim('1', 'This is a claim about pricing', 'https://example.com/page', 'fp1'),
      createClaim('2', 'This is a claim about pricing and features', 'https://example.com/page', 'fp2'), // similar
      createClaim('3', 'Completely different claim', 'https://example.com/other', 'fp3'),
    ]

    const result = dedupeClaims(claims)
    // Should keep first occurrence of similar claims
    expect(result.length).toBeLessThanOrEqual(2)
  })

  it('keeps claims with same URL but different text', () => {
    const claims: EvidenceClaim[] = [
      createClaim('1', 'First claim', 'https://example.com/page', 'fp1'),
      createClaim('2', 'Second completely different claim', 'https://example.com/page', 'fp2'),
    ]

    const result = dedupeClaims(claims)
    expect(result).toHaveLength(2)
  })

  it('returns empty array for empty input', () => {
    const result = dedupeClaims([])
    expect(result).toEqual([])
  })
})

