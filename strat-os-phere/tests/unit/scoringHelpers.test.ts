import { describe, it, expect } from 'vitest'
import {
  aggregateDimensionScores,
  computeWeightedCompetitorScores,
  computeJtbdOpportunityScore,
  computeOpportunityScore,
} from '@/lib/results/scoringHelpers'
import type { CriterionDimensionScores, ScoringCriterion, CriterionScore } from '@/lib/schemas/scoring'

describe('scoringHelpers', () => {
  describe('aggregateDimensionScores', () => {
    it('should aggregate dimension scores with friction inverted', () => {
      const dimensions: CriterionDimensionScores = {
        discovery_support: 0.8,
        execution_support: 0.7,
        reliability: 0.9,
        flexibility: 0.6,
        friction: 0.2, // Low friction (good) - will be inverted to 0.8
      }

      // Expected: (0.8 + 0.7 + 0.9 + 0.6 + (1 - 0.2)) / 5 = 3.8 / 5 = 0.76
      const result = aggregateDimensionScores(dimensions)
      expect(result).toBeCloseTo(0.76, 2)
    })

    it('should handle high friction correctly (inverted)', () => {
      const dimensions: CriterionDimensionScores = {
        discovery_support: 0.6,
        execution_support: 0.5,
        reliability: 0.7,
        flexibility: 0.4,
        friction: 0.9, // High friction (bad) - will be inverted to 0.1
      }

      // Expected: (0.6 + 0.5 + 0.7 + 0.4 + (1 - 0.9)) / 5 = 2.3 / 5 = 0.46
      const result = aggregateDimensionScores(dimensions)
      expect(result).toBeCloseTo(0.46, 2)
    })

    it('should clamp results to 0-1 range', () => {
      // Test edge case (shouldn't happen but safety check)
      const dimensions: CriterionDimensionScores = {
        discovery_support: 1.0,
        execution_support: 1.0,
        reliability: 1.0,
        flexibility: 1.0,
        friction: 0.0, // No friction (best case) - inverted to 1.0
      }

      const result = aggregateDimensionScores(dimensions)
      expect(result).toBeLessThanOrEqual(1.0)
      expect(result).toBeGreaterThanOrEqual(0.0)
    })
  })

  describe('computeWeightedCompetitorScores', () => {
    it('should compute weighted scores from dimension scores', () => {
      const criteria: ScoringCriterion[] = [
        {
          id: 'criterion-1',
          name: 'Criterion 1',
          description: 'Test criterion',
          weight: 5,
          how_to_score: 'Test rubric',
        },
        {
          id: 'criterion-2',
          name: 'Criterion 2',
          description: 'Test criterion 2',
          weight: 3,
          how_to_score: 'Test rubric 2',
        },
      ]

      const scores: CriterionScore[] = [
        {
          competitor_name: 'Competitor A',
          criteria_id: 'criterion-1',
          dimensions: {
            discovery_support: 0.8,
            execution_support: 0.7,
            reliability: 0.9,
            flexibility: 0.6,
            friction: 0.2, // Aggregated: (0.8 + 0.7 + 0.9 + 0.6 + 0.8) / 5 = 0.76
          },
        },
        {
          competitor_name: 'Competitor A',
          criteria_id: 'criterion-2',
          dimensions: {
            discovery_support: 0.6,
            execution_support: 0.5,
            reliability: 0.7,
            flexibility: 0.4,
            friction: 0.3, // Aggregated: (0.6 + 0.5 + 0.7 + 0.4 + 0.7) / 5 = 0.58
          },
        },
      ]

      const result = computeWeightedCompetitorScores(criteria, scores)
      
      // Total weight = 5 + 3 = 8
      // Normalized weights: criterion-1 = 5/8 = 0.625, criterion-2 = 3/8 = 0.375
      // Weighted score: 0.76 * 100 * 0.625 + 0.58 * 100 * 0.375 = 47.5 + 21.75 = 69.25
      expect(result.get('Competitor A')).toBeCloseTo(69.25, 2)
    })

    it('should handle multiple competitors with different scores', () => {
      const criteria: ScoringCriterion[] = [
        {
          id: 'criterion-1',
          name: 'Criterion 1',
          description: 'Test criterion',
          weight: 1,
          how_to_score: 'Test rubric',
        },
      ]

      const scores: CriterionScore[] = [
        {
          competitor_name: 'Competitor A',
          criteria_id: 'criterion-1',
          dimensions: {
            discovery_support: 0.62,
            execution_support: 0.74,
            reliability: 0.81,
            flexibility: 0.55,
            friction: 0.35, // Aggregated: (0.62 + 0.74 + 0.81 + 0.55 + 0.65) / 5 = 0.674
          },
        },
        {
          competitor_name: 'Competitor B',
          criteria_id: 'criterion-1',
          dimensions: {
            discovery_support: 0.45,
            execution_support: 0.38,
            reliability: 0.67,
            flexibility: 0.72,
            friction: 0.58, // Aggregated: (0.45 + 0.38 + 0.67 + 0.72 + 0.42) / 5 = 0.528
          },
        },
      ]

      const result = computeWeightedCompetitorScores(criteria, scores)
      
      // Competitor A: 0.674 * 100 = 67.4
      expect(result.get('Competitor A')).toBeCloseTo(67.4, 2)
      
      // Competitor B: 0.528 * 100 = 52.8
      expect(result.get('Competitor B')).toBeCloseTo(52.8, 2)
      
      // Verify scores show meaningful variance (not both 50)
      const scoreA = result.get('Competitor A')!
      const scoreB = result.get('Competitor B')!
      expect(Math.abs(scoreA - scoreB)).toBeGreaterThan(10)
      expect(scoreA).not.toBe(50)
      expect(scoreB).not.toBe(50)
      
      // Verify scores are in reasonable range
      expect(scoreA).toBeGreaterThan(55)
      expect(scoreA).toBeLessThan(75)
      expect(scoreB).toBeGreaterThan(50)
      expect(scoreB).toBeLessThan(60)
    })

    it('should preserve decimals in computed scores', () => {
      const criteria: ScoringCriterion[] = [
        {
          id: 'criterion-1',
          name: 'Criterion 1',
          description: 'Test criterion',
          weight: 1,
          how_to_score: 'Test rubric',
        },
      ]

      const scores: CriterionScore[] = [
        {
          competitor_name: 'Competitor A',
          criteria_id: 'criterion-1',
          dimensions: {
            discovery_support: 0.623,
            execution_support: 0.741,
            reliability: 0.812,
            flexibility: 0.553,
            friction: 0.351, // Aggregated: ~0.674
          },
        },
      ]

      const result = computeWeightedCompetitorScores(criteria, scores)
      const score = result.get('Competitor A')!
      
      // Should preserve decimals, not round to integer
      expect(score).not.toBe(Math.round(score))
      expect(score).toBeGreaterThan(67.0)
      expect(score).toBeLessThan(68.0)
    })
  })

  describe('computeJtbdOpportunityScore', () => {
    it('should compute opportunity score correctly', () => {
      // Formula: min(100, round(opportunity/2)) where opportunity = (importance * 20) + ((5 - satisfaction) * 20)
      // importance=5, satisfaction=1: opportunity = 100 + 80 = 180, score = min(100, 90) = 90
      const result = computeJtbdOpportunityScore(5, 1)
      expect(result).toBe(90)
    })
  })

  describe('computeOpportunityScore', () => {
    it('should compute opportunity score with all factors', () => {
      // Impact: high=80, Effort: S=+15, Confidence: high=+10, JTBD: 50 * 0.2 = 10
      // Total: 80 + 15 + 10 + 10 = 115, clamped to 100
      const result = computeOpportunityScore('high', 'S', 'high', 50)
      expect(result).toBe(100)
    })
  })
})

