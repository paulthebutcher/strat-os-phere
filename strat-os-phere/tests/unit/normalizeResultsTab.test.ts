import { describe, it, expect } from 'vitest'
import {
  normalizeResultsTab,
  needsTabNormalization,
  getCanonicalOpportunitiesUrl,
} from '@/lib/routing/normalizeResultsTab'

describe('normalizeResultsTab', () => {
  it('returns null for missing tab param', () => {
    expect(normalizeResultsTab(null)).toBeNull()
    expect(normalizeResultsTab(undefined)).toBeNull()
    expect(normalizeResultsTab('')).toBeNull()
  })

  it('maps legacy tab values to canonical tabs', () => {
    expect(normalizeResultsTab('opportunities_legacy')).toBe('opportunities_v3')
    expect(normalizeResultsTab('opportunities_v2_legacy')).toBe('opportunities_v3')
    expect(normalizeResultsTab('opps')).toBe('opportunities_v3')
    expect(normalizeResultsTab('opp')).toBe('opportunities_v3')
  })

  it('returns valid tab IDs as-is', () => {
    expect(normalizeResultsTab('opportunities_v3')).toBe('opportunities_v3')
    expect(normalizeResultsTab('strategic_bets')).toBe('strategic_bets')
    expect(normalizeResultsTab('jobs')).toBe('jobs')
  })

  it('is case-insensitive for legacy values', () => {
    expect(normalizeResultsTab('OPPORTUNITIES_LEGACY')).toBe('opportunities_v3')
    expect(normalizeResultsTab('Opps')).toBe('opportunities_v3')
  })
})

describe('needsTabNormalization', () => {
  it('returns false for missing tab param', () => {
    expect(needsTabNormalization(null)).toBe(false)
    expect(needsTabNormalization(undefined)).toBe(false)
  })

  it('returns true for legacy tab values', () => {
    expect(needsTabNormalization('opportunities_legacy')).toBe(true)
    expect(needsTabNormalization('opps')).toBe(true)
  })

  it('returns false for canonical tab values', () => {
    expect(needsTabNormalization('opportunities_v3')).toBe(false)
    expect(needsTabNormalization('strategic_bets')).toBe(false)
  })
})

describe('getCanonicalOpportunitiesUrl', () => {
  it('generates correct URL with project ID', () => {
    const url = getCanonicalOpportunitiesUrl('test-project-123')
    expect(url).toBe('/projects/test-project-123/results?tab=opportunities_v3')
  })

  it('uses custom base path when provided', () => {
    const url = getCanonicalOpportunitiesUrl('test-project-123', '/results')
    expect(url).toBe('/projects/test-project-123/results?tab=opportunities_v3')
  })
})

