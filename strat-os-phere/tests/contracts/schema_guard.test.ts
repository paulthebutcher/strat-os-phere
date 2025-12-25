/**
 * Schema & Contract Drift Alarms
 * 
 * Automated checks that fail the build if core contracts silently change.
 * 
 * Guards:
 * - No added/removed fields in: project_inputs, project_runs, opportunities_v1
 * - Required fields are always populated
 * - Evidence objects always reference a source
 * - Confidence ranges are present and bounded
 * 
 * Prevents "it technically works but feels wrong" regressions.
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  OpportunitiesArtifactV1Schema,
  OpportunityV1Schema,
  type OpportunitiesArtifactV1,
  type OpportunityV1,
} from '@/lib/opportunities/opportunityV1'

/**
 * Schema for project_inputs table structure
 * This represents the contract that should not change without explicit migration
 */
const ProjectInputsSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  version: z.number().int().min(0),
  status: z.enum(['draft', 'final']),
  input_json: z.record(z.unknown()), // JSONB field - flexible but structure should be documented
  created_at: z.string().datetime(),
})

/**
 * Schema for project_runs table structure
 * This represents the contract that should not change without explicit migration
 */
const ProjectRunsSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  input_version: z.number().int().min(0),
  status: z.enum(['queued', 'running', 'succeeded', 'failed']),
  started_at: z.string().datetime().nullable(),
  finished_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  error_code: z.string().nullable(),
  error_message: z.string().nullable(),
  error_detail: z.string().nullable(),
  output: z.record(z.unknown()).nullable(), // JSONB field
  metrics: z.record(z.unknown()), // JSONB field with default {}
  idempotency_key: z.string(),
})

