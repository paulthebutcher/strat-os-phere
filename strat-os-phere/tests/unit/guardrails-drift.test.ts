import { describe, it, expect } from 'vitest'
import { extractArtifactContent } from '@/lib/guardrails/drift'
import type { Artifact } from '@/lib/supabase/types'
import type { JtbdArtifactContent, OpportunitiesArtifactContent, ScoringMatrixArtifactContent } from '@/lib/schemas/artifacts'

describe('drift guardrails - extractArtifactContent', () => {
  const createMockJtbdContent = (): JtbdArtifactContent => ({
    jobs: [
      {
        job_statement: 'Test job',
        opportunity_score: 10,
        evidence_snippets: [],
      },
    ],
  })

  const createMockOpportunitiesContent = (): OpportunitiesArtifactContent => ({
    opportunities: [
      {
        opportunity: 'Test opportunity',
        score: 15,
        evidence: [],
      },
    ],
  })

  const createMockScoringContent = (): ScoringMatrixArtifactContent => ({
    summary: [
      {
        competitor_name: 'Competitor A',
        total_weighted_score: 80,
      },
    ],
  })

  const createArtifact = (
    type: string, // Using string to simulate DB type mismatch
    contentJson: unknown,
    createdAt = '2024-01-01T00:00:00Z',
    schemaVersion?: number
  ): Artifact => {
    const content = schemaVersion !== undefined
      ? { ...(contentJson as object), schema_version: schemaVersion }
      : contentJson

    return {
      id: `artifact_${Date.now()}_${Math.random()}`,
      project_id: 'project_1',
      type: type as any, // Cast to simulate DB type mismatch
      content_json: content,
      created_at: createdAt,
    }
  }

  describe('canonical artifact types', () => {
    it('picks JTBD artifact when using canonical type', () => {
      const jtbdContent = createMockJtbdContent()
      const artifact = createArtifact('jtbd', jtbdContent, '2024-01-02T00:00:00Z')

      const result = extractArtifactContent([artifact])

      expect(result.jtbd).toBeDefined()
      expect(result.jtbd?.jobs).toHaveLength(1)
      expect(result.jtbd?.jobs[0].job_statement).toBe('Test job')
    })

    it('picks opportunities_v2 artifact when using canonical type', () => {
      const oppContent = createMockOpportunitiesContent()
      const artifact = createArtifact('opportunities_v2', oppContent, '2024-01-02T00:00:00Z')

      const result = extractArtifactContent([artifact])

      expect(result.opportunities).toBeDefined()
      expect(result.opportunities?.opportunities).toHaveLength(1)
    })

    it('picks scoring_matrix artifact when using canonical type', () => {
      const scoringContent = createMockScoringContent()
      const artifact = createArtifact('scoring_matrix', scoringContent, '2024-01-02T00:00:00Z')

      const result = extractArtifactContent([artifact])

      expect(result.scoringMatrix).toBeDefined()
      expect(result.scoringMatrix?.summary).toHaveLength(1)
    })
  })

  describe('legacy type compatibility', () => {
    it('handles legacy string types from older DB rows', () => {
      // Simulate older DB row where type is stored as 'jtbd' string
      // but DB type definition only includes 'profiles' | 'synthesis'
      const jtbdContent = createMockJtbdContent()
      const artifact = createArtifact('jtbd', jtbdContent, '2024-01-02T00:00:00Z')

      const result = extractArtifactContent([artifact])

      // Should still work because normalizeArtifactType handles it
      expect(result.jtbd).toBeDefined()
      expect(result.jtbd?.jobs).toHaveLength(1)
    })

    it('handles mixed legacy and canonical types', () => {
      const jtbdContent1 = createMockJtbdContent()
      const jtbdContent2 = createMockJtbdContent()
      jtbdContent2.jobs[0].job_statement = 'Newer job'

      const artifact1 = createArtifact('jtbd', jtbdContent1, '2024-01-01T00:00:00Z')
      const artifact2 = createArtifact('jtbd', jtbdContent2, '2024-01-02T00:00:00Z')

      const result = extractArtifactContent([artifact1, artifact2])

      // Should pick the newest one
      expect(result.jtbd).toBeDefined()
      expect(result.jtbd?.jobs[0].job_statement).toBe('Newer job')
    })
  })

  describe('sorting preferences', () => {
    it('prefers newest created_at when multiple artifacts exist', () => {
      const jtbdContent1 = createMockJtbdContent()
      const jtbdContent2 = createMockJtbdContent()
      jtbdContent2.jobs[0].job_statement = 'Newest job'

      const artifact1 = createArtifact('jtbd', jtbdContent1, '2024-01-01T00:00:00Z')
      const artifact2 = createArtifact('jtbd', jtbdContent2, '2024-01-03T00:00:00Z')
      const artifact3 = createArtifact('jtbd', jtbdContent1, '2024-01-02T00:00:00Z')

      const result = extractArtifactContent([artifact1, artifact2, artifact3])

      expect(result.jtbd?.jobs[0].job_statement).toBe('Newest job')
    })

    it('prefers schema_version 2 artifacts when present', () => {
      const jtbdContent1 = createMockJtbdContent()
      const jtbdContent2 = createMockJtbdContent()
      jtbdContent2.jobs[0].job_statement = 'V2 job'

      // Older artifact with v2
      const artifact1 = createArtifact('jtbd', jtbdContent2, '2024-01-01T00:00:00Z', 2)
      // Newer artifact without version (assumed v1)
      const artifact2 = createArtifact('jtbd', jtbdContent1, '2024-01-03T00:00:00Z')

      const result = extractArtifactContent([artifact1, artifact2])

      // Should prefer v2 even though it's older
      expect(result.jtbd?.jobs[0].job_statement).toBe('V2 job')
    })

    it('prefers newest created_at when both have same schema_version', () => {
      const jtbdContent1 = createMockJtbdContent()
      const jtbdContent2 = createMockJtbdContent()
      jtbdContent2.jobs[0].job_statement = 'Newer v2 job'

      const artifact1 = createArtifact('jtbd', jtbdContent1, '2024-01-01T00:00:00Z', 2)
      const artifact2 = createArtifact('jtbd', jtbdContent2, '2024-01-02T00:00:00Z', 2)

      const result = extractArtifactContent([artifact1, artifact2])

      expect(result.jtbd?.jobs[0].job_statement).toBe('Newer v2 job')
    })
  })

  describe('multiple artifact types', () => {
    it('extracts all artifact types simultaneously', () => {
      const jtbdArtifact = createArtifact('jtbd', createMockJtbdContent(), '2024-01-01T00:00:00Z')
      const oppArtifact = createArtifact('opportunities_v2', createMockOpportunitiesContent(), '2024-01-01T00:00:00Z')
      const scoringArtifact = createArtifact('scoring_matrix', createMockScoringContent(), '2024-01-01T00:00:00Z')

      const result = extractArtifactContent([jtbdArtifact, oppArtifact, scoringArtifact])

      expect(result.jtbd).toBeDefined()
      expect(result.opportunities).toBeDefined()
      expect(result.scoringMatrix).toBeDefined()
    })

    it('handles missing artifact types gracefully', () => {
      const jtbdArtifact = createArtifact('jtbd', createMockJtbdContent(), '2024-01-01T00:00:00Z')

      const result = extractArtifactContent([jtbdArtifact])

      expect(result.jtbd).toBeDefined()
      expect(result.opportunities).toBeUndefined()
      expect(result.scoringMatrix).toBeUndefined()
    })

    it('ignores unrelated artifact types', () => {
      const jtbdArtifact = createArtifact('jtbd', createMockJtbdContent(), '2024-01-01T00:00:00Z')
      const profilesArtifact = createArtifact('profiles', { snapshots: [] }, '2024-01-01T00:00:00Z')
      const synthesisArtifact = createArtifact('synthesis', { synthesis: {} }, '2024-01-01T00:00:00Z')

      const result = extractArtifactContent([jtbdArtifact, profilesArtifact, synthesisArtifact])

      expect(result.jtbd).toBeDefined()
      expect(result.opportunities).toBeUndefined()
      expect(result.scoringMatrix).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('handles empty artifacts array', () => {
      const result = extractArtifactContent([])

      expect(result.jtbd).toBeUndefined()
      expect(result.opportunities).toBeUndefined()
      expect(result.scoringMatrix).toBeUndefined()
    })

    it('handles artifacts with null content_json', () => {
      const artifact: Artifact = {
        id: 'artifact_1',
        project_id: 'project_1',
        type: 'jtbd' as any,
        content_json: null,
        created_at: '2024-01-01T00:00:00Z',
      }

      const result = extractArtifactContent([artifact])

      expect(result.jtbd).toBeUndefined()
    })

    it('handles invalid artifact type strings gracefully', () => {
      const artifact = createArtifact('invalid_type', { data: 'test' }, '2024-01-01T00:00:00Z')

      const result = extractArtifactContent([artifact])

      expect(result.jtbd).toBeUndefined()
      expect(result.opportunities).toBeUndefined()
      expect(result.scoringMatrix).toBeUndefined()
    })
  })
})
