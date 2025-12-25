import { describe, it, expect, beforeEach } from 'vitest'
import { MockSupabaseStore, createMockSupabaseClient } from '../mocks/supabase'
import { checkCompetitorProfileStatus } from '@/lib/results/competitorProfiles'
import type { ArtifactType } from '@/lib/artifacts/registry'

describe('checkCompetitorProfileStatus', () => {
  let store: MockSupabaseStore
  let client: ReturnType<typeof createMockSupabaseClient>
  const userId = 'test-user-123'

  beforeEach(() => {
    store = new MockSupabaseStore()
    store.setUser(userId, 'test@example.com')
    client = createMockSupabaseClient(store, userId)
  })

  it('should detect missing profiles when no profile artifacts exist', async () => {
    const project = store.createProject({
      user_id: userId,
      name: 'Test Project',
      market: 'Test Market',
      target_customer: 'Test Customer',
    })

    // Create competitors but no profiles
    store.createCompetitor({
      project_id: project.id,
      name: 'Competitor 1',
      url: 'https://competitor1.com',
      evidence_text: 'Some evidence',
    })

    store.createCompetitor({
      project_id: project.id,
      name: 'Competitor 2',
      url: 'https://competitor2.com',
      evidence_text: 'Some evidence',
    })

    const status = await checkCompetitorProfileStatus(client, project.id)

    expect(status.competitorsCount).toBe(2)
    expect(status.profilesCount).toBe(0)
    expect(status.missingProfiles).toBe(true)
    expect(status.competitorIds.length).toBe(2)
  })

  it('should detect profiles exist when profile artifact with snapshots exists', async () => {
    const project = store.createProject({
      user_id: userId,
      name: 'Test Project',
      market: 'Test Market',
      target_customer: 'Test Customer',
    })

    const competitor1 = store.createCompetitor({
      project_id: project.id,
      name: 'Competitor 1',
      url: 'https://competitor1.com',
      evidence_text: 'Some evidence',
    })

    const competitor2 = store.createCompetitor({
      project_id: project.id,
      name: 'Competitor 2',
      url: 'https://competitor2.com',
      evidence_text: 'Some evidence',
    })

    // Create profile artifact with snapshots
    store.createArtifact({
      project_id: project.id,
      type: 'profiles' as ArtifactType,
      content_json: {
        run_id: 'test-run-123',
        generated_at: new Date().toISOString(),
        competitor_count: 2,
        snapshots: [
          {
            competitor_name: 'Competitor 1',
            positioning_one_liner: 'Test positioning',
            target_audience: ['Developers'],
            primary_use_cases: ['Build apps'],
            key_value_props: ['Fast', 'Reliable'],
            notable_capabilities: ['API', 'SDK'],
            business_model_signals: ['SaaS'],
            proof_points: [
              {
                claim: 'Fast',
                evidence_quote: 'Evidence quote',
                evidence_location: 'pasted_text' as const,
                confidence: 'high' as const,
              },
            ],
            risks_and_unknowns: ['Unknown'],
          },
          {
            competitor_name: 'Competitor 2',
            positioning_one_liner: 'Test positioning 2',
            target_audience: ['Designers'],
            primary_use_cases: ['Design apps'],
            key_value_props: ['Beautiful', 'Intuitive'],
            notable_capabilities: ['Templates', 'Assets'],
            business_model_signals: ['Freemium'],
            proof_points: [
              {
                claim: 'Beautiful',
                evidence_quote: 'Evidence quote 2',
                evidence_location: 'pasted_text' as const,
                confidence: 'high' as const,
              },
            ],
            risks_and_unknowns: ['Unknown'],
          },
        ],
      },
    })

    const status = await checkCompetitorProfileStatus(client, project.id)

    expect(status.competitorsCount).toBe(2)
    expect(status.profilesCount).toBe(2)
    expect(status.missingProfiles).toBe(false)
    expect(status.profileArtifacts.length).toBe(1)
    expect(status.profileArtifacts[0].snapshots.length).toBe(2)
  })

  it('should detect missing profiles when not all competitors have profiles', async () => {
    const project = store.createProject({
      user_id: userId,
      name: 'Test Project',
      market: 'Test Market',
      target_customer: 'Test Customer',
    })

    store.createCompetitor({
      project_id: project.id,
      name: 'Competitor 1',
      url: 'https://competitor1.com',
      evidence_text: 'Some evidence',
    })

    store.createCompetitor({
      project_id: project.id,
      name: 'Competitor 2',
      url: 'https://competitor2.com',
      evidence_text: 'Some evidence',
    })

    store.createCompetitor({
      project_id: project.id,
      name: 'Competitor 3',
      url: 'https://competitor3.com',
      evidence_text: 'Some evidence',
    })

    // Create profile artifact with only 2 snapshots (missing one)
    store.createArtifact({
      project_id: project.id,
      type: 'profiles' as ArtifactType,
      content_json: {
        run_id: 'test-run-123',
        generated_at: new Date().toISOString(),
        competitor_count: 2,
        snapshots: [
          {
            competitor_name: 'Competitor 1',
            positioning_one_liner: 'Test positioning',
            target_audience: ['Developers'],
            primary_use_cases: ['Build apps'],
            key_value_props: ['Fast'],
            notable_capabilities: ['API'],
            business_model_signals: ['SaaS'],
            proof_points: [
              {
                claim: 'Fast',
                evidence_quote: 'Evidence quote',
                evidence_location: 'pasted_text' as const,
                confidence: 'high' as const,
              },
            ],
            risks_and_unknowns: ['Unknown'],
          },
          {
            competitor_name: 'Competitor 2',
            positioning_one_liner: 'Test positioning 2',
            target_audience: ['Designers'],
            primary_use_cases: ['Design apps'],
            key_value_props: ['Beautiful'],
            notable_capabilities: ['Templates'],
            business_model_signals: ['Freemium'],
            proof_points: [
              {
                claim: 'Beautiful',
                evidence_quote: 'Evidence quote 2',
                evidence_location: 'pasted_text' as const,
                confidence: 'high' as const,
              },
            ],
            risks_and_unknowns: ['Unknown'],
          },
        ],
      },
    })

    const status = await checkCompetitorProfileStatus(client, project.id)

    expect(status.competitorsCount).toBe(3)
    expect(status.profilesCount).toBe(2)
    expect(status.missingProfiles).toBe(true) // Missing profile for Competitor 3
  })

  it('should return missingProfiles=false when no competitors exist', async () => {
    const project = store.createProject({
      user_id: userId,
      name: 'Test Project',
      market: 'Test Market',
      target_customer: 'Test Customer',
    })

    const status = await checkCompetitorProfileStatus(client, project.id)

    expect(status.competitorsCount).toBe(0)
    expect(status.profilesCount).toBe(0)
    expect(status.missingProfiles).toBe(false) // No competitors, so no missing profiles
    expect(status.competitorIds.length).toBe(0)
  })

  it('should handle profile artifact with content format (alternative schema)', async () => {
    const project = store.createProject({
      user_id: userId,
      name: 'Test Project',
      market: 'Test Market',
      target_customer: 'Test Customer',
    })

    store.createCompetitor({
      project_id: project.id,
      name: 'Competitor 1',
      url: 'https://competitor1.com',
      evidence_text: 'Some evidence',
    })

    // Create profile artifact with content format (alternative schema)
    store.createArtifact({
      project_id: project.id,
      type: 'profiles' as ArtifactType,
      content_json: {
        run_id: 'test-run-123',
        generated_at: new Date().toISOString(),
        content: [
          {
            competitor_name: 'Competitor 1',
            positioning_one_liner: 'Test positioning',
            target_audience: ['Developers'],
            primary_use_cases: ['Build apps'],
            key_value_props: ['Fast'],
            notable_capabilities: ['API'],
            business_model_signals: ['SaaS'],
            proof_points: [
              {
                claim: 'Fast',
                evidence_quote: 'Evidence quote',
                evidence_location: 'pasted_text' as const,
                confidence: 'high' as const,
              },
            ],
            risks_and_unknowns: ['Unknown'],
          },
        ],
      },
    })

    const status = await checkCompetitorProfileStatus(client, project.id)

    expect(status.competitorsCount).toBe(1)
    expect(status.profilesCount).toBe(1)
    expect(status.missingProfiles).toBe(false)
  })
})

