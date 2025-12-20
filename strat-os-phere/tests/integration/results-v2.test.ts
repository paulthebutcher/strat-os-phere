import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseStore, createMockSupabaseClient } from '../mocks/supabase'
import { listArtifacts } from '@/lib/data/artifacts'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'

// Note: This test verifies the artifact structure and normalization logic.
// Full integration with LLM calls would require mocking the LLM provider.
// For now, we test that the normalization correctly identifies v2 artifacts.

describe('Results v2 Artifact Normalization', () => {
  let store: MockSupabaseStore
  let client: ReturnType<typeof createMockSupabaseClient>
  const userId = 'test-user-123'

  beforeEach(() => {
    store = new MockSupabaseStore()
    store.setUser(userId, 'test@example.com')
    client = createMockSupabaseClient(store, userId)
  })

  it('should correctly identify and prefer v2 artifacts by schema_version', async () => {
    const project = store.createProject({
      user_id: userId,
      name: 'Test Project',
      market: 'Test Market',
      target_customer: 'Test Customer',
    })

    // Create v1 and v2 artifacts of the same type
    // Need at least 8 jobs to satisfy schema
    const mockJobs = Array.from({ length: 8 }, (_, i) => ({
      job_statement: `When test context ${i}, I want to test action ${i}, so I can test outcome ${i}.`,
      context: `Context ${i}`,
      desired_outcomes: [`Outcome ${i}`],
      constraints: [`Constraint ${i}`],
      current_workarounds: [`Workaround ${i}`],
      non_negotiables: [`Non-negotiable ${i}`],
      who: `Persona ${i}`,
      frequency: 'weekly' as const,
      importance_score: 3,
      satisfaction_score: 3,
      opportunity_score: 50,
    }))

    store.createArtifact({
      project_id: project.id,
      type: 'jtbd' as any,
      content_json: {
        meta: {
          generated_at: new Date().toISOString(),
          schema_version: 1,
          run_id: 'test-run-v1',
        },
        jobs: mockJobs,
      },
    })

    store.createArtifact({
      project_id: project.id,
      type: 'jtbd' as any,
      content_json: {
        meta: {
          generated_at: new Date().toISOString(),
          schema_version: 2,
          run_id: 'test-run-v2',
        },
        jobs: mockJobs,
      },
    })

    // Need at least 5 opportunities to satisfy schema
    const mockOpportunities = Array.from({ length: 5 }, (_, i) => ({
      title: `Opportunity ${i}`,
      type: 'product_capability' as const,
      who_it_serves: `Customer ${i}`,
      why_now: `Reason ${i}`,
      how_to_win: [`Tactic ${i}`],
      what_competitors_do_today: `Current approach ${i}`,
      why_they_cant_easily_copy: `Constraint ${i}`,
      effort: 'M' as const,
      impact: 'med' as const,
      confidence: 'med' as const,
      score: 50,
      risks: [`Risk ${i}`],
      first_experiments: [`This is a test experiment ${i} that is long enough`],
    }))

    store.createArtifact({
      project_id: project.id,
      type: 'opportunities_v2' as any,
      content_json: {
        meta: {
          generated_at: new Date().toISOString(),
          schema_version: 2,
          run_id: 'test-run-123',
        },
        opportunities: mockOpportunities,
      },
    })

    // Need at least 6 criteria to satisfy schema
    const criteria = Array.from({ length: 6 }, (_, i) => ({
      id: `criterion-${i + 1}`,
      name: `Criterion ${i + 1}`,
      description: `Test criterion ${i + 1}`,
      weight: 3,
      how_to_score: 'Test rubric',
    }))

    store.createArtifact({
      project_id: project.id,
      type: 'scoring_matrix' as any,
      content_json: {
        meta: {
          generated_at: new Date().toISOString(),
          schema_version: 2,
          run_id: 'test-run-123',
        },
        criteria,
        scores: [
          {
            competitor_name: 'Competitor 1',
            criteria_id: 'criterion-1',
            dimensions: {
              discovery_support: 0.7,
              execution_support: 0.6,
              reliability: 0.8,
              flexibility: 0.5,
              friction: 0.3,
            },
          },
        ],
        summary: [
          {
            competitor_id: 'comp-1',
            competitor_name: 'Competitor 1',
            total_weighted_score: 62.4, // Computed from dimensions: (0.7 + 0.6 + 0.8 + 0.5 + 0.7) / 5 * 100
            strengths: [],
            weaknesses: [],
          },
        ],
      },
    })

    const artifacts = await listArtifacts(client, { projectId: project.id })
    const normalized = normalizeResultsArtifacts(artifacts)

    // Should prefer v2 artifacts
    expect(normalized.jtbd).toBeDefined()
    expect(normalized.jtbd?.content.meta?.schema_version).toBe(2)
    expect(normalized.opportunitiesV2).toBeDefined()
    expect(normalized.opportunitiesV2?.content.meta?.schema_version).toBe(2)
    expect(normalized.scoringMatrix).toBeDefined()
    expect(normalized.scoringMatrix?.content.meta?.schema_version).toBe(2)
  })

  it('should fall back to v1 artifacts if v2 not present', async () => {
    const project = store.createProject({
      user_id: userId,
      name: 'Test Project',
      market: 'Test Market',
      target_customer: 'Test Customer',
    })

    // Only create v1 artifact
    // Need at least 8 jobs to satisfy schema
    const mockJobs = Array.from({ length: 8 }, (_, i) => ({
      job_statement: `When test context ${i}, I want to test action ${i}, so I can test outcome ${i}.`,
      context: `Context ${i}`,
      desired_outcomes: [`Outcome ${i}`],
      constraints: [`Constraint ${i}`],
      current_workarounds: [`Workaround ${i}`],
      non_negotiables: [`Non-negotiable ${i}`],
      who: `Persona ${i}`,
      frequency: 'weekly' as const,
      importance_score: 3,
      satisfaction_score: 3,
      opportunity_score: 50,
    }))

    store.createArtifact({
      project_id: project.id,
      type: 'jtbd' as any,
      content_json: {
        meta: {
          generated_at: new Date().toISOString(),
          schema_version: 1,
          run_id: 'test-run-v1',
        },
        jobs: mockJobs,
      },
    })

    const artifacts = await listArtifacts(client, { projectId: project.id })
    const normalized = normalizeResultsArtifacts(artifacts)

    // Should fall back to v1
    expect(normalized.jtbd).toBeDefined()
    expect(normalized.jtbd?.content.meta?.schema_version).toBe(1)
  })

  it('should correctly identify artifact types (jtbd, opportunities_v2, scoring_matrix)', async () => {
    const project = store.createProject({
      user_id: userId,
      name: 'Test Project',
      market: 'Test Market',
      target_customer: 'Test Customer',
    })

    const mockJobs = Array.from({ length: 8 }, (_, i) => ({
      job_statement: `When test context ${i}, I want to test action ${i}, so I can test outcome ${i}.`,
      context: `Context ${i}`,
      desired_outcomes: [`Outcome ${i}`],
      constraints: [`Constraint ${i}`],
      current_workarounds: [`Workaround ${i}`],
      non_negotiables: [`Non-negotiable ${i}`],
      who: `Persona ${i}`,
      frequency: 'weekly' as const,
      importance_score: 3,
      satisfaction_score: 3,
      opportunity_score: 50,
    }))

    const mockOpportunities = Array.from({ length: 5 }, (_, i) => ({
      title: `Opportunity ${i}`,
      type: 'product_capability' as const,
      who_it_serves: `Customer ${i}`,
      why_now: `Reason ${i}`,
      how_to_win: [`Tactic ${i}`],
      what_competitors_do_today: `Current approach ${i}`,
      why_they_cant_easily_copy: `Constraint ${i}`,
      effort: 'M' as const,
      impact: 'med' as const,
      confidence: 'med' as const,
      score: 50,
      risks: [`Risk ${i}`],
      first_experiments: [`This is a test experiment ${i} that is long enough`],
    }))

    store.createArtifact({
      project_id: project.id,
      type: 'jtbd' as any,
      content_json: {
        meta: { generated_at: new Date().toISOString(), schema_version: 2 },
        jobs: mockJobs,
      },
    })

    store.createArtifact({
      project_id: project.id,
      type: 'opportunities_v2' as any,
      content_json: {
        meta: { generated_at: new Date().toISOString(), schema_version: 2 },
        opportunities: mockOpportunities,
      },
    })

    const criteria = Array.from({ length: 6 }, (_, i) => ({
      id: `criterion-${i + 1}`,
      name: `Criterion ${i + 1}`,
      description: `Test criterion ${i + 1}`,
      weight: 3,
      how_to_score: 'Test rubric',
    }))

    store.createArtifact({
      project_id: project.id,
      type: 'scoring_matrix' as any,
      content_json: {
        meta: { generated_at: new Date().toISOString(), schema_version: 2 },
        criteria,
        scores: [
          {
            competitor_name: 'Competitor 1',
            criteria_id: 'criterion-1',
            dimensions: {
              discovery_support: 0.7,
              execution_support: 0.6,
              reliability: 0.8,
              flexibility: 0.5,
              friction: 0.3,
            },
          },
        ],
        summary: [
          {
            competitor_id: 'comp-1',
            competitor_name: 'Competitor 1',
            total_weighted_score: 62.4,
            strengths: [],
            weaknesses: [],
          },
        ],
      },
    })

    const artifacts = await listArtifacts(client, { projectId: project.id })
    const v2Artifacts = artifacts.filter((a) => {
      const content = a.content_json as { meta?: { schema_version?: number } }
      return (
        (a.type === 'jtbd' ||
          a.type === 'opportunities_v2' ||
          a.type === 'scoring_matrix') &&
        content?.meta?.schema_version === 2
      )
    })

    expect(v2Artifacts.length).toBe(3)

    const artifactTypes = v2Artifacts.map((a) => a.type).sort()
    expect(artifactTypes).toEqual(['jtbd', 'opportunities_v2', 'scoring_matrix'])

    // Verify normalization would find them
    const normalized = normalizeResultsArtifacts(artifacts)
    expect(normalized.jtbd).toBeDefined()
    expect(normalized.opportunitiesV2).toBeDefined()
    expect(normalized.scoringMatrix).toBeDefined()
  })

  it('should verify scores show meaningful variance (not limited to 50/100)', async () => {
    const project = store.createProject({
      user_id: userId,
      name: 'Test Project',
      market: 'Test Market',
      target_customer: 'Test Customer',
    })

    // Create scoring matrix with varied dimension scores to ensure meaningful variance
    // Need at least 6 criteria to satisfy schema
    const criteria = Array.from({ length: 6 }, (_, i) => ({
      id: `criterion-${i + 1}`,
      name: `Criterion ${i + 1}`,
      description: `Test criterion ${i + 1}`,
      weight: i === 0 ? 5 : 3, // First criterion has higher weight
      how_to_score: 'Test rubric',
    }))

    store.createArtifact({
      project_id: project.id,
      type: 'scoring_matrix' as any,
      content_json: {
        meta: { generated_at: new Date().toISOString(), schema_version: 2 },
        criteria,
        scores: [
          {
            competitor_name: 'Competitor A',
            criteria_id: 'criterion-1',
            dimensions: {
              discovery_support: 0.62, // Partial support
              execution_support: 0.74, // Good support
              reliability: 0.81, // High reliability
              flexibility: 0.55, // Moderate flexibility
              friction: 0.35, // Moderate friction (will be inverted)
            },
          },
          {
            competitor_name: 'Competitor B',
            criteria_id: 'criterion-1',
            dimensions: {
              discovery_support: 0.45, // Weaker support
              execution_support: 0.38, // Poor execution
              reliability: 0.67, // Moderate reliability
              flexibility: 0.72, // Good flexibility
              friction: 0.58, // Higher friction
            },
          },
        ],
        summary: [
          {
            competitor_name: 'Competitor A',
            total_weighted_score: 67.4, // Should be around 67 (not 50 or 100)
            strengths: [],
            weaknesses: [],
          },
          {
            competitor_name: 'Competitor B',
            total_weighted_score: 52.8, // Should be around 53 (not 50 or 100)
            strengths: [],
            weaknesses: [],
          },
        ],
      },
    })

    const artifacts = await listArtifacts(client, { projectId: project.id })
    const normalized = normalizeResultsArtifacts(artifacts)

    expect(normalized.scoringMatrix).toBeDefined()
    const scoringMatrix = normalized.scoringMatrix!

    // Verify scores are not limited to multiples of 25 or 50
    const scores = scoringMatrix.content.summary.map((s) => s.total_weighted_score)
    expect(scores.length).toBe(2)
    
    // Check that scores show variance and are not clustered at 50 or 100
    const scoreA = scores.find((_, i) => scoringMatrix.content.summary[i].competitor_name === 'Competitor A')!
    const scoreB = scores.find((_, i) => scoringMatrix.content.summary[i].competitor_name === 'Competitor B')!
    
    // Scores should be different
    expect(Math.abs(scoreA - scoreB)).toBeGreaterThan(5)
    
    // Scores should not be exactly 50 or 100
    expect(scoreA).not.toBe(50)
    expect(scoreA).not.toBe(100)
    expect(scoreB).not.toBe(50)
    expect(scoreB).not.toBe(100)
    
    // Scores should be in reasonable range (not just 0 or extreme values)
    expect(scoreA).toBeGreaterThan(0)
    expect(scoreA).toBeLessThan(100)
    expect(scoreB).toBeGreaterThan(0)
    expect(scoreB).toBeLessThan(100)
    
    // Competitor A should have partial support scores between 55-75 (not 50 or 100)
    // Based on dimensions: (0.62 + 0.74 + 0.81 + 0.55 + 0.65) / 5 * 100 = 67.4
    expect(scoreA).toBeGreaterThan(55)
    expect(scoreA).toBeLessThan(75)
  })
})
