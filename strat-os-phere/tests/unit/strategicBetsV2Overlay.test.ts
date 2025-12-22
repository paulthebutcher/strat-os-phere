import { describe, it, expect } from 'vitest'
import {
  StrategicBetsV2OverlaySchema,
  type StrategicBetsV2Overlay,
} from '@/lib/schemas/strategicBetsV2Overlay'

describe('StrategicBetsV2OverlaySchema', () => {
  it('validates a valid v2 overlay', () => {
    const valid: StrategicBetsV2Overlay = {
      schema_version: 2,
      meta: {
        generated_at: '2024-01-01T00:00:00Z',
        window_days: 90,
        coverage_score: 80,
      },
      bets: [
        {
          id: 'bet-1',
          title: 'Prioritize real-time collaboration over async workflows',
          summary: 'We will prioritize real-time collaboration features even if it means sacrificing scalability for teams larger than 500 users.',
          what_we_say_no_to: ['Enterprise sales cycles longer than 3 months'],
          capability_we_must_build: ['Real-time collaboration infrastructure'],
          why_competitors_wont_follow_easily: 'Their enterprise sales model requires 6-month contracts, preventing quick pivots',
          risk_and_assumptions: ['Requires regulatory approval'],
          decision_owner: 'VP Product/UX',
          time_horizon: 'Now',
          citations: [
            {
              url: 'https://example.com/source1',
              source_type: 'pricing_page',
              extracted_at: '2024-01-01T00:00:00Z',
            },
          ],
        },
      ],
    }

    const result = StrategicBetsV2OverlaySchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.schema_version).toBe(2)
      expect(result.data.bets.length).toBe(1)
    }
  })

  it('rejects invalid schema version', () => {
    const invalid = {
      schema_version: 1, // Should be 2
      meta: {
        generated_at: '2024-01-01T00:00:00Z',
        window_days: 90,
      },
      bets: [],
    }

    const result = StrategicBetsV2OverlaySchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('requires at least one bet', () => {
    const invalid = {
      schema_version: 2,
      meta: {
        generated_at: '2024-01-01T00:00:00Z',
        window_days: 90,
      },
      bets: [],
    }

    const result = StrategicBetsV2OverlaySchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

