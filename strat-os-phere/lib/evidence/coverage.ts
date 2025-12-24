/**
 * PR4: Deterministic evidence coverage computation
 * Aggregates evidence_sources to compute coverage metrics per project
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { EvidenceSource } from '@/lib/supabase/types'
import { normalizeEvidenceType, type EvidenceType, EVIDENCE_TYPES } from './evidenceTypes'

export interface CompetitorCoverage {
  competitorId: string | null
  competitorName?: string
  countsByType: Record<EvidenceType | 'other', number>
  totalSources: number
}

export interface EvidenceCoverageModel {
  byCompetitor: CompetitorCoverage[]
  totalsByType: Record<EvidenceType | 'other', number>
  competitorsWithAnyEvidence: number
  typesCoveredCount: number
  totalSources: number
  lastExtractedAt: string | null
}

/**
 * Compute evidence coverage for a project
 * Aggregates deterministically from evidence_sources table
 */
export async function getEvidenceCoverage(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<EvidenceCoverageModel> {
  // Fetch all evidence sources for the project
  const { data: sources, error } = await supabase
    .from('evidence_sources')
    .select('*')
    .eq('project_id', projectId)
    .order('extracted_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch evidence sources: ${error.message}`)
  }

  const evidenceSources = (sources ?? []) as EvidenceSource[]

  // Initialize aggregations
  const byCompetitorMap = new Map<string | null, {
    competitorId: string | null
    countsByType: Record<EvidenceType | 'other', number>
    totalSources: number
  }>()

  const totalsByType: Record<EvidenceType | 'other', number> = {
    marketing_site: 0,
    pricing: 0,
    docs: 0,
    changelog: 0,
    reviews: 0,
    jobs: 0,
    status: 0,
    other: 0,
  }

  let lastExtractedAt: string | null = null

  // Aggregate sources
  for (const source of evidenceSources) {
    const competitorId = source.competitor_id ?? null
    const sourceType = normalizeEvidenceType(source.source_type)
    
    // Initialize competitor entry if needed
    if (!byCompetitorMap.has(competitorId)) {
      byCompetitorMap.set(competitorId, {
        competitorId,
        countsByType: {
          marketing_site: 0,
          pricing: 0,
          docs: 0,
          changelog: 0,
          reviews: 0,
          jobs: 0,
          status: 0,
          other: 0,
        },
        totalSources: 0,
      })
    }

    const competitorData = byCompetitorMap.get(competitorId)!

    // Increment counts
    competitorData.countsByType[sourceType]++
    competitorData.totalSources++
    totalsByType[sourceType]++

    // Track latest extracted_at
    if (source.extracted_at) {
      if (!lastExtractedAt || source.extracted_at > lastExtractedAt) {
        lastExtractedAt = source.extracted_at
      }
    }
  }

  // Convert map to array
  const byCompetitor: CompetitorCoverage[] = Array.from(byCompetitorMap.values())

  // Count competitors with any evidence
  const competitorsWithAnyEvidence = byCompetitor.filter(c => c.totalSources > 0).length

  // Count types covered (types with at least one source)
  const typesCoveredCount = Object.values(totalsByType).filter(count => count > 0).length

  // Total sources
  const totalSources = evidenceSources.length

  return {
    byCompetitor,
    totalsByType,
    competitorsWithAnyEvidence,
    typesCoveredCount,
    totalSources,
    lastExtractedAt,
  }
}
