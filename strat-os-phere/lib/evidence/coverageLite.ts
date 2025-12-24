/**
 * Lightweight evidence coverage computation for project status UI
 * 
 * This module computes evidence sufficiency metrics using ONLY the evidence_sources table.
 * It is designed to be schema-free and fail-safe (never throws, always returns valid data).
 * 
 * Used by:
 * - ProjectStatusBar component
 * - ReadinessChecklist component
 * - NextBestAction resolver
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

// Thresholds for evidence sufficiency (local constants, easy to change)
export const MIN_COMPETITORS = 3
export const MIN_EVIDENCE_TYPES_OVERALL = 2 // across the whole project
export const MIN_COMPETITORS_WITH_EVIDENCE = 2 // at least N competitors must have >=1 evidence row

export type EvidenceCoverageLite = {
  totalSources: number
  evidenceTypesPresent: string[] // unique source_type values (non-empty, normalized)
  evidenceTypeCounts: Record<string, number>
  competitorIdsWithEvidence: string[] // unique competitor_id with >=1 source (non-null)
  competitorEvidenceCounts: Record<string, number> // competitor_id -> count
  isEvidenceSufficient: boolean
  reasonsMissing: string[] // human readable reasons for insufficient
}

/**
 * Helper to get a properly typed Supabase client
 */
function getTypedClient(client: TypedSupabaseClient): SupabaseClient<Database> {
  return client as unknown as SupabaseClient<Database>
}

/**
 * Normalize source_type to a consistent string representation
 */
function normalizeSourceType(sourceType: unknown): string {
  if (!sourceType) {
    return 'other'
  }
  const t = sourceType.toString().trim().toLowerCase()
  return t || 'other'
}

/**
 * Compute evidence coverage for a project from evidence_sources table only
 * 
 * This function is fail-safe: it never throws and always returns valid data.
 * If the query fails (missing table, permission, etc.), it returns empty coverage
 * with a helpful error message in reasonsMissing.
 */
export async function computeEvidenceCoverageLite(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<EvidenceCoverageLite> {
  try {
    const typedClient = getTypedClient(supabase)
    
    // Query ONLY evidence_sources table
    // Select only the columns we need: competitor_id, source_type
    const { data: sources, error } = await typedClient
      .from('evidence_sources')
      .select('competitor_id, source_type')
      .eq('project_id', projectId)

    if (error) {
      // Query failed - return safe defaults with error message
      return {
        totalSources: 0,
        evidenceTypesPresent: [],
        evidenceTypeCounts: {},
        competitorIdsWithEvidence: [],
        competitorEvidenceCounts: {},
        isEvidenceSufficient: false,
        reasonsMissing: ['Evidence data unavailable. Try reloading or collect evidence again.'],
      }
    }

    const rows = sources ?? []
    
    // Initialize aggregations
    const evidenceTypeCounts: Record<string, number> = {}
    const competitorEvidenceCounts: Record<string, number> = {}
    const competitorIdsWithEvidenceSet = new Set<string>()

    // Process each row
    for (const row of rows) {
      // Normalize source_type
      const normalizedType = normalizeSourceType(row.source_type)
      
      // Count evidence types
      evidenceTypeCounts[normalizedType] = (evidenceTypeCounts[normalizedType] || 0) + 1
      
      // Count by competitor (only if competitor_id is non-null/non-empty)
      const competitorId = row.competitor_id
      if (competitorId && typeof competitorId === 'string' && competitorId.trim() !== '') {
        const cid = competitorId.trim()
        competitorEvidenceCounts[cid] = (competitorEvidenceCounts[cid] || 0) + 1
        competitorIdsWithEvidenceSet.add(cid)
      }
    }

    // Build evidenceTypesPresent (sorted, unique)
    const evidenceTypesPresent = Object.keys(evidenceTypeCounts).sort()
    const competitorIdsWithEvidence = Array.from(competitorIdsWithEvidenceSet).sort()

    // Determine if evidence is sufficient
    const totalSources = rows.length
    const hasEnoughTypes = evidenceTypesPresent.length >= MIN_EVIDENCE_TYPES_OVERALL
    const hasEnoughCompetitorsWithEvidence = competitorIdsWithEvidence.length >= MIN_COMPETITORS_WITH_EVIDENCE
    const hasAnySources = totalSources > 0

    const isEvidenceSufficient = hasEnoughTypes && hasEnoughCompetitorsWithEvidence && hasAnySources

    // Build reasonsMissing (human readable)
    const reasonsMissing: string[] = []
    if (totalSources === 0) {
      reasonsMissing.push('No public evidence collected yet.')
    } else {
      if (!hasEnoughTypes) {
        reasonsMissing.push(`Need evidence across at least ${MIN_EVIDENCE_TYPES_OVERALL} evidence types.`)
      }
      if (!hasEnoughCompetitorsWithEvidence) {
        reasonsMissing.push(`Need evidence for at least ${MIN_COMPETITORS_WITH_EVIDENCE} competitors.`)
      }
    }

    return {
      totalSources,
      evidenceTypesPresent,
      evidenceTypeCounts,
      competitorIdsWithEvidence,
      competitorEvidenceCounts,
      isEvidenceSufficient,
      reasonsMissing,
    }
  } catch (error) {
    // Catch any unexpected errors (network, parsing, etc.)
    // Return safe defaults - must not throw
    return {
      totalSources: 0,
      evidenceTypesPresent: [],
      evidenceTypeCounts: {},
      competitorIdsWithEvidence: [],
      competitorEvidenceCounts: {},
      isEvidenceSufficient: false,
      reasonsMissing: ['Evidence data unavailable. Try reloading or collect evidence again.'],
    }
  }
}