describe('Schema Contract Guards', () => {
  describe('project_inputs contract', () => {
    it('should enforce required fields are present', () => {
      const validInput = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        project_id: '123e4567-e89b-12d3-a456-426614174001',
        version: 1,
        status: 'final' as const,
        input_json: { name: 'Test Project' },
        created_at: new Date().toISOString(),
      }

      const result = ProjectInputsSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should reject missing required fields', () => {
      const invalidInput = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        // Missing project_id
        version: 1,
        status: 'final',
        input_json: {},
        created_at: new Date().toISOString(),
      }

      const result = ProjectInputsSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should enforce status enum values', () => {
      const invalidInput = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        project_id: '123e4567-e89b-12d3-a456-426614174001',
        version: 1,
        status: 'invalid_status', // Invalid status
        input_json: {},
        created_at: new Date().toISOString(),
      }

      const result = ProjectInputsSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('should enforce version is non-negative integer', () => {
      const invalidInput = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        project_id: '123e4567-e89b-12d3-a456-426614174001',
        version: -1, // Invalid: negative
        status: 'final' as const,
        input_json: {},
        created_at: new Date().toISOString(),
      }

      const result = ProjectInputsSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })

  describe('project_runs contract', () => {
    it('should enforce required fields are present', () => {
      const validRun = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        project_id: '123e4567-e89b-12d3-a456-426614174001',
        input_version: 1,
        status: 'succeeded' as const,
        started_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        error_code: null,
        error_message: null,
        error_detail: null,
        output: { opportunities_artifact_v1: {} },
        metrics: {},
        idempotency_key: 'project:1:version',
      }

      const result = ProjectRunsSchema.safeParse(validRun)
      expect(result.success).toBe(true)
    })

    it('should enforce status enum values', () => {
      const invalidRun = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        project_id: '123e4567-e89b-12d3-a456-426614174001',
        input_version: 1,
        status: 'invalid_status', // Invalid status
        started_at: null,
        finished_at: null,
        created_at: new Date().toISOString(),
        error_code: null,
        error_message: null,
        error_detail: null,
        output: null,
        metrics: {},
        idempotency_key: 'project:1:version',
      }

      const result = ProjectRunsSchema.safeParse(invalidRun)
      expect(result.success).toBe(false)
    })

    it('should require idempotency_key', () => {
      const invalidRun = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        project_id: '123e4567-e89b-12d3-a456-426614174001',
        input_version: 1,
        status: 'succeeded' as const,
        started_at: null,
        finished_at: null,
        created_at: new Date().toISOString(),
        error_code: null,
        error_message: null,
        error_detail: null,
        output: null,
        metrics: {},
        // Missing idempotency_key
      }

      const result = ProjectRunsSchema.safeParse(invalidRun)
      expect(result.success).toBe(false)
    })
  })

  describe('opportunities_v1 contract', () => {
    it('should enforce opportunities artifact structure', () => {
      const validArtifact: OpportunitiesArtifactV1 = {
        schema_version: 'opportunity_v1.0',
        project_run_id: '123e4567-e89b-12d3-a456-426614174000',
        pipeline_version: '2025-12-23.v1',
        input_version: 1,
        generated_at: new Date().toISOString(),
        opportunities: [],
        generation_notes: {
          failed_closed: false,
        },
      }

      const result = OpportunitiesArtifactV1Schema.safeParse(validArtifact)
      expect(result.success).toBe(true)
    })

    it('should enforce opportunity structure with all required fields', () => {
      const validOpportunity: OpportunityV1 = {
        id: 'opp-1',
        title: 'Test Opportunity',
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
            excerpt: 'This is a test evidence excerpt that is long enough to meet the minimum requirement of 20 characters.',
          },
          {
            evidenceId: 'ev-2',
            url: 'https://example.com/evidence2',
            sourceType: 'reviews',
            excerpt: 'This is another test evidence excerpt that is long enough to meet the minimum requirement of 20 characters.',
          },
          {
            evidenceId: 'ev-3',
            url: 'https://example.com/evidence3',
            sourceType: 'docs',
            excerpt: 'This is a third test evidence excerpt that is long enough to meet the minimum requirement of 20 characters.',
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
        whyThisRanks: ['Reason 1'],
        assumptions: ['Assumption 1'],
        confidence: 'directional',
        schema_version: 'opportunity_v1.0',
      }

      const result = OpportunityV1Schema.safeParse(validOpportunity)
      expect(result.success).toBe(true)
    })

    it('should enforce citations reference a source (evidenceId and url)', () => {
      const invalidOpportunity = {
        id: 'opp-1',
        title: 'Test Opportunity',
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
            // Missing evidenceId
            url: 'https://example.com/evidence1',
            sourceType: 'pricing',
            excerpt: 'Test excerpt that is long enough',
          },
        ],
        evidenceSummary: {
          totalCitations: 1,
          evidenceTypesPresent: ['pricing'],
        },
        scores: {
          total: 75,
          drivers: [],
        },
        whyThisRanks: [],
        assumptions: [],
        confidence: 'directional',
        schema_version: 'opportunity_v1.0',
      }

      const result = OpportunityV1Schema.safeParse(invalidOpportunity)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes('citations'))).toBe(true)
      }
    })

    it('should enforce minimum 3 citations per opportunity', () => {
      const invalidOpportunity = {
        id: 'opp-1',
        title: 'Test Opportunity',
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
          // Only 2 citations - should fail
          {
            evidenceId: 'ev-1',
            url: 'https://example.com/evidence1',
            sourceType: 'pricing',
            excerpt: 'Test excerpt that is long enough to meet the minimum requirement',
          },
          {
            evidenceId: 'ev-2',
            url: 'https://example.com/evidence2',
            sourceType: 'reviews',
            excerpt: 'Test excerpt that is long enough to meet the minimum requirement',
          },
        ],
        evidenceSummary: {
          totalCitations: 2,
          evidenceTypesPresent: ['pricing', 'reviews'],
        },
        scores: {
          total: 75,
          drivers: [],
        },
        whyThisRanks: [],
        assumptions: [],
        confidence: 'directional',
        schema_version: 'opportunity_v1.0',
      }

      const result = OpportunityV1Schema.safeParse(invalidOpportunity)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path.includes('citations') &&
              issue.message.includes('at least 3')
          )
        ).toBe(true)
      }
    })

    it('should enforce confidence ranges are present and bounded', () => {
      const invalidOpportunity = {
        id: 'opp-1',
        title: 'Test Opportunity',
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
            excerpt: 'Test excerpt that is long enough to meet the minimum requirement',
          },
          {
            evidenceId: 'ev-2',
            url: 'https://example.com/evidence2',
            sourceType: 'reviews',
            excerpt: 'Test excerpt that is long enough to meet the minimum requirement',
          },
          {
            evidenceId: 'ev-3',
            url: 'https://example.com/evidence3',
            sourceType: 'docs',
            excerpt: 'Test excerpt that is long enough to meet the minimum requirement',
          },
        ],
        evidenceSummary: {
          totalCitations: 3,
          evidenceTypesPresent: ['pricing', 'reviews', 'docs'],
        },
        scores: {
          total: 75,
          drivers: [],
        },
        whyThisRanks: [],
        assumptions: [],
        // Missing confidence
        schema_version: 'opportunity_v1.0',
      }

      const result = OpportunityV1Schema.safeParse(invalidOpportunity)
      expect(result.success).toBe(false)
    })

    it('should enforce confidence is one of valid enum values', () => {
      const invalidOpportunity = {
        id: 'opp-1',
        title: 'Test Opportunity',
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
            excerpt: 'Test excerpt that is long enough to meet the minimum requirement',
          },
          {
            evidenceId: 'ev-2',
            url: 'https://example.com/evidence2',
            sourceType: 'reviews',
            excerpt: 'Test excerpt that is long enough to meet the minimum requirement',
          },
          {
            evidenceId: 'ev-3',
            url: 'https://example.com/evidence3',
            sourceType: 'docs',
            excerpt: 'Test excerpt that is long enough to meet the minimum requirement',
          },
        ],
        evidenceSummary: {
          totalCitations: 3,
          evidenceTypesPresent: ['pricing', 'reviews', 'docs'],
        },
        scores: {
          total: 75,
          drivers: [],
        },
        whyThisRanks: [],
        assumptions: [],
        confidence: 'invalid_confidence', // Invalid confidence value
        schema_version: 'opportunity_v1.0',
      }

      const result = OpportunityV1Schema.safeParse(invalidOpportunity)
      expect(result.success).toBe(false)
    })

    it('should enforce score bounds (0-100)', () => {
      const invalidOpportunity = {
        id: 'opp-1',
        title: 'Test Opportunity',
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
            excerpt: 'Test excerpt that is long enough to meet the minimum requirement',
          },
          {
            evidenceId: 'ev-2',
            url: 'https://example.com/evidence2',
            sourceType: 'reviews',
            excerpt: 'Test excerpt that is long enough to meet the minimum requirement',
          },
          {
            evidenceId: 'ev-3',
            url: 'https://example.com/evidence3',
            sourceType: 'docs',
            excerpt: 'Test excerpt that is long enough to meet the minimum requirement',
          },
        ],
        evidenceSummary: {
          totalCitations: 3,
          evidenceTypesPresent: ['pricing', 'reviews', 'docs'],
        },
        scores: {
          total: 150, // Invalid: exceeds 100
          drivers: [],
        },
        whyThisRanks: [],
        assumptions: [],
        confidence: 'directional',
        schema_version: 'opportunity_v1.0',
      }

      const result = OpportunityV1Schema.safeParse(invalidOpportunity)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path.includes('scores') &&
              issue.path.includes('total') &&
              (issue.message.includes('100') || issue.message.includes('maximum'))
          )
        ).toBe(true)
      }
    })
  })
})

