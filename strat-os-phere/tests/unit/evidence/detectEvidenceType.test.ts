import { describe, it, expect } from 'vitest'
import { detectEvidenceType } from '@/lib/evidence/detectEvidenceType'

describe('detectEvidenceType', () => {
  describe('URL path-based detection (priority 1)', () => {
    it('detects pricing from /pricing path', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/pricing',
        })
      ).toBe('pricing')
    })

    it('detects pricing from /plans path', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/plans',
        })
      ).toBe('pricing')
    })

    it('detects docs from /docs path', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/docs/getting-started',
        })
      ).toBe('docs')
    })

    it('detects docs from /documentation path', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/documentation',
        })
      ).toBe('docs')
    })

    it('detects docs from /api path', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/api/reference',
        })
      ).toBe('docs')
    })

    it('detects changelog from /changelog path', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/changelog',
        })
      ).toBe('changelog')
    })

    it('detects changelog from /release-notes path', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/release-notes',
        })
      ).toBe('changelog')
    })

    it('detects reviews from g2.com hostname', () => {
      expect(
        detectEvidenceType({
          url: 'https://www.g2.com/products/example/reviews',
        })
      ).toBe('reviews')
    })

    it('detects reviews from capterra.com hostname', () => {
      expect(
        detectEvidenceType({
          url: 'https://www.capterra.com/p/example',
        })
      ).toBe('reviews')
    })

    it('detects community from reddit.com hostname', () => {
      expect(
        detectEvidenceType({
          url: 'https://www.reddit.com/r/example',
        })
      ).toBe('community')
    })

    it('detects security from /security path', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/security',
        })
      ).toBe('security')
    })

    it('detects security from /soc-2 path', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/compliance/soc-2',
        })
      ).toBe('security')
    })

    it('detects jobs from /careers path', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/careers',
        })
      ).toBe('jobs')
    })

    it('detects jobs from greenhouse.io hostname', () => {
      expect(
        detectEvidenceType({
          url: 'https://boards.greenhouse.io/example',
        })
      ).toBe('jobs')
    })

    it('detects case_studies from /case-study path', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/case-study/acme',
        })
      ).toBe('case_studies')
    })

    it('detects case_studies from /customers path', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/customers',
        })
      ).toBe('case_studies')
    })
  })

  describe('Title/snippet keyword-based detection (priority 2)', () => {
    it('detects pricing from title keyword', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/page',
          title: 'Pricing Plans and Tiers',
        })
      ).toBe('pricing')
    })

    it('detects docs from snippet keyword', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/page',
          snippet: 'How to get started with our API',
        })
      ).toBe('docs')
    })

    it('detects changelog from title keyword', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/page',
          title: "What's New in This Release",
        })
      ).toBe('changelog')
    })

    it('detects reviews from snippet keyword', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/page',
          snippet: 'Read reviews and ratings from users',
        })
      ).toBe('reviews')
    })

    it('detects community from title keyword', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/page',
          title: 'Community Forum Discussion',
        })
      ).toBe('community')
    })

    it('detects security from snippet keyword', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/page',
          snippet: 'Security and compliance information',
        })
      ).toBe('security')
    })

    it('detects jobs from title keyword', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/page',
          title: 'We are hiring engineers',
        })
      ).toBe('jobs')
    })

    it('detects case_studies from snippet keyword', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/page',
          snippet: 'Customer success story and case study',
        })
      ).toBe('case_studies')
    })
  })

  describe('Priority ordering (URL takes precedence)', () => {
    it('prioritizes URL path over title keywords', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/pricing',
          title: 'Documentation Guide',
        })
      ).toBe('pricing') // URL path wins
    })

    it('prioritizes URL hostname over snippet keywords', () => {
      expect(
        detectEvidenceType({
          url: 'https://www.g2.com/products/example',
          snippet: 'Security compliance information',
        })
      ).toBe('reviews') // URL hostname wins
    })
  })

  describe('Edge cases', () => {
    it('handles URLs without protocol', () => {
      expect(
        detectEvidenceType({
          url: 'example.com/pricing',
        })
      ).toBe('pricing')
    })

    it('handles invalid URLs gracefully', () => {
      expect(
        detectEvidenceType({
          url: 'not-a-valid-url',
          title: 'Pricing Information',
        })
      ).toBe('pricing') // Falls back to keyword matching
    })

    it('returns other for unrecognized content', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/random-page',
          title: 'Some Generic Content',
        })
      ).toBe('other')
    })

    it('handles empty title and snippet', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/unknown',
        })
      ).toBe('other')
    })

    it('handles case-insensitive matching', () => {
      expect(
        detectEvidenceType({
          url: 'https://example.com/PRICING',
          title: 'DOCUMENTATION Guide',
        })
      ).toBe('pricing') // URL wins, case-insensitive
    })
  })
})

