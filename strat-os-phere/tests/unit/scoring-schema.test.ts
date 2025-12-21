import { describe, it, expect } from 'vitest'
import {
  ScoringCriterionSchema,
  ScoringMatrixArtifactContentSchema,
} from '@/lib/schemas/scoring'
import { safeParseLLMJson } from '@/lib/schemas/safeParseLLMJson'

describe('ScoringSchema', () => {
  describe('ScoringCriterionSchema', () => {
    it('should normalize missing description to empty string', () => {
      const sample = {
        id: '1',
        name: 'Test Criterion',
        // description is missing
        weight: 3,
        how_to_score: 'Score based on X',
      }

      const parsed = ScoringCriterionSchema.parse(sample)
      
      expect(parsed.description).toBe('')
      expect(typeof parsed.description).toBe('string')
    })

    it('should preserve provided description', () => {
      const sample = {
        id: '1',
        name: 'Test Criterion',
        description: 'This is a test description',
        weight: 3,
        how_to_score: 'Score based on X',
      }

      const parsed = ScoringCriterionSchema.parse(sample)
      
      expect(parsed.description).toBe('This is a test description')
      expect(typeof parsed.description).toBe('string')
    })

    it('should normalize missing how_to_score to empty string', () => {
      const sample = {
        id: '1',
        name: 'Test Criterion',
        description: 'Test',
        weight: 3,
        // how_to_score is missing
      }

      const parsed = ScoringCriterionSchema.parse(sample)
      
      expect(parsed.how_to_score).toBe('')
      expect(typeof parsed.how_to_score).toBe('string')
    })
  })

  describe('ScoringMatrixArtifactContentSchema', () => {
    it('should parse successfully when criteria description is missing', () => {
      const sample = {
        meta: {
          schema_version: 2,
          generated_at: new Date().toISOString(),
        },
        criteria: [
          {
            id: '1',
            name: 'Criterion X',
            // description is missing
            how_to_score: 'Score based on Y',
          },
        ],
        competitors: [
          {
            competitor_name: 'Competitor A',
          },
        ],
        scores: [],
        summary: [],
      }

      const parsed = ScoringMatrixArtifactContentSchema.parse(sample)
      
      expect(parsed.criteria[0].description).toBe('')
      expect(typeof parsed.criteria[0].description).toBe('string')
      expect(parsed.criteria.length).toBe(1)
    })

    it('should parse successfully with multiple criteria missing descriptions', () => {
      const sample = {
        meta: {
          schema_version: 2,
          generated_at: new Date().toISOString(),
        },
        criteria: [
          {
            id: '1',
            name: 'Criterion 1',
            // description missing
          },
          {
            id: '2',
            name: 'Criterion 2',
            description: 'Has description',
          },
          {
            id: '3',
            name: 'Criterion 3',
            // description missing
          },
        ],
        competitors: [
          {
            competitor_name: 'Competitor A',
          },
        ],
        scores: [],
        summary: [],
      }

      const parsed = ScoringMatrixArtifactContentSchema.parse(sample)
      
      expect(parsed.criteria[0].description).toBe('')
      expect(parsed.criteria[1].description).toBe('Has description')
      expect(parsed.criteria[2].description).toBe('')
      expect(parsed.criteria.every(c => typeof c.description === 'string')).toBe(true)
    })
  })

  describe('safeParseLLMJson with ScoringMatrixArtifactContentSchema', () => {
    it('should parse JSON string with missing description field', () => {
      const jsonString = JSON.stringify({
        meta: {
          schema_version: 2,
          generated_at: new Date().toISOString(),
        },
        criteria: [
          {
            id: '1',
            name: 'Test Criterion',
            // description is missing
            how_to_score: 'Score it',
          },
        ],
        competitors: [
          {
            competitor_name: 'Competitor A',
          },
        ],
        scores: [],
        summary: [],
      })

      const result = safeParseLLMJson(jsonString, ScoringMatrixArtifactContentSchema)
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.criteria[0].description).toBe('')
        expect(typeof result.data.criteria[0].description).toBe('string')
      }
    })

    it('should parse JSON string wrapped in code fences with missing description', () => {
      const jsonString = `\`\`\`json
{
  "meta": {
    "schema_version": 2,
    "generated_at": "${new Date().toISOString()}"
  },
  "criteria": [
    {
      "id": "1",
      "name": "Test Criterion"
    }
  ],
  "competitors": [
    {
      "competitor_name": "Competitor A"
    }
  ],
  "scores": [],
  "summary": []
}
\`\`\``

      const result = safeParseLLMJson(jsonString, ScoringMatrixArtifactContentSchema)
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.criteria[0].description).toBe('')
        expect(typeof result.data.criteria[0].description).toBe('string')
        expect(result.data.criteria[0].how_to_score).toBe('')
        expect(typeof result.data.criteria[0].how_to_score).toBe('string')
      }
    })

    it('should ensure all criteria have string description after parsing', () => {
      const jsonString = JSON.stringify({
        meta: {
          schema_version: 2,
          generated_at: new Date().toISOString(),
        },
        criteria: [
          { id: '1', name: 'Criterion 1' },
          { id: '2', name: 'Criterion 2', description: 'Has description' },
          { id: '3', name: 'Criterion 3' },
        ],
        competitors: [{ competitor_name: 'A' }],
        scores: [],
        summary: [],
      })

      const result = safeParseLLMJson(jsonString, ScoringMatrixArtifactContentSchema)
      
      expect(result.ok).toBe(true)
      if (result.ok) {
        // All descriptions should be strings, never undefined
        result.data.criteria.forEach((criterion) => {
          expect(typeof criterion.description).toBe('string')
          expect(criterion.description).toBeDefined()
        })
      }
    })
  })
})

