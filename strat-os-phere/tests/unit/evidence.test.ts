import { describe, it, expect } from 'vitest'
import {
  extractCitationsFromArtifact,
  extractCitationsFromAllArtifacts,
  normalizeCitation,
  aggregateEvidenceFromCitations,
} from '@/lib/results/evidence'

describe('extractCitationsFromArtifact', () => {
  it('handles empty input', () => {
    const result = extractCitationsFromArtifact(null)
    expect(result).toEqual([])
  })

  it('extracts citations from top-level array', () => {
    const input = {
      citations: [
        { url: 'https://example.com', source_type: 'pricing' },
        { url: 'https://example2.com', source_type: 'reviews' },
      ],
    }
    const result = extractCitationsFromArtifact(input)
    expect(result.length).toBe(2)
    expect(result[0].url).toBe('https://example.com')
    expect(result[0].sourceType).toBe('pricing')
  })

  it('extracts citations from meta.citations', () => {
    const input = {
      meta: {
        citations: [
          { url: 'https://example.com', source_type: 'pricing' },
        ],
      },
    }
    const result = extractCitationsFromArtifact(input)
    expect(result.length).toBe(1)
    expect(result[0].url).toBe('https://example.com')
  })

  it('extracts citations from opportunities array (v3 shape)', () => {
    const input = {
      opportunities: [
        {
          citations: [
            { url: 'https://example.com', source_type: 'pricing' },
            { url: 'https://example2.com', source_type: 'reviews' },
          ],
        },
      ],
    }
    const result = extractCitationsFromArtifact(input)
    expect(result.length).toBe(2)
  })

  it('extracts citations from opportunities[].evidence_citations (v2 shape)', () => {
    const input = {
      opportunities: [
        {
          evidence_citations: [
            { url: 'https://example.com', source_type: 'pricing' },
          ],
        },
      ],
    }
    const result = extractCitationsFromArtifact(input)
    expect(result.length).toBe(1)
    expect(result[0].url).toBe('https://example.com')
  })

  it('extracts citations from proof_points', () => {
    const input = {
      opportunities: [
        {
          proof_points: [
            {
              citations: [
                { url: 'https://example.com', source_type: 'pricing' },
              ],
            },
          ],
        },
      ],
    }
    const result = extractCitationsFromArtifact(input)
    expect(result.length).toBe(1)
  })

  it('extracts citations from jobs_to_be_done evidence', () => {
    const input = {
      jobs: [
        {
          evidence: [
            { citation: 'https://example.com' },
            { citation: 'https://example2.com' },
          ],
        },
      ],
    }
    const result = extractCitationsFromArtifact(input)
    expect(result.length).toBe(2)
    expect(result[0].url).toBe('https://example.com')
    expect(result[0].sourceType).toBe('jobs')
  })

  it('handles mixed casing (source_type vs sourceType)', () => {
    const input = {
      citations: [
        { url: 'https://example.com', source_type: 'pricing' },
        { url: 'https://example2.com', sourceType: 'reviews' },
      ],
    }
    const result = extractCitationsFromArtifact(input)
    expect(result.length).toBe(2)
    expect(result[0].sourceType).toBe('pricing')
    expect(result[1].sourceType).toBe('reviews')
  })

  it('counts citations even when dates are missing', () => {
    const input = {
      citations: [
        { url: 'https://example.com', source_type: 'pricing' },
        { url: 'https://example2.com', source_type: 'reviews' },
      ],
    }
    const result = extractCitationsFromArtifact(input)
    expect(result.length).toBe(2)
    expect(result[0].date).toBeUndefined()
    expect(result[1].date).toBeUndefined()
  })

  it('deduplicates citations by URL', () => {
    const input = {
      citations: [
        { url: 'https://example.com', source_type: 'pricing' },
        { url: 'https://example.com', source_type: 'reviews' }, // Duplicate URL
      ],
    }
    const result = extractCitationsFromArtifact(input)
    expect(result.length).toBe(1)
  })
})

