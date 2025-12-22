import { describe, it, expect } from 'vitest'
import {
  getOpportunityScore,
  getWhyNowSignals,
  getDecisionFrame,
} from '@/lib/results/opportunityUx'
import type { OpportunityV3Item } from '@/lib/schemas/opportunityV3'
import type { OpportunityItem } from '@/lib/schemas/opportunities'

describe('opportunityUx helpers', () => {
  describe('getOpportunityScore', () => {
    it('extracts score from V3 scoring.total', () => {
      const opp: Partial<OpportunityV3Item> = {
        scoring: {
          total: 85,
          breakdown: {} as any,
          weights: {} as any,
          explainability: [],
        },
      }
      expect(getOpportunityScore(opp as OpportunityV3Item)).toBe(85)
    })

    it('extracts score from V2 score field', () => {
      const opp: Partial<OpportunityItem> = {
        score: 75,
      }
      expect(getOpportunityScore(opp as OpportunityItem)).toBe(75)
    })

    it('returns null when no score field exists', () => {
      const opp = {}
      expect(getOpportunityScore(opp as any)).toBeNull()
    })

    it('handles missing fields gracefully', () => {
      expect(getOpportunityScore(null as any)).toBeNull()
      expect(getOpportunityScore(undefined as any)).toBeNull()
    })
  })

  describe('getWhyNowSignals', () => {
    it('extracts signals from citations', () => {
      const opp: Partial<OpportunityV3Item> = {
        citations: [
          {
            url: 'https://example.com/changelog',
            source_type: 'changelog',
            title: 'Recent Update',
            domain: 'example.com',
          },
          {
            url: 'https://example.com/pricing',
            source_type: 'pricing',
            title: 'Pricing Page',
            domain: 'example.com',
          },
        ],
      }
      const signals = getWhyNowSignals(opp as OpportunityV3Item)
      expect(signals.length).toBeGreaterThan(0)
      expect(signals.some((s) => s.kind === 'product_movement')).toBe(true)
      expect(signals.some((s) => s.kind === 'pricing_friction')).toBe(true)
    })

    it('infers signal type from URL patterns', () => {
      const opp: Partial<OpportunityV3Item> = {
        citations: [
          {
            url: 'https://example.com/releases/v1.0',
            title: 'Release Notes',
          },
        ],
      }
      const signals = getWhyNowSignals(opp as OpportunityV3Item)
      expect(signals.length).toBeGreaterThan(0)
      expect(signals[0].kind).toBe('product_movement')
    })

    it('returns generic signal when no citations exist', () => {
      const opp = {}
      const signals = getWhyNowSignals(opp as any)
      expect(signals.length).toBe(1)
      expect(signals[0].kind).toBe('generic')
    })

    it('handles missing fields gracefully', () => {
      expect(() => getWhyNowSignals(null as any)).not.toThrow()
      expect(() => getWhyNowSignals(undefined as any)).not.toThrow()
      expect(() => getWhyNowSignals({} as any)).not.toThrow()
    })
  })

  describe('getDecisionFrame', () => {
    it('extracts decision frame from V3 tradeoffs', () => {
      const opp: Partial<OpportunityV3Item> = {
        tradeoffs: {
          what_we_say_no_to: ['Feature A', 'Feature B'],
          capability_forced: ['Capability 1', 'Capability 2'],
          why_competitors_wont_follow: ['Reason 1', 'Reason 2'],
        },
      }
      const frame = getDecisionFrame(opp as OpportunityV3Item)
      expect(frame.noTo).toEqual(['Feature A', 'Feature B'])
      expect(frame.capability).toContain('Capability')
      expect(frame.defensibility).toContain('Reason')
      expect(frame.isDerived).toBe(false)
    })

    it('derives decision frame when fields are missing', () => {
      const opp: Partial<OpportunityV3Item> = {
        title: 'Data Analytics Opportunity',
        one_liner: 'Build ML-powered analytics',
        problem_today: 'Customers need better insights',
        proposed_move: 'Build ML infrastructure',
      }
      const frame = getDecisionFrame(opp as OpportunityV3Item)
      expect(frame.noTo.length).toBeGreaterThan(0)
      expect(frame.capability.length).toBeGreaterThan(0)
      expect(frame.defensibility.length).toBeGreaterThan(0)
      expect(frame.isDerived).toBe(true)
    })

    it('handles missing fields gracefully', () => {
      expect(() => getDecisionFrame(null as any)).not.toThrow()
      expect(() => getDecisionFrame(undefined as any)).not.toThrow()
      expect(() => getDecisionFrame({} as any)).not.toThrow()
    })

    it('derives capability based on opportunity content', () => {
      const opp: Partial<OpportunityV3Item> = {
        title: 'ML Analytics',
        one_liner: 'Build AI-powered insights',
        problem_today: 'Need better data analysis',
        proposed_move: 'Implement ML models',
      }
      const frame = getDecisionFrame(opp as OpportunityV3Item)
      expect(frame.capability).toContain('Data/ML')
    })
  })
})

