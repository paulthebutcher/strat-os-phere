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
      first_experiments: [`Experiment ${i}`],
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

    // Need at least 1 criterion and summary to satisfy schema
    store.createArtifact({
      project_id: project.id,
      type: 'scoring_matrix' as any,
      content_json: {
        meta: {
          generated_at: new Date().toISOString(),
          schema_version: 2,
          run_id: 'test-run-123',
        },
        criteria: [
          {
            id: 'criterion-1',
            name: 'Criterion 1',
            description: 'Test criterion',
            weight: 3,
            how_to_score: 'Test rubric',
          },
        ],
        scores: [],
        summary: [
          {
            competitor_id: 'comp-1',
            competitor_name: 'Competitor 1',
            total_weighted_score: 50,
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
      first_experiments: [`Experiment ${i}`],
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

    store.createArtifact({
      project_id: project.id,
      type: 'scoring_matrix' as any,
      content_json: {
        meta: { generated_at: new Date().toISOString(), schema_version: 2 },
        criteria: [
          {
            id: 'criterion-1',
            name: 'Criterion 1',
            description: 'Test criterion',
            weight: 3,
            how_to_score: 'Test rubric',
          },
        ],
        scores: [],
        summary: [
          {
            competitor_id: 'comp-1',
            competitor_name: 'Competitor 1',
            total_weighted_score: 50,
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
})
