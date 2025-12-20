import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkEvidenceQuality } from '@/lib/guardrails/evidence'
import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { createMockSupabaseClient, MockSupabaseStore } from '@/tests/mocks/supabase'
import * as evidenceSourcesModule from '@/lib/data/evidenceSources'
import type { EvidenceSource } from '@/lib/supabase/types'

// Mock the evidence sources module
vi.mock('@/lib/data/evidenceSources', () => ({
  getEvidenceSourcesByCompetitor: vi.fn(),
  getEvidenceSourcesForDomain: vi.fn(),
}))

// Mock the competitors module
vi.mock('@/lib/data/competitors', () => ({
  listCompetitorsForProject: vi.fn(),
}))

describe('checkEvidenceQuality - domain fallback', () => {
  let store: MockSupabaseStore
  let supabase: TypedSupabaseClient
  const projectId = 'project_1'

  beforeEach(() => {
    store = new MockSupabaseStore()
    supabase = createMockSupabaseClient(store)
    vi.clearAllMocks()
  })

  it('should use competitor_id lookup first when available', async () => {
    const { listCompetitorsForProject } = await import('@/lib/data/competitors')
    const { getEvidenceSourcesByCompetitor } = evidenceSourcesModule

    const competitor = store.createCompetitor({
      project_id: projectId,
      name: 'Competitor A',
      url: 'https://example.com',
    })

    vi.mocked(listCompetitorsForProject).mockResolvedValue([competitor])

    const mockEvidenceSources: EvidenceSource[] = [
      {
        id: 'source_1',
        project_id: projectId,
        competitor_id: competitor.id,
        domain: 'example.com',
        url: 'https://example.com',
        extracted_text: 'Test text',
        page_title: 'Test Page',
        source_type: 'marketing_site',
        source_date_range: null,
        source_confidence: 'high',
        extracted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ]

    vi.mocked(getEvidenceSourcesByCompetitor).mockResolvedValue(mockEvidenceSources)

    const result = await checkEvidenceQuality(supabase, projectId)

    expect(getEvidenceSourcesByCompetitor).toHaveBeenCalledWith(supabase, competitor.id)
    expect(result.totalEvidenceSources).toBeGreaterThan(0)
  })

  it('should fallback to domain lookup when competitor_id lookup fails and competitor.url is present', async () => {
    const { listCompetitorsForProject } = await import('@/lib/data/competitors')
    const { getEvidenceSourcesByCompetitor, getEvidenceSourcesForDomain } = evidenceSourcesModule

    const competitor = store.createCompetitor({
      project_id: projectId,
      name: 'Competitor B',
      url: 'https://www.fullstory.com/pricing',
    })

    vi.mocked(listCompetitorsForProject).mockResolvedValue([competitor])

    // Mock competitor_id lookup to throw (simulating failure)
    vi.mocked(getEvidenceSourcesByCompetitor).mockRejectedValue(new Error('Not found'))

    const mockDomainEvidenceSources: EvidenceSource[] = [
      {
        id: 'source_2',
        project_id: projectId,
        competitor_id: null,
        domain: 'fullstory.com',
        url: 'https://www.fullstory.com/pricing',
        extracted_text: 'Test text',
        page_title: 'Pricing Page',
        source_type: 'pricing',
        source_date_range: null,
        source_confidence: 'high',
        extracted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ]

    vi.mocked(getEvidenceSourcesForDomain).mockResolvedValue(mockDomainEvidenceSources)

    const result = await checkEvidenceQuality(supabase, projectId)

    expect(getEvidenceSourcesByCompetitor).toHaveBeenCalledWith(supabase, competitor.id)
    expect(getEvidenceSourcesForDomain).toHaveBeenCalledWith(supabase, projectId, 'fullstory.com')
    expect(result.totalEvidenceSources).toBeGreaterThan(0)
  })

  it('should handle missing competitor.url gracefully and return empty sources', async () => {
    const { listCompetitorsForProject } = await import('@/lib/data/competitors')
    const { getEvidenceSourcesByCompetitor, getEvidenceSourcesForDomain } = evidenceSourcesModule

    const competitor = store.createCompetitor({
      project_id: projectId,
      name: 'Competitor C',
      url: null, // No URL provided
    })

    vi.mocked(listCompetitorsForProject).mockResolvedValue([competitor])

    // Mock competitor_id lookup to throw (simulating failure)
    vi.mocked(getEvidenceSourcesByCompetitor).mockRejectedValue(new Error('Not found'))

    const result = await checkEvidenceQuality(supabase, projectId)

    expect(getEvidenceSourcesByCompetitor).toHaveBeenCalledWith(supabase, competitor.id)
    expect(getEvidenceSourcesForDomain).not.toHaveBeenCalled()
    expect(result.totalEvidenceSources).toBe(0)
    expect(result.passes).toBe(false)
  })

  it('should handle invalid URL gracefully and return empty sources', async () => {
    const { listCompetitorsForProject } = await import('@/lib/data/competitors')
    const { getEvidenceSourcesByCompetitor, getEvidenceSourcesForDomain } = evidenceSourcesModule

    const competitor = store.createCompetitor({
      project_id: projectId,
      name: 'Competitor D',
      url: 'not a valid url', // Invalid URL
    })

    vi.mocked(listCompetitorsForProject).mockResolvedValue([competitor])

    // Mock competitor_id lookup to throw (simulating failure)
    vi.mocked(getEvidenceSourcesByCompetitor).mockRejectedValue(new Error('Not found'))

    const result = await checkEvidenceQuality(supabase, projectId)

    expect(getEvidenceSourcesByCompetitor).toHaveBeenCalledWith(supabase, competitor.id)
    expect(getEvidenceSourcesForDomain).not.toHaveBeenCalled()
    expect(result.totalEvidenceSources).toBe(0)
  })

  it('should handle domain lookup failure gracefully', async () => {
    const { listCompetitorsForProject } = await import('@/lib/data/competitors')
    const { getEvidenceSourcesByCompetitor, getEvidenceSourcesForDomain } = evidenceSourcesModule

    const competitor = store.createCompetitor({
      project_id: projectId,
      name: 'Competitor E',
      url: 'https://example.com',
    })

    vi.mocked(listCompetitorsForProject).mockResolvedValue([competitor])

    // Mock competitor_id lookup to throw
    vi.mocked(getEvidenceSourcesByCompetitor).mockRejectedValue(new Error('Not found'))
    // Mock domain lookup to also throw
    vi.mocked(getEvidenceSourcesForDomain).mockRejectedValue(new Error('Domain lookup failed'))

    const result = await checkEvidenceQuality(supabase, projectId)

    expect(getEvidenceSourcesByCompetitor).toHaveBeenCalledWith(supabase, competitor.id)
    expect(getEvidenceSourcesForDomain).toHaveBeenCalledWith(supabase, projectId, 'example.com')
    expect(result.totalEvidenceSources).toBe(0)
  })

  it('should extract domain correctly from various URL formats', async () => {
    const { listCompetitorsForProject } = await import('@/lib/data/competitors')
    const { getEvidenceSourcesByCompetitor, getEvidenceSourcesForDomain } = evidenceSourcesModule

    const testCases = [
      { url: 'https://www.fullstory.com/pricing', expectedDomain: 'fullstory.com' },
      { url: 'http://example.com', expectedDomain: 'example.com' },
      { url: 'example.com/path', expectedDomain: 'example.com' },
      { url: 'https://subdomain.example.com', expectedDomain: 'subdomain.example.com' },
    ]

    for (const testCase of testCases) {
      vi.clearAllMocks()

      const competitor = store.createCompetitor({
        project_id: projectId,
        name: `Competitor ${testCase.expectedDomain}`,
        url: testCase.url,
      })

      vi.mocked(listCompetitorsForProject).mockResolvedValue([competitor])
      vi.mocked(getEvidenceSourcesByCompetitor).mockRejectedValue(new Error('Not found'))
      vi.mocked(getEvidenceSourcesForDomain).mockResolvedValue([])

      await checkEvidenceQuality(supabase, projectId)

      expect(getEvidenceSourcesForDomain).toHaveBeenCalledWith(
        supabase,
        projectId,
        testCase.expectedDomain
      )
    }
  })
})

