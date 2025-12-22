/**
 * PageSummary schema for fast triage (Pass A)
 * Used to quickly evaluate pages before deep reading
 */

import { z } from 'zod'

export type PageSourceType =
  | 'pricing'
  | 'docs'
  | 'reviews'
  | 'changelog'
  | 'jobs'
  | 'status'
  | 'other'

export type RecencyHint = 'today' | '<30d' | '30-90d' | '>90d' | 'unknown'
export type CredibilityHint = 'official' | 'third_party' | 'community'

export const PageSummarySchema = z.object({
  source_type: z.enum(['pricing', 'docs', 'reviews', 'changelog', 'jobs', 'status', 'other']),
  signals: z.array(z.string()).describe('Key claims or information from the page'),
  coverage_score: z.number().min(0).max(1).describe('How much concrete information is present (0-1)'),
  recency_hint: z.enum(['today', '<30d', '30-90d', '>90d', 'unknown']).describe('Estimated recency of content'),
  credibility_hint: z.enum(['official', 'third_party', 'community']).describe('Source credibility'),
  recommended_for_deep_read: z.boolean().describe('Whether this page should be included in deep synthesis'),
})

export type PageSummary = z.infer<typeof PageSummarySchema>

/**
 * Shortlist quotas per competitor
 */
export interface ShortlistQuota {
  pricing: number // default 2
  docs: number // default 2
  changelog: number // default 1
  jobs: number // default 1
  reviews: number // default 2
  status: number // default 1
  other: number // default: fill remaining
}

export const DEFAULT_SHORTLIST_QUOTA: ShortlistQuota = {
  pricing: 2,
  docs: 2,
  changelog: 1,
  jobs: 1,
  reviews: 2,
  status: 1,
  other: 999, // Fill remaining slots
}

/**
 * Shortlist pages based on quotas and coverage scores
 */
export function shortlistPages(
  summaries: Array<{ url: string; summary: PageSummary }>,
  quota: ShortlistQuota = DEFAULT_SHORTLIST_QUOTA
): Array<{ url: string; summary: PageSummary }> {
  // Group by source type
  const byType = new Map<PageSourceType, Array<{ url: string; summary: PageSummary }>>()
  
  for (const item of summaries) {
    const type = item.summary.source_type
    if (!byType.has(type)) {
      byType.set(type, [])
    }
    byType.get(type)!.push(item)
  }

  const shortlisted: Array<{ url: string; summary: PageSummary }> = []

  // Select top pages for each type by coverage_score
  const typeEntries = Array.from(byType.entries())
  for (const [type, pages] of typeEntries) {
    const limit = quota[type] || 0
    if (limit > 0) {
      const sorted = [...pages].sort(
        (a, b) => b.summary.coverage_score - a.summary.coverage_score
      )
      shortlisted.push(...sorted.slice(0, limit))
    }
  }

  // If we have fewer than expected, fill with highest coverage remaining
  const totalQuota = Object.values(quota).reduce((sum, q) => sum + (q === 999 ? 0 : q), 0)
  if (shortlisted.length < totalQuota) {
    const remaining = summaries.filter(
      (item) => !shortlisted.some((s) => s.url === item.url)
    )
    const sortedRemaining = remaining.sort(
      (a, b) => b.summary.coverage_score - a.summary.coverage_score
    )
    const needed = totalQuota - shortlisted.length
    shortlisted.push(...sortedRemaining.slice(0, needed))
  }

  return shortlisted
}

