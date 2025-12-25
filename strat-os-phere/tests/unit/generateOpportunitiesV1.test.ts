import { describe, it, expect } from 'vitest'
import { generateOpportunitiesV1 } from '@/lib/opportunities/generateOpportunitiesV1'
import type { NormalizedEvidenceItem, NormalizedEvidenceBundle } from '@/lib/evidence/types'
import { OpportunityV1Schema } from '@/lib/opportunities/opportunityV1'

describe('generateOpportunitiesV1', () => {
  const projectRunId = '123e4567-e89b-12d3-a456-426614174000'
  const pipelineVersion = 'test-v1'
  const inputVersion = 1

  function createEvidenceItem(
    index: number,
    type: NormalizedEvidenceItem['type'] = 'pricing',
    domain: string = 'example.com'
  ): NormalizedEvidenceItem {
    return {
      id: `ev-${index}`,
      type,
      title: `Evidence ${index}`,
      url: `https://${domain}/evidence-${index}`,
      domain,
      snippet: `This is a detailed evidence snippet for item ${index} that is long enough to meet the minimum requirement of 20 characters.`,
      retrievedAt: new Date().toISOString(),
    }
  }

  function createEvidenceBundle(items: NormalizedEvidenceItem[]): NormalizedEvidenceBundle {
    return {
      id: 'bundle-1',
      projectId: 'project-1',
      createdAt: new Date().toISOString(),
      items,
    }
  }

  describe('with sufficient evidence', () => {
    it('generates at least 1 opportunity when evidence meets gating requirements', async () => {
      // Create evidence with ≥3 citations across ≥2 types
      const evidenceItems: NormalizedEvidenceItem[] = [
        createEvidenceItem(1, 'pricing', 'example.com'),
        createEvidenceItem(2, 'pricing', 'example.com'),
        createEvidenceItem(3, 'reviews', 'example2.com'),
        createEvidenceItem(4, 'docs', 'example3.com'),
      ]

      const evidenceBundle = createEvidenceBundle(evidenceItems)

      const result = await generateOpportunitiesV1({
        projectRunId,
        pipelineVersion,
        inputVersion,
        evidenceBundle,
        projectContext: {
          projectId: 'project-1',
          market: 'SaaS tools',
          targetCustomer: 'product managers',
        },
      })

      expect(result.artifact.opportunities.length).toBeGreaterThanOrEqual(1)
      expect(result.artifact.generation_notes?.failed_closed).toBe(false)
    })

    it('generates opportunities that pass schema validation', async () => {
      const evidenceItems: NormalizedEvidenceItem[] = [
        createEvidenceItem(1, 'pricing', 'example.com'),
        createEvidenceItem(2, 'pricing', 'example.com'),
        createEvidenceItem(3, 'reviews', 'example2.com'),
        createEvidenceItem(4, 'docs', 'example3.com'),
        createEvidenceItem(5, 'changelog', 'example4.com'),
      ]

      const evidenceBundle = createEvidenceBundle(evidenceItems)

      const result = await generateOpportunitiesV1({
        projectRunId,
        pipelineVersion,
        inputVersion,
        evidenceBundle,
        projectContext: {
          projectId: 'project-1',
          market: 'SaaS tools',
          targetCustomer: 'product managers',
        },
      })

      // Validate each opportunity passes schema
      for (const opportunity of result.artifact.opportunities) {
        const validation = OpportunityV1Schema.safeParse(opportunity)
        expect(validation.success).toBe(true)
        if (!validation.success) {
          console.error('Validation errors:', validation.error.issues)
        }
      }
    })

    it('generates opportunities with JTBD and citations', async () => {
      const evidenceItems: NormalizedEvidenceItem[] = [
        createEvidenceItem(1, 'pricing', 'example.com'),
        createEvidenceItem(2, 'pricing', 'example.com'),
        createEvidenceItem(3, 'reviews', 'example2.com'),
        createEvidenceItem(4, 'docs', 'example3.com'),
      ]

      const evidenceBundle = createEvidenceBundle(evidenceItems)

      const result = await generateOpportunitiesV1({
        projectRunId,
        pipelineVersion,
        inputVersion,
        evidenceBundle,
        projectContext: {
          projectId: 'project-1',
          market: 'SaaS tools',
          targetCustomer: 'product managers',
        },
      })

      expect(result.artifact.opportunities.length).toBeGreaterThan(0)

      for (const opportunity of result.artifact.opportunities) {
        // Check JTBD is present and valid
        expect(opportunity.jtbd).toBeDefined()
        expect(opportunity.jtbd.job).toBeTruthy()
        expect(opportunity.jtbd.context).toBeTruthy()

        // Check citations are present and meet minimum
        expect(opportunity.citations.length).toBeGreaterThanOrEqual(3)
        expect(opportunity.citations.every((c) => c.url && c.excerpt.length >= 20)).toBe(true)
      }
    })

    it('generates up to 2 candidates when evidence is sufficient', async () => {
      // Create evidence with ≥4 citations across ≥2 types (triggers second candidate)
      const evidenceItems: NormalizedEvidenceItem[] = [
        createEvidenceItem(1, 'pricing', 'example.com'),
        createEvidenceItem(2, 'pricing', 'example.com'),
        createEvidenceItem(3, 'reviews', 'example2.com'),
        createEvidenceItem(4, 'docs', 'example3.com'),
        createEvidenceItem(5, 'changelog', 'example4.com'),
      ]

      const evidenceBundle = createEvidenceBundle(evidenceItems)

      const result = await generateOpportunitiesV1({
        projectRunId,
        pipelineVersion,
        inputVersion,
        evidenceBundle,
        projectContext: {
          projectId: 'project-1',
          market: 'SaaS tools',
          targetCustomer: 'product managers',
        },
      })

      // Should generate 1-2 opportunities (may be filtered by gating)
      expect(result.artifact.opportunities.length).toBeGreaterThanOrEqual(1)
      expect(result.artifact.opportunities.length).toBeLessThanOrEqual(2)
    })
  })

  describe('with insufficient evidence', () => {
    it('returns empty opportunities when evidence insufficient', async () => {
      // Create evidence with <3 citations
      const evidenceItems: NormalizedEvidenceItem[] = [
        createEvidenceItem(1, 'pricing', 'example.com'),
        createEvidenceItem(2, 'pricing', 'example.com'),
      ]

      const evidenceBundle = createEvidenceBundle(evidenceItems)

      const result = await generateOpportunitiesV1({
        projectRunId,
        pipelineVersion,
        inputVersion,
        evidenceBundle,
      })

      expect(result.artifact.opportunities).toHaveLength(0)
      expect(result.artifact.generation_notes?.failed_closed).toBe(true)
      expect(result.artifact.generation_notes?.reasons).toBeDefined()
      expect(result.artifact.generation_notes?.reasons?.length).toBeGreaterThan(0)
    })

    it('returns empty when citations span only 1 type', async () => {
      // Create evidence with ≥3 citations but only 1 type
      const evidenceItems: NormalizedEvidenceItem[] = [
        createEvidenceItem(1, 'pricing', 'example.com'),
        createEvidenceItem(2, 'pricing', 'example.com'),
        createEvidenceItem(3, 'pricing', 'example.com'),
      ]

      const evidenceBundle = createEvidenceBundle(evidenceItems)

      const result = await generateOpportunitiesV1({
        projectRunId,
        pipelineVersion,
        inputVersion,
        evidenceBundle,
      })

      expect(result.artifact.opportunities).toHaveLength(0)
      expect(result.artifact.generation_notes?.failed_closed).toBe(true)
    })

    it('returns empty when no evidence bundle provided', async () => {
      const result = await generateOpportunitiesV1({
        projectRunId,
        pipelineVersion,
        inputVersion,
        evidenceBundle: null,
      })

      expect(result.artifact.opportunities).toHaveLength(0)
      expect(result.artifact.generation_notes?.failed_closed).toBe(true)
      expect(result.artifact.generation_notes?.reasons).toContain('No evidence items available')
    })

    it('returns empty when evidence items have insufficient excerpts', async () => {
      // Create evidence with short excerpts
      const evidenceItems: NormalizedEvidenceItem[] = [
        {
          id: 'ev-1',
          type: 'pricing',
          title: 'Evidence 1',
          url: 'https://example.com/1',
          snippet: 'Short', // Too short
        },
        {
          id: 'ev-2',
          type: 'pricing',
          title: 'Evidence 2',
          url: 'https://example.com/2',
          snippet: 'Also short', // Too short
        },
        {
          id: 'ev-3',
          type: 'reviews',
          title: 'Evidence 3',
          url: 'https://example.com/3',
          snippet: 'Still short', // Too short
        },
      ]

      const evidenceBundle = createEvidenceBundle(evidenceItems)

      const result = await generateOpportunitiesV1({
        projectRunId,
        pipelineVersion,
        inputVersion,
        evidenceBundle,
      })

      expect(result.artifact.opportunities).toHaveLength(0)
      expect(result.artifact.generation_notes?.failed_closed).toBe(true)
    })
  })

  describe('artifact structure', () => {
    it('stores artifact with schema_version and project_run_id linkage', async () => {
      const evidenceItems: NormalizedEvidenceItem[] = [
        createEvidenceItem(1, 'pricing', 'example.com'),
        createEvidenceItem(2, 'pricing', 'example.com'),
        createEvidenceItem(3, 'reviews', 'example2.com'),
        createEvidenceItem(4, 'docs', 'example3.com'),
      ]

      const evidenceBundle = createEvidenceBundle(evidenceItems)

      const result = await generateOpportunitiesV1({
        projectRunId,
        pipelineVersion,
        inputVersion,
        evidenceBundle,
      })

      expect(result.artifact.schema_version).toBe('opportunity_v1.0')
      expect(result.artifact.project_run_id).toBe(projectRunId)
      expect(result.artifact.pipeline_version).toBe(pipelineVersion)
      expect(result.artifact.input_version).toBe(inputVersion)
      expect(result.artifact.generated_at).toBeDefined()
    })

    it('includes evidence stats in generation notes', async () => {
      const evidenceItems: NormalizedEvidenceItem[] = [
        createEvidenceItem(1, 'pricing', 'example.com'),
        createEvidenceItem(2, 'pricing', 'example.com'),
        createEvidenceItem(3, 'reviews', 'example2.com'),
      ]

      const evidenceBundle = createEvidenceBundle(evidenceItems)

      const result = await generateOpportunitiesV1({
        projectRunId,
        pipelineVersion,
        inputVersion,
        evidenceBundle,
      })

      expect(result.artifact.generation_notes?.evidence_stats).toBeDefined()
      expect(result.artifact.generation_notes?.evidence_stats?.totalEvidenceItems).toBe(3)
      expect(result.artifact.generation_notes?.evidence_stats?.evidenceTypesPresent).toContain('pricing')
      expect(result.artifact.generation_notes?.evidence_stats?.evidenceTypesPresent).toContain('reviews')
    })
  })

  describe('deterministic behavior', () => {
    it('generates same opportunities for same evidence (deterministic)', async () => {
      const evidenceItems: NormalizedEvidenceItem[] = [
        createEvidenceItem(1, 'pricing', 'example.com'),
        createEvidenceItem(2, 'pricing', 'example.com'),
        createEvidenceItem(3, 'reviews', 'example2.com'),
        createEvidenceItem(4, 'docs', 'example3.com'),
      ]

      const evidenceBundle = createEvidenceBundle(evidenceItems)

      const result1 = await generateOpportunitiesV1({
        projectRunId,
        pipelineVersion,
        inputVersion,
        evidenceBundle,
        projectContext: {
          projectId: 'project-1',
          market: 'SaaS tools',
        },
      })

      const result2 = await generateOpportunitiesV1({
        projectRunId,
        pipelineVersion,
        inputVersion,
        evidenceBundle,
        projectContext: {
          projectId: 'project-1',
          market: 'SaaS tools',
        },
      })

      // Should generate same number of opportunities
      expect(result1.artifact.opportunities.length).toBe(result2.artifact.opportunities.length)

      // Titles should match (deterministic generation)
      if (result1.artifact.opportunities.length > 0 && result2.artifact.opportunities.length > 0) {
        expect(result1.artifact.opportunities[0].title).toBe(result2.artifact.opportunities[0].title)
      }
    })
  })
})

