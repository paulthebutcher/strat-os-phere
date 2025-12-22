import { describe, it, expect } from 'vitest'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeResults'
import type { Artifact } from '@/lib/supabase/types'

describe('normalizeResultsArtifacts', () => {
  const projectId = 'test-project-123'

  describe('picks newest schema_version correctly', () => {
    it('prefers v3 over v2 opportunities', () => {
      const artifacts: Artifact[] = [
        {
          id: '1',
          project_id: projectId,
          type: 'opportunities_v2',
          content_json: {
            meta: { schema_version: 2, generated_at: '2024-01-01T00:00:00Z' },
            opportunities: [],
          },
          created_at: '2024-01-02T00:00:00Z',
        },
        {
          id: '2',
          project_id: projectId,
          type: 'opportunities_v3',
          content_json: {
            meta: { schema_version: 3, generated_at: '2024-01-01T00:00:00Z' },
            opportunities: [],
          },
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      const result = normalizeResultsArtifacts(artifacts, projectId)

      expect(result.opportunities.v3).toBeTruthy()
      expect(result.opportunities.v2).toBeNull()
      expect(result.opportunities.best?.type).toBe('opportunities_v3')
    })

    it('prefers higher schema_version for strategic bets', () => {
      const artifacts: Artifact[] = [
        {
          id: '1',
          project_id: projectId,
          type: 'strategic_bets',
          content_json: {
            meta: { schema_version: 1, generated_at: '2024-01-01T00:00:00Z' },
            bets: [],
          },
          created_at: '2024-01-02T00:00:00Z',
        },
        {
          id: '2',
          project_id: projectId,
          type: 'strategic_bets',
          content_json: {
            meta: { schema_version: 2, generated_at: '2024-01-01T00:00:00Z' },
            bets: [],
          },
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      const result = normalizeResultsArtifacts(artifacts, projectId)

      expect(result.strategicBets).toBeTruthy()
      expect(result.strategicBets?.content.meta?.schema_version).toBe(2)
    })
  })

  describe('falls back to created_at when schema_version ties', () => {
    it('picks newest by created_at when schema_version is same', () => {
      const artifacts: Artifact[] = [
        {
          id: '1',
          project_id: projectId,
          type: 'strategic_bets',
          content_json: {
            meta: { schema_version: 2, generated_at: '2024-01-01T00:00:00Z' },
            bets: [],
          },
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          project_id: projectId,
          type: 'strategic_bets',
          content_json: {
            meta: { schema_version: 2, generated_at: '2024-01-01T00:00:00Z' },
            bets: [],
          },
          created_at: '2024-01-02T00:00:00Z',
        },
      ]

      const result = normalizeResultsArtifacts(artifacts, projectId)

      expect(result.strategicBets).toBeTruthy()
      expect(result.strategicBets?.artifactCreatedAt).toBe('2024-01-02T00:00:00Z')
    })
  })

  describe('handles envelope vs bare content', () => {
    it('handles envelope format for profiles', () => {
      const artifacts: Artifact[] = [
        {
          id: '1',
          project_id: projectId,
          type: 'profiles',
          content_json: {
            run_id: 'run-123',
            generated_at: '2024-01-01T00:00:00Z',
            competitor_count: 3,
            snapshots: [
              {
                competitor_name: 'Test Competitor',
                positioning_one_liner: 'Test positioning',
                key_value_props: [],
                notable_capabilities: [],
                business_model_signals: [],
                proof_points: [],
                risks_and_unknowns: [],
              },
            ],
          },
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      const result = normalizeResultsArtifacts(artifacts, projectId)

      expect(result.profiles).toBeTruthy()
      expect(result.profiles?.snapshots.length).toBe(1)
      expect(result.profiles?.runId).toBe('run-123')
    })

    it('handles bare array format for profiles', () => {
      const artifacts: Artifact[] = [
        {
          id: '1',
          project_id: projectId,
          type: 'profiles',
          content_json: [
            {
              competitor_name: 'Test Competitor',
              positioning_one_liner: 'Test positioning',
              key_value_props: [],
              notable_capabilities: [],
              business_model_signals: [],
              proof_points: [],
              risks_and_unknowns: [],
            },
          ],
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      const result = normalizeResultsArtifacts(artifacts, projectId)

      expect(result.profiles).toBeTruthy()
      expect(result.profiles?.snapshots.length).toBe(1)
      expect(result.profiles?.runId).toBeNull() // Bare format has no run_id
    })
  })

  describe('returns null sections safely', () => {
    it('returns null for missing opportunities', () => {
      const artifacts: Artifact[] = []

      const result = normalizeResultsArtifacts(artifacts, projectId)

      expect(result.opportunities.v3).toBeNull()
      expect(result.opportunities.v2).toBeNull()
      expect(result.opportunities.best).toBeNull()
    })

    it('returns null for missing strategic bets', () => {
      const artifacts: Artifact[] = []

      const result = normalizeResultsArtifacts(artifacts, projectId)

      expect(result.strategicBets).toBeNull()
    })

    it('returns null for missing profiles', () => {
      const artifacts: Artifact[] = []

      const result = normalizeResultsArtifacts(artifacts, projectId)

      expect(result.profiles).toBeNull()
    })

    it('returns null for evidence summary when no citations', () => {
      const artifacts: Artifact[] = []

      const result = normalizeResultsArtifacts(artifacts, projectId)

      expect(result.evidenceSummary).toBeNull()
    })

    it('handles empty artifacts array', () => {
      const artifacts: Artifact[] = []

      const result = normalizeResultsArtifacts(artifacts, projectId)

      expect(result.opportunities.best).toBeNull()
      expect(result.strategicBets).toBeNull()
      expect(result.profiles).toBeNull()
      expect(result.jtbd).toBeNull()
      expect(result.evidenceSummary).toBeNull()
      expect(result.meta.availableArtifactTypes).toEqual([])
      expect(result.meta.schemaVersionsPresent).toEqual([])
    })
  })

  describe('metadata aggregation', () => {
    it('collects available artifact types', () => {
      const artifacts: Artifact[] = [
        {
          id: '1',
          project_id: projectId,
          type: 'opportunities_v3',
          content_json: {
            meta: { schema_version: 3, generated_at: '2024-01-01T00:00:00Z' },
            opportunities: [],
          },
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          project_id: projectId,
          type: 'strategic_bets',
          content_json: {
            meta: { schema_version: 2, generated_at: '2024-01-01T00:00:00Z' },
            bets: [],
          },
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      const result = normalizeResultsArtifacts(artifacts, projectId)

      expect(result.meta.availableArtifactTypes).toContain('opportunities_v3')
      expect(result.meta.availableArtifactTypes).toContain('strategic_bets')
      expect(result.meta.schemaVersionsPresent).toContain(3)
      expect(result.meta.schemaVersionsPresent).toContain(2)
    })
  })
})

