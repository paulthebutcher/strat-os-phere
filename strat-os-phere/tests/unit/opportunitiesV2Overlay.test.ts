import { describe, it, expect } from 'vitest'
import {
  OpportunitiesV2OverlaySchema,
  type OpportunitiesV2Overlay,
} from '@/lib/schemas/opportunitiesV2Overlay'

describe('OpportunitiesV2OverlaySchema', () => {
  it('validates a valid v2 overlay', () => {
    const valid: OpportunitiesV2Overlay = {
      schema_version: 2,
      meta: {
        generated_at: '2024-01-01T00:00:00Z',
        window_days: 90,
        coverage_score: 85,
      },
      opportunities: [
        {
          id: 'opp-1',
          title: 'Real-time collaboration during code review',
          one_liner: 'Enable real-time collaboration features',
          differentiation_mechanism: ['Native Slack integration', 'Real-time diff viewer'],
          why_competitors_wont_follow: [
            'Switching costs: Their architecture makes real-time expensive',
            'Org constraints: Enterprise sales model prevents quick pivots',
          ],
          first_experiment: {
            steps: ['Build prototype', 'Test with 10 users'],
            metric: '20% of users complete onboarding in <5 minutes',
            duration_days: 14,
          },
          confidence: 'high',
          citations: [
            {
              url: 'https://example.com/source1',
              source_type: 'pricing_page',
              extracted_at: '2024-01-01T00:00:00Z',
            },
          ],
          score: 85,
        },
      ],
    }

    const result = OpportunitiesV2OverlaySchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.schema_version).toBe(2)
      expect(result.data.opportunities.length).toBe(1)
    }
  })

  it('rejects invalid schema version', () => {
    const invalid = {
      schema_version: 1, // Should be 2
      meta: {
        generated_at: '2024-01-01T00:00:00Z',
        window_days: 90,
      },
      opportunities: [],
    }

    const result = OpportunitiesV2OverlaySchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('requires at least one opportunity', () => {
    const invalid = {
      schema_version: 2,
      meta: {
        generated_at: '2024-01-01T00:00:00Z',
        window_days: 90,
      },
      opportunities: [],
    }

    const result = OpportunitiesV2OverlaySchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

