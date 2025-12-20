import { describe, it, expect } from 'vitest'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import type { Artifact } from '@/lib/supabase/types'

describe('normalizeArtifacts', () => {
  const createArtifact = (
    type: 'profiles' | 'synthesis',
    contentJson: unknown,
    createdAt = '2024-01-01T00:00:00Z'
  ): Artifact => ({
    id: `artifact_${Date.now()}`,
    project_id: 'project_1',
    type,
    content_json: contentJson,
    created_at: createdAt,
  })

  it('supports envelope shape for profiles', () => {
    const envelope = {
      run_id: 'run_123',
      generated_at: '2024-01-01T00:00:00Z',
      competitor_count: 3,
      snapshots: [
        {
          competitor_name: 'Competitor A',
          positioning_one_liner: 'Positioning',
          target_audience: ['Audience'],
          primary_use_cases: ['Use case'],
          key_value_props: ['Value'],
          notable_capabilities: ['Capability'],
          business_model_signals: ['Signal'],
          proof_points: [
            {
              claim: 'Claim',
              evidence_quote: 'Evidence',
              evidence_location: 'pasted_text',
              confidence: 'high',
            },
          ],
          risks_and_unknowns: ['Risk'],
        },
      ],
    }

    const artifact = createArtifact('profiles', envelope)
    const result = normalizeResultsArtifacts([artifact])

    expect(result.profiles).not.toBeNull()
    expect(result.profiles?.runId).toBe('run_123')
    expect(result.profiles?.snapshots).toHaveLength(1)
    expect(result.profiles?.snapshots[0].competitor_name).toBe('Competitor A')
  })

  it('supports bare array shape for profiles', () => {
    const bareArray = [
      {
        competitor_name: 'Competitor B',
        positioning_one_liner: 'Positioning',
        target_audience: ['Audience'],
        primary_use_cases: ['Use case'],
        key_value_props: ['Value'],
        notable_capabilities: ['Capability'],
        business_model_signals: ['Signal'],
        proof_points: [
          {
            claim: 'Claim',
            evidence_quote: 'Evidence',
            evidence_location: 'pasted_text',
            confidence: 'high',
          },
        ],
        risks_and_unknowns: ['Risk'],
      },
    ]

    const artifact = createArtifact('profiles', bareArray)
    const result = normalizeResultsArtifacts([artifact])

    expect(result.profiles).not.toBeNull()
    expect(result.profiles?.runId).toBeNull()
    expect(result.profiles?.snapshots).toHaveLength(1)
    expect(result.profiles?.snapshots[0].competitor_name).toBe('Competitor B')
    expect(result.profiles?.competitorCount).toBe(1)
  })

  it('supports envelope shape for synthesis', () => {
    const envelope = {
      run_id: 'run_456',
      generated_at: '2024-01-01T00:00:00Z',
      competitor_count: 3,
      synthesis: {
        market_summary: {
          headline: 'Market Headline',
          what_is_changing: ['Change 1'],
          what_buyers_care_about: ['Care 1'],
        },
        themes: [
          {
            theme: 'Theme 1',
            description: 'Description',
            competitors_supporting: ['Competitor A'],
          },
        ],
        clusters: [
          {
            cluster_name: 'Cluster 1',
            who_is_in_it: ['Competitor A'],
            cluster_logic: 'Logic',
          },
        ],
        positioning_map_text: {
          axis_x: 'X axis',
          axis_y: 'Y axis',
          quadrants: [
            {
              name: 'Quadrant 1',
              competitors: ['Competitor A'],
              notes: 'Notes',
            },
          ],
        },
        opportunities: [
          {
            opportunity: 'Opportunity',
            who_it_serves: 'Who',
            why_now: 'Why',
            why_competitors_miss_it: 'Why miss',
            suggested_angle: 'Angle',
            risk_or_assumption: 'Risk',
            priority: 1,
          },
        ],
        recommended_differentiation_angles: [
          {
            angle: 'Angle',
            what_to_claim: 'Claim',
            how_to_prove: ['Proof'],
            watch_out_for: ['Watch'],
          },
        ],
      },
    }

    const artifact = createArtifact('synthesis', envelope)
    const result = normalizeResultsArtifacts([artifact])

    expect(result.synthesis).not.toBeNull()
    expect(result.synthesis?.runId).toBe('run_456')
    expect(result.synthesis?.synthesis.market_summary.headline).toBe('Market Headline')
  })

  it('supports bare MarketSynthesis shape', () => {
    const bareSynthesis = {
      market_summary: {
        headline: 'Bare Headline',
        what_is_changing: ['Change'],
        what_buyers_care_about: ['Care'],
      },
      themes: [
        {
          theme: 'Theme',
          description: 'Description',
          competitors_supporting: ['Competitor'],
        },
      ],
      clusters: [
        {
          cluster_name: 'Cluster',
          who_is_in_it: ['Competitor'],
          cluster_logic: 'Logic',
        },
      ],
      positioning_map_text: {
        axis_x: 'X',
        axis_y: 'Y',
        quadrants: [
          {
            name: 'Quadrant',
            competitors: ['Competitor'],
            notes: 'Notes',
          },
        ],
      },
      opportunities: [
        {
          opportunity: 'Opp',
          who_it_serves: 'Who',
          why_now: 'Why',
          why_competitors_miss_it: 'Why',
          suggested_angle: 'Angle',
          risk_or_assumption: 'Risk',
          priority: 1,
        },
      ],
      recommended_differentiation_angles: [
        {
          angle: 'Angle',
          what_to_claim: 'Claim',
          how_to_prove: ['Proof'],
          watch_out_for: ['Watch'],
        },
      ],
    }

    const artifact = createArtifact('synthesis', bareSynthesis)
    const result = normalizeResultsArtifacts([artifact])

    expect(result.synthesis).not.toBeNull()
    expect(result.synthesis?.runId).toBeNull()
    expect(result.synthesis?.synthesis.market_summary.headline).toBe('Bare Headline')
  })

  it('returns null for invalid synthesis', () => {
    const invalidSynthesis = {
      invalid: 'data',
    }

    const artifact = createArtifact('synthesis', invalidSynthesis)
    const result = normalizeResultsArtifacts([artifact])

    expect(result.synthesis).toBeNull()
  })

  it('preserves stable output format used by UI', () => {
    const profilesArtifact = createArtifact('profiles', {
      run_id: 'run_123',
      snapshots: [
        {
          competitor_name: 'Competitor',
          positioning_one_liner: 'Positioning',
          target_audience: ['Audience'],
          primary_use_cases: ['Use case'],
          key_value_props: ['Value'],
          notable_capabilities: ['Capability'],
          business_model_signals: ['Signal'],
          proof_points: [
            {
              claim: 'Claim',
              evidence_quote: 'Evidence',
              evidence_location: 'pasted_text',
              confidence: 'high',
            },
          ],
          risks_and_unknowns: ['Risk'],
        },
      ],
    })

    const result = normalizeResultsArtifacts([profilesArtifact])

    expect(result).toMatchObject({
      profiles: expect.objectContaining({
        type: 'profiles',
        snapshots: expect.any(Array),
        artifactCreatedAt: expect.any(String),
      }),
      synthesis: null,
      runId: expect.any(String),
      generatedAt: expect.any(String),
      competitorCount: expect.any(Number),
    })
  })

  it('handles empty artifacts array', () => {
    const result = normalizeResultsArtifacts([])

    expect(result).toEqual({
      profiles: null,
      synthesis: null,
      runId: null,
      generatedAt: null,
      competitorCount: null,
    })
  })

  it('prefers matching run_id pairs when available', () => {
    const profiles1 = createArtifact('profiles', { run_id: 'run_1', snapshots: [] }, '2024-01-01T00:00:00Z')
    const synthesis1 = createArtifact('synthesis', {
      run_id: 'run_1',
      synthesis: {
        market_summary: { headline: 'Match', what_is_changing: ['Change'], what_buyers_care_about: ['Care'] },
        themes: [{ theme: 'Theme', description: 'Desc', competitors_supporting: ['Comp'] }],
        clusters: [{ cluster_name: 'Cluster', who_is_in_it: ['Comp'], cluster_logic: 'Logic' }],
        positioning_map_text: { axis_x: 'X', axis_y: 'Y', quadrants: [{ name: 'Q', competitors: ['Comp'], notes: 'N' }] },
        opportunities: [{ opportunity: 'Opp', who_it_serves: 'Who', why_now: 'Why', why_competitors_miss_it: 'Why', suggested_angle: 'Angle', risk_or_assumption: 'Risk', priority: 1 }],
        recommended_differentiation_angles: [{ angle: 'Angle', what_to_claim: 'Claim', how_to_prove: ['Proof'], watch_out_for: ['Watch'] }],
      },
    }, '2024-01-01T00:00:00Z')
    const profiles2 = createArtifact('profiles', { run_id: 'run_2', snapshots: [] }, '2024-01-02T00:00:00Z')

    const result = normalizeResultsArtifacts([profiles2, profiles1, synthesis1])

    expect(result.profiles?.runId).toBe('run_1')
    expect(result.synthesis?.runId).toBe('run_1')
  })
})

