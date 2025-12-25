import { describe, it, expect } from 'vitest'
import { computeContrastSummary } from '@/lib/results/diffHelpers'
import type {
  NormalizedJtbdArtifact,
  NormalizedOpportunitiesV2Artifact,
  NormalizedScoringMatrixArtifact,
} from '@/lib/results/normalizeArtifacts'

describe('diffHelpers', () => {
  describe('computeContrastSummary', () => {
    const createJtbdArtifact = (jobs: Array<{ job_statement: string; opportunity_score: number }>): NormalizedJtbdArtifact => ({
      type: 'jtbd',
      runId: 'run_1',
      generatedAt: '2024-01-01T00:00:00Z',
      content: {
        meta: {
          generated_at: '2024-01-01T00:00:00Z',
        },
        jobs: jobs.map((job) => ({
          job_statement: job.job_statement,
          context: 'test context',
          desired_outcomes: ['outcome'],
          constraints: ['constraint'],
          current_workarounds: ['workaround'],
          non_negotiables: ['non-negotiable'],
          who: 'test user',
          frequency: 'daily',
          importance_score: 3,
          satisfaction_score: 3,
          opportunity_score: job.opportunity_score,
          evidence: [],
        })),
      },
      artifactCreatedAt: '2024-01-01T00:00:00Z',
    })

    const createOpportunitiesArtifact = (
      opportunities: Array<{ title: string; score: number }>
    ): NormalizedOpportunitiesV2Artifact => ({
      type: 'opportunities_v2',
      runId: 'run_1',
      generatedAt: '2024-01-01T00:00:00Z',
      content: {
        meta: {
          generated_at: '2024-01-01T00:00:00Z',
        },
        opportunities: opportunities.map((opp) => ({
          title: opp.title,
          type: 'product_capability',
          who_it_serves: 'users',
          why_now: 'market trend',
          how_to_win: ['strategy'],
          what_competitors_do_today: 'current approach',
          why_they_cant_easily_copy: 'barrier',
          effort: 'M',
          impact: 'high',
          confidence: 'high',
          score: opp.score,
          risks: ['risk'],
          first_experiments: ['this is a test experiment that is long enough'],
        })),
      },
      artifactCreatedAt: '2024-01-01T00:00:00Z',
    })

    const createScorecardArtifact = (
      summaries: Array<{ competitor_name: string; total_weighted_score: number }>
    ): NormalizedScoringMatrixArtifact => {
      // Create minimal valid criteria and scores to satisfy schema requirements
      // The diff functions only use summary, but we need valid content structure
      const criteria = Array.from({ length: 6 }, (_, i) => ({
        id: `criterion-${i}`,
        name: `Criterion ${i}`,
        description: 'Test criterion',
        weight: 1,
        how_to_score: 'Test rubric',
      }))
      
      const scores = summaries.flatMap((s) =>
        criteria.map((c) => ({
          competitor_name: s.competitor_name,
          criteria_id: c.id,
          dimensions: {
            discovery_support: 0.5,
            execution_support: 0.5,
            reliability: 0.5,
            flexibility: 0.5,
            friction: 0.5,
          },
        }))
      )

      return {
        type: 'scoring_matrix',
        runId: 'run_1',
        generatedAt: '2024-01-01T00:00:00Z',
        content: {
          meta: {
            generated_at: '2024-01-01T00:00:00Z',
          },
          summary: summaries.map((s) => ({
            competitor_name: s.competitor_name,
            total_weighted_score: s.total_weighted_score,
            strengths: [],
            weaknesses: [],
          })),
          criteria,
          scores,
        },
        artifactCreatedAt: '2024-01-01T00:00:00Z',
      }
    }

    it('should return hasChanges === true when there are JTBD diffs', () => {
      const latest = {
        jtbd: createJtbdArtifact([
          { job_statement: 'When X, I want to Y, so I can Z.', opportunity_score: 80 },
          { job_statement: 'When A, I want to B, so I can C.', opportunity_score: 70 },
        ]),
        opportunities: null,
        scorecard: null,
      }

      const previous = {
        jtbd: createJtbdArtifact([
          { job_statement: 'When X, I want to Y, so I can Z.', opportunity_score: 80 },
        ]),
        opportunities: null,
        scorecard: null,
      }

      const result = computeContrastSummary(latest, previous)

      expect(result.hasChanges).toBe(true)
      expect(typeof result.hasChanges).toBe('boolean')
      expect(result.jtbd).not.toBeNull()
      expect(result.jtbd?.added).toHaveLength(1)
    })

    it('should return hasChanges === true when there are opportunities diffs', () => {
      const latest = {
        jtbd: null,
        opportunities: createOpportunitiesArtifact([
          { title: 'Opportunity 1', score: 80 },
          { title: 'Opportunity 2', score: 70 },
        ]),
        scorecard: null,
      }

      const previous = {
        jtbd: null,
        opportunities: createOpportunitiesArtifact([
          { title: 'Opportunity 1', score: 80 },
        ]),
        scorecard: null,
      }

      const result = computeContrastSummary(latest, previous)

      expect(result.hasChanges).toBe(true)
      expect(typeof result.hasChanges).toBe('boolean')
      expect(result.opportunities).not.toBeNull()
      expect(result.opportunities?.added).toHaveLength(1)
    })

    it('should return hasChanges === true when there are scorecard diffs', () => {
      const latest = {
        jtbd: null,
        opportunities: null,
        scorecard: createScorecardArtifact([
          { competitor_name: 'Competitor A', total_weighted_score: 85 },
          { competitor_name: 'Competitor B', total_weighted_score: 75 },
        ]),
      }

      const previous = {
        jtbd: null,
        opportunities: null,
        scorecard: createScorecardArtifact([
          { competitor_name: 'Competitor A', total_weighted_score: 70 }, // Changed by 15 (above threshold)
          { competitor_name: 'Competitor B', total_weighted_score: 75 },
        ]),
      }

      const result = computeContrastSummary(latest, previous)

      expect(result.hasChanges).toBe(true)
      expect(typeof result.hasChanges).toBe('boolean')
      expect(result.scorecard).not.toBeNull()
      expect(result.scorecard?.scoreChanges).toHaveLength(1)
    })

    it('should return hasChanges === false when there are no diffs', () => {
      const jtbd = createJtbdArtifact([
        { job_statement: 'When X, I want to Y, so I can Z.', opportunity_score: 80 },
      ])

      const opportunities = createOpportunitiesArtifact([
        { title: 'Opportunity 1', score: 80 },
      ])

      const scorecard = createScorecardArtifact([
        { competitor_name: 'Competitor A', total_weighted_score: 75 },
      ])

      const latest = {
        jtbd,
        opportunities,
        scorecard,
      }

      const previous = {
        jtbd,
        opportunities,
        scorecard,
      }

      const result = computeContrastSummary(latest, previous)

      expect(result.hasChanges).toBe(false)
      expect(typeof result.hasChanges).toBe('boolean')
    })

    it('should return hasChanges === false when all artifacts are null', () => {
      const latest = {
        jtbd: null,
        opportunities: null,
        scorecard: null,
      }

      const previous = {
        jtbd: null,
        opportunities: null,
        scorecard: null,
      }

      const result = computeContrastSummary(latest, previous)

      expect(result.hasChanges).toBe(false)
      expect(typeof result.hasChanges).toBe('boolean')
      // This tests the case where upstream computations produce null
      // and ensures hasChanges is normalized to false, not null
    })

    it('should return hasChanges === false when diffs exist but have no changes', () => {
      // Create artifacts with same content but different instances
      const latest = {
        jtbd: createJtbdArtifact([
          { job_statement: 'When X, I want to Y, so I can Z.', opportunity_score: 80 },
        ]),
        opportunities: createOpportunitiesArtifact([
          { title: 'Opportunity 1', score: 80 },
        ]),
        scorecard: createScorecardArtifact([
          { competitor_name: 'Competitor A', total_weighted_score: 75 },
        ]),
      }

      const previous = {
        jtbd: createJtbdArtifact([
          { job_statement: 'When X, I want to Y, so I can Z.', opportunity_score: 80 },
        ]),
        opportunities: createOpportunitiesArtifact([
          { title: 'Opportunity 1', score: 80 },
        ]),
        scorecard: createScorecardArtifact([
          { competitor_name: 'Competitor A', total_weighted_score: 75 }, // Same score (no change above threshold)
        ]),
      }

      const result = computeContrastSummary(latest, previous)

      expect(result.hasChanges).toBe(false)
      expect(typeof result.hasChanges).toBe('boolean')
    })

    it('should return hasChanges === true when any diff has changes', () => {
      const latest = {
        jtbd: createJtbdArtifact([
          { job_statement: 'When X, I want to Y, so I can Z.', opportunity_score: 80 },
          { job_statement: 'When A, I want to B, so I can C.', opportunity_score: 70 },
        ]),
        opportunities: createOpportunitiesArtifact([
          { title: 'Opportunity 1', score: 80 },
        ]),
        scorecard: createScorecardArtifact([
          { competitor_name: 'Competitor A', total_weighted_score: 75 },
        ]),
      }

      const previous = {
        jtbd: createJtbdArtifact([
          { job_statement: 'When X, I want to Y, so I can Z.', opportunity_score: 80 },
        ]),
        opportunities: createOpportunitiesArtifact([
          { title: 'Opportunity 1', score: 80 },
        ]),
        scorecard: createScorecardArtifact([
          { competitor_name: 'Competitor A', total_weighted_score: 75 },
        ]),
      }

      const result = computeContrastSummary(latest, previous)

      expect(result.hasChanges).toBe(true)
      expect(typeof result.hasChanges).toBe('boolean')
    })
  })
})

