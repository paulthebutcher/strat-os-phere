import { describe, it, expect } from 'vitest'
import { CompetitorSnapshotSchema } from '@/lib/schemas/competitorSnapshot'

describe('CompetitorSnapshotSchema', () => {
  it('validates a correct CompetitorSnapshot JSON', () => {
    const validSnapshot = {
      competitor_name: 'Example Corp',
      positioning_one_liner: 'A leading provider of example solutions',
      target_audience: ['Enterprise clients', 'Small businesses'],
      primary_use_cases: ['Use case 1', 'Use case 2'],
      key_value_props: ['Value prop 1', 'Value prop 2'],
      notable_capabilities: ['Capability 1'],
      business_model_signals: ['Signal 1'],
      proof_points: [
        {
          claim: 'Test claim',
          evidence_quote: 'Evidence quote text',
          evidence_location: 'pasted_text',
          confidence: 'high',
        },
      ],
      risks_and_unknowns: ['Risk 1'],
    }

    const result = CompetitorSnapshotSchema.safeParse(validSnapshot)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.competitor_name).toBe('Example Corp')
    }
  })

  it('rejects invalid shapes with missing required fields', () => {
    const invalidSnapshot = {
      competitor_name: 'Example Corp',
      // Missing positioning_one_liner
      target_audience: ['Enterprise clients'],
    }

    const result = CompetitorSnapshotSchema.safeParse(invalidSnapshot)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0)
      const missingFields = result.error.issues.map((i) => i.path.join('.'))
      expect(missingFields.some((f) => f.includes('positioning_one_liner'))).toBe(true)
    }
  })

  it('rejects empty arrays for required array fields', () => {
    const invalidSnapshot = {
      competitor_name: 'Example Corp',
      positioning_one_liner: 'Test',
      target_audience: [], // Empty array should fail
      primary_use_cases: ['Use case 1'],
      key_value_props: ['Value prop 1'],
      notable_capabilities: ['Capability 1'],
      business_model_signals: ['Signal 1'],
      proof_points: [
        {
          claim: 'Test claim',
          evidence_quote: 'Evidence',
          evidence_location: 'pasted_text',
          confidence: 'high',
        },
      ],
      risks_and_unknowns: ['Risk 1'],
    }

    const result = CompetitorSnapshotSchema.safeParse(invalidSnapshot)
    expect(result.success).toBe(false)
  })

  it('enforces max length on key_value_props', () => {
    const invalidSnapshot = {
      competitor_name: 'Example Corp',
      positioning_one_liner: 'Test',
      target_audience: ['Audience'],
      primary_use_cases: ['Use case'],
      key_value_props: Array(7).fill('Value prop'), // 7 items, max is 6
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
    }

    const result = CompetitorSnapshotSchema.safeParse(invalidSnapshot)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('key_value_props'))).toBe(true)
    }
  })

  it('validates confidence enum values', () => {
    const invalidSnapshot = {
      competitor_name: 'Example Corp',
      positioning_one_liner: 'Test',
      target_audience: ['Audience'],
      primary_use_cases: ['Use case'],
      key_value_props: ['Value prop'],
      notable_capabilities: ['Capability'],
      business_model_signals: ['Signal'],
      proof_points: [
        {
          claim: 'Claim',
          evidence_quote: 'Evidence',
          evidence_location: 'pasted_text',
          confidence: 'invalid', // Invalid confidence value
        },
      ],
      risks_and_unknowns: ['Risk'],
    }

    const result = CompetitorSnapshotSchema.safeParse(invalidSnapshot)
    expect(result.success).toBe(false)
  })
})

