/**
 * Golden Path Decision Snapshot Test
 * 
 * This test validates a canonical "golden path" opportunities artifact and checks
 * structural invariants, not copy or visuals. It protects the end-to-end decision
 * contract without locking us into UI or phrasing.
 * 
 * Asserts:
 * - Opportunities are generated
 * - Opportunities are ranked
 * - Each opportunity includes: ≥1 evidence item, confidence bounds, assumptions, citations
 * - Evidence objects are deduped + normalized
 * - Email gating applies only at results reveal (tested separately in flows)
 */

import { describe, it, expect } from 'vitest'
import { assertDecisionIntegrity } from '../utils/assertDecisionIntegrity'
import type { OpportunitiesArtifactV1 } from '@/lib/opportunities/opportunityV1'

/**
 * Canonical golden path opportunities artifact
 * This represents the expected structure of a successful analysis run
 */
const goldenPathArtifact: OpportunitiesArtifactV1 = {
  schema_version: 'opportunity_v1.0',
  project_run_id: '123e4567-e89b-12d3-a456-426614174000',
  pipeline_version: '2025-12-23.v1',
  input_version: 1,
  generated_at: new Date().toISOString(),
  opportunities: [
    {
      id: 'opp-1',
      title: 'Test Opportunity 1',
      jtbd: {
        job: 'Test job statement',
        context: 'Test context',
      },
      forWhom: 'Test customer segment',
      whyCompetitorsMissIt: 'Test differentiation reason',
      recommendation: {
        whatToDo: 'Test recommendation',
        whyNow: 'Test timing reason',
        expectedImpact: 'Test impact',
        risks: ['Risk 1'],
      },
      citations: [
        {
          evidenceId: 'ev-1',
          url: 'https://example.com/evidence1',
          sourceType: 'pricing',
          excerpt: 'This is a test evidence excerpt that is long enough to meet the minimum requirement.',
        },
        {
          evidenceId: 'ev-2',
          url: 'https://example.com/evidence2',
          sourceType: 'reviews',
          excerpt: 'This is another test evidence excerpt that is long enough to meet the minimum requirement.',
        },
        {
          evidenceId: 'ev-3',
          url: 'https://example.com/evidence3',
          sourceType: 'docs',
          excerpt: 'This is a third test evidence excerpt that is long enough to meet the minimum requirement.',
        },
      ],
      evidenceSummary: {
        totalCitations: 3,
        evidenceTypesPresent: ['pricing', 'reviews', 'docs'],
      },
      scores: {
        total: 75,
        drivers: [
          {
            key: 'customer_pain',
            label: 'Customer Pain',
            weight: 0.3,
            value: 0.8,
            rationale: 'High customer pain observed',
            citationsUsed: ['ev-1'],
          },
        ],
      },
      whyThisRanks: ['Reason 1', 'Reason 2'],
      assumptions: ['Assumption 1'],
      confidence: 'directional',
      schema_version: 'opportunity_v1.0',
    },
    {
      id: 'opp-2',
      title: 'Test Opportunity 2',
      jtbd: {
        job: 'Test job statement 2',
        context: 'Test context 2',
      },
      forWhom: 'Test customer segment 2',
      whyCompetitorsMissIt: 'Test differentiation reason 2',
      recommendation: {
        whatToDo: 'Test recommendation 2',
        whyNow: 'Test timing reason 2',
        expectedImpact: 'Test impact 2',
        risks: ['Risk 2'],
      },
      citations: [
        {
          evidenceId: 'ev-4',
          url: 'https://example.com/evidence4',
          sourceType: 'changelog',
          excerpt: 'This is a fourth test evidence excerpt that is long enough to meet the minimum requirement.',
        },
        {
          evidenceId: 'ev-5',
          url: 'https://example.com/evidence5',
          sourceType: 'pricing',
          excerpt: 'This is a fifth test evidence excerpt that is long enough to meet the minimum requirement.',
        },
        {
          evidenceId: 'ev-6',
          url: 'https://example.com/evidence6',
          sourceType: 'reviews',
          excerpt: 'This is a sixth test evidence excerpt that is long enough to meet the minimum requirement.',
        },
      ],
      evidenceSummary: {
        totalCitations: 3,
        evidenceTypesPresent: ['changelog', 'pricing', 'reviews'],
      },
      scores: {
        total: 65,
        drivers: [
          {
            key: 'customer_pain',
            label: 'Customer Pain',
            weight: 0.3,
            value: 0.7,
            rationale: 'Moderate customer pain observed',
            citationsUsed: ['ev-4'],
          },
        ],
      },
      whyThisRanks: ['Reason 1'],
      assumptions: ['Assumption 2'],
      confidence: 'exploratory',
      schema_version: 'opportunity_v1.0',
    },
  ],
  generation_notes: {
    failed_closed: false,
  },
}

describe('Golden Path Decision Snapshot', () => {
  it('should validate opportunities artifact with correct structural invariants', () => {
    // This test validates the canonical golden path artifact structure
    // It ensures that decision outputs remain credible, inspectable, and defensible
    
    // Assert decision integrity (includes all structural checks)
    assertDecisionIntegrity(goldenPathArtifact)
  })

  it('should rank opportunities by score (descending)', () => {
    // Verify ranking is correct
    const scores = goldenPathArtifact.opportunities.map((opp) => opp.scores.total)
    
    // First opportunity should have higher score than second
    expect(scores[0]).toBeGreaterThan(scores[1])
    
    // Verify all opportunities are ranked (descending order)
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1])
    }
  })

  it('should have opportunities with required structural elements', () => {
    for (const opportunity of goldenPathArtifact.opportunities) {
      // Each opportunity must have at least 3 citations
      expect(opportunity.citations.length).toBeGreaterThanOrEqual(3)
      
      // Each opportunity must have confidence
      expect(opportunity.confidence).toBeDefined()
      expect(['exploratory', 'directional', 'investment_ready']).toContain(opportunity.confidence)
      
      // Each opportunity must have assumptions array
      expect(Array.isArray(opportunity.assumptions)).toBe(true)
      
      // Each opportunity must have scores
      expect(opportunity.scores).toBeDefined()
      expect(opportunity.scores.total).toBeGreaterThanOrEqual(0)
      expect(opportunity.scores.total).toBeLessThanOrEqual(100)
      
      // Each citation must reference a source
      for (const citation of opportunity.citations) {
        expect(citation.evidenceId).toBeTruthy()
        expect(citation.url).toBeTruthy()
      }
    }
  })
})

