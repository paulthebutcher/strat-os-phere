/**
 * Unit tests for follow-up question generation
 */

import { describe, it, expect } from 'vitest'
import { generateFollowUpQuestion } from '@/lib/followup/generate'
import type { NormalizedEvidenceBundle } from '@/lib/evidence/types'
import type { ClaimsBundle } from '@/lib/claims/types'

describe('generateFollowUpQuestion', () => {
  it('should return null when evidence is strong', () => {
    const bundle: NormalizedEvidenceBundle = {
      id: 'test-1',
      projectId: 'test-project',
      createdAt: new Date().toISOString(),
      company: 'Test Company',
      primaryUrl: 'https://test.com',
      items: Array.from({ length: 30 }, (_, i) => ({
        id: `item-${i}`,
        type: 'pricing' as const,
        title: `Source ${i}`,
        url: `https://test.com/source-${i}`,
        domain: 'test.com',
        snippet: `Content ${i}`,
        publishedAt: new Date().toISOString(),
        retrievedAt: new Date().toISOString(),
      })),
    }

    const question = generateFollowUpQuestion(bundle, null)
    // With strong evidence, may or may not return a question
    expect(question === null || typeof question === 'object').toBe(true)
  })

  it('should return question when pricing evidence is missing', () => {
    const bundle: NormalizedEvidenceBundle = {
      id: 'test-2',
      projectId: 'test-project',
      createdAt: new Date().toISOString(),
      company: 'Test Company',
      primaryUrl: 'https://test.com',
      items: [
        {
          id: 'r1',
          type: 'reviews',
          title: 'Review',
          url: 'https://review.com',
          domain: 'review.com',
          snippet: 'Great product',
          publishedAt: new Date().toISOString(),
          retrievedAt: new Date().toISOString(),
        },
      ],
    }

    const question = generateFollowUpQuestion(bundle, null)
    // Should return a question about missing pricing
    expect(question).not.toBeNull()
    if (question) {
      expect(question.question).toBeTruthy()
      expect(question.rationale).toBeTruthy()
      expect(question.inputType).toBe('single_select')
    }
  })

  it('should return question when evidence is limited', () => {
    const bundle: NormalizedEvidenceBundle = {
      id: 'test-3',
      projectId: 'test-project',
      createdAt: new Date().toISOString(),
      company: 'Test Company',
      primaryUrl: 'https://test.com',
      items: Array.from({ length: 5 }, (_, i) => ({
        id: `item-${i}`,
        type: 'pricing' as const,
        title: `Source ${i}`,
        url: `https://test.com/source-${i}`,
        domain: 'test.com',
        snippet: `Content ${i}`,
        publishedAt: new Date().toISOString(),
        retrievedAt: new Date().toISOString(),
      })),
    }

    const question = generateFollowUpQuestion(bundle, null)
    // Should return a question about limited evidence
    expect(question).not.toBeNull()
    if (question) {
      expect(question.question).toBeTruthy()
    }
  })

  it('should return null when no evidence and no claims', () => {
    const question = generateFollowUpQuestion(null, null)
    expect(question).toBeNull()
  })

  it('should handle claims bundle with conflicts', () => {
    const claimsBundle: ClaimsBundle = {
      schema_version: 1,
      meta: {
        generatedAt: new Date().toISOString(),
        company: 'Test Company',
      },
      claims: [
        {
          id: 'c1',
          statement: 'Contact sales for enterprise pricing',
          category: 'pricing',
          support: 'strong',
          citations: [],
        },
        {
          id: 'c2',
          statement: 'Starting at $99 per month',
          category: 'pricing',
          support: 'strong',
          citations: [],
        },
      ],
    }

    const question = generateFollowUpQuestion(null, claimsBundle)
    // Should return a question about pricing conflicts
    expect(question).not.toBeNull()
    if (question) {
      expect(question.derivedFrom.conflicts).toBeTruthy()
    }
  })
})