describe('normalizeCitation', () => {
  it('normalizes citation with source_type', () => {
    const citation = { url: 'https://example.com', source_type: 'pricing' }
    const result = normalizeCitation(citation)
    expect(result).not.toBeNull()
    expect(result?.url).toBe('https://example.com')
    expect(result?.sourceType).toBe('pricing')
  })

  it('normalizes citation with sourceType (camelCase)', () => {
    const citation = { url: 'https://example.com', sourceType: 'reviews' }
    const result = normalizeCitation(citation)
    expect(result).not.toBeNull()
    expect(result?.sourceType).toBe('reviews')
  })

  it('handles missing date', () => {
    const citation = { url: 'https://example.com', source_type: 'pricing' }
    const result = normalizeCitation(citation)
    expect(result).not.toBeNull()
    expect(result?.date).toBeUndefined()
  })

  it('handles date in various formats', () => {
    const dateStr = '2024-01-15T00:00:00Z'
    const citation = {
      url: 'https://example.com',
      source_type: 'pricing',
      date: dateStr,
    }
    const result = normalizeCitation(citation)
    expect(result).not.toBeNull()
    expect(result?.date).toBeInstanceOf(Date)
  })
})

describe('aggregateEvidenceFromCitations', () => {
  it('handles empty citations', () => {
    const result = aggregateEvidenceFromCitations([])
    expect(result.totalCitations).toBe(0)
    expect(result.sourceTypes).toEqual([])
    expect(result.newestCitationDate).toBeNull()
    expect(result.confidenceLevel).toBe('low')
  })

  it('aggregates citations correctly', () => {
    const citations = [
      {
        url: 'https://example.com',
        sourceType: 'pricing',
        date: new Date('2024-01-15'),
      },
      {
        url: 'https://example2.com',
        sourceType: 'reviews',
        date: new Date('2024-01-20'),
      },
      {
        url: 'https://example3.com',
        sourceType: 'pricing',
        date: new Date('2024-01-10'),
      },
    ]
    const result = aggregateEvidenceFromCitations(citations)
    expect(result.totalCitations).toBe(3)
    expect(result.sourceTypes).toContain('pricing')
    expect(result.sourceTypes).toContain('reviews')
    expect(result.newestCitationDate).toEqual(new Date('2024-01-20'))
  })

  it('determines high confidence with 10+ citations, 3+ types, recent date', () => {
    const now = new Date()
    const citations = Array.from({ length: 12 }, (_, i) => ({
      url: `https://example${i}.com`,
      sourceType: ['pricing', 'reviews', 'changelog', 'docs'][i % 4],
      date: new Date(now.getTime() - i * 24 * 60 * 60 * 1000), // Recent dates
    }))
    const result = aggregateEvidenceFromCitations(citations)
    expect(result.confidenceLevel).toBe('high')
  })

  it('downgrades confidence when dates are missing', () => {
    const citations = Array.from({ length: 12 }, (_, i) => ({
      url: `https://example${i}.com`,
      sourceType: ['pricing', 'reviews', 'changelog'][i % 3],
      // No date
    }))
    const result = aggregateEvidenceFromCitations(citations)
    // Without dates, can't be high confidence
    expect(result.confidenceLevel).toBe('medium')
  })

  it('determines medium confidence with 5+ citations, 2+ types', () => {
    const citations = Array.from({ length: 6 }, (_, i) => ({
      url: `https://example${i}.com`,
      sourceType: ['pricing', 'reviews'][i % 2],
      date: new Date('2024-01-01'),
    }))
    const result = aggregateEvidenceFromCitations(citations)
    expect(result.confidenceLevel).toBe('medium')
  })
})

describe('extractCitationsFromAllArtifacts', () => {
  it('extracts citations from multiple artifacts', () => {
    const artifacts = [
      {
        opportunities: [
          {
            citations: [{ url: 'https://example.com', source_type: 'pricing' }],
          },
        ],
      },
      {
        jobs: [
          {
            evidence: [{ citation: 'https://example2.com' }],
          },
        ],
      },
    ]
    const result = extractCitationsFromAllArtifacts(...artifacts)
    expect(result.length).toBe(2)
  })

  it('deduplicates citations across artifacts', () => {
    const artifacts = [
      {
        citations: [{ url: 'https://example.com', source_type: 'pricing' }],
      },
      {
        opportunities: [
          {
            citations: [{ url: 'https://example.com', source_type: 'reviews' }],
          },
        ],
      },
    ]
    const result = extractCitationsFromAllArtifacts(...artifacts)
    expect(result.length).toBe(1) // Deduplicated by URL
  })

  it('handles null/undefined artifacts', () => {
    const artifacts = [
      { citations: [{ url: 'https://example.com', source_type: 'pricing' }] },
      null,
      undefined,
    ]
    const result = extractCitationsFromAllArtifacts(...artifacts)
    expect(result.length).toBe(1)
  })
})

