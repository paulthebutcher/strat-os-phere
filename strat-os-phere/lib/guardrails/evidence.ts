import 'server-only'

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import {
  getEvidenceSourcesForDomain,
  getEvidenceSourcesByCompetitor,
} from '@/lib/data/evidenceSources'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { EVIDENCE_CACHE_TTL_HOURS } from '@/lib/constants'
import { extractDomain } from '@/lib/utils/domain'

export interface EvidenceQualityCheck {
  passes: boolean
  confidence: 'low' | 'medium' | 'high'
  reason?: string
  distinctSourceTypes: number
  totalEvidenceSources: number
  decayFactor: number
}

/**
 * Check evidence quality before generation
 * Requires ≥2 distinct source_types OR ≥3 evidence_sources per competitor
 * Also computes recency decay factor based on extracted_at
 */
export async function checkEvidenceQuality(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<EvidenceQualityCheck> {
  const competitors = await listCompetitorsForProject(supabase, projectId)

  if (competitors.length === 0) {
    return {
      passes: false,
      confidence: 'low',
      reason: 'No competitors found',
      distinctSourceTypes: 0,
      totalEvidenceSources: 0,
      decayFactor: 0,
    }
  }

  let totalSources = 0
  let totalDistinctSourceTypes = 0
  let oldestExtractedAt: Date | null = null
  let newestExtractedAt: Date | null = null

  // Check evidence for each competitor
  for (const competitor of competitors) {
    // Try to get evidence by competitor_id first, fall back to domain
    let evidenceSources: Awaited<ReturnType<typeof getEvidenceSourcesByCompetitor>>
    try {
      evidenceSources = await getEvidenceSourcesByCompetitor(supabase, competitor.id)
    } catch {
      // Fallback to domain-based lookup if competitor_id approach fails
      // Derive domain from competitor.url if available
      const domain = extractDomain(competitor.url)
      if (domain) {
        try {
          evidenceSources = await getEvidenceSourcesForDomain(
            supabase,
            projectId,
            domain
          )
        } catch {
          // If domain lookup also fails, use empty array
          evidenceSources = []
        }
      } else {
        evidenceSources = []
      }
    }

    totalSources += evidenceSources.length

    // Track distinct source types
    const sourceTypes = new Set<string>()
    evidenceSources.forEach((source) => {
      if (source.source_type) {
        sourceTypes.add(source.source_type)
      }

      // Track extraction timestamps for decay calculation
      if (source.extracted_at) {
        const extractedAt = new Date(source.extracted_at)
        if (!oldestExtractedAt || extractedAt < oldestExtractedAt) {
          oldestExtractedAt = extractedAt
        }
        if (!newestExtractedAt || extractedAt > newestExtractedAt) {
          newestExtractedAt = extractedAt
        }
      }
    })

    totalDistinctSourceTypes += sourceTypes.size
  }

  // Average distinct source types per competitor
  const avgDistinctSourceTypes = totalDistinctSourceTypes / competitors.length
  const avgEvidenceSources = totalSources / competitors.length

  // Quality check: ≥2 distinct source_types OR ≥3 evidence_sources per competitor
  const meetsSourceTypeRequirement = avgDistinctSourceTypes >= 2
  const meetsSourceCountRequirement = avgEvidenceSources >= 3
  const passes = meetsSourceTypeRequirement || meetsSourceCountRequirement

  // Compute confidence based on quality
  let confidence: 'low' | 'medium' | 'high' = 'low'
  if (passes) {
    if (meetsSourceTypeRequirement && meetsSourceCountRequirement) {
      confidence = 'high'
    } else {
      confidence = 'medium'
    }
  }

  // Compute recency decay factor (1.0 = fresh, 0.0 = stale)
  // Evidence older than EVIDENCE_CACHE_TTL_HOURS gets full decay
  const decayFactor = computeRecencyDecayFactor(
    oldestExtractedAt,
    newestExtractedAt
  )

  let reason: string | undefined
  if (!passes) {
    reason = `Insufficient evidence quality: average ${avgDistinctSourceTypes.toFixed(1)} distinct source types and ${avgEvidenceSources.toFixed(1)} evidence sources per competitor. Requires ≥2 distinct source types OR ≥3 evidence sources.`
  }

  return {
    passes,
    confidence,
    reason,
    distinctSourceTypes: Math.round(avgDistinctSourceTypes * 10) / 10,
    totalEvidenceSources: Math.round(avgEvidenceSources * 10) / 10,
    decayFactor,
  }
}

/**
 * Compute recency decay factor based on evidence extraction timestamps
 * Returns a value between 0.0 (stale, older than TTL) and 1.0 (fresh)
 * 
 * Decay formula:
 * - Evidence within last 24 hours: 1.0
 * - Evidence between 24 hours and TTL (e.g., 24 hours): linear decay from 1.0 to 0.5
 * - Evidence older than TTL: exponential decay from 0.5 to 0.0
 */
function computeRecencyDecayFactor(
  oldestExtractedAt: Date | null,
  newestExtractedAt: Date | null
): number {
  if (!oldestExtractedAt || !newestExtractedAt) {
    // No extraction timestamps available - assume stale
    return 0.5
  }

  const now = new Date()
  const ttlMs = EVIDENCE_CACHE_TTL_HOURS * 60 * 60 * 1000

  // Use the oldest extracted_at as the baseline for decay
  // This ensures that if any evidence is stale, we apply decay
  const ageMs = now.getTime() - oldestExtractedAt.getTime()

  if (ageMs <= 0) {
    return 1.0 // Future timestamp (shouldn't happen, but handle gracefully)
  }

  if (ageMs <= 24 * 60 * 60 * 1000) {
    // Within last 24 hours - full freshness
    return 1.0
  }

  if (ageMs <= ttlMs) {
    // Between 24 hours and TTL - linear decay from 1.0 to 0.5
    const decayWindow = ttlMs - 24 * 60 * 60 * 1000
    const ageInWindow = ageMs - 24 * 60 * 60 * 1000
    const linearDecay = ageInWindow / decayWindow
    return 1.0 - linearDecay * 0.5 // Decay from 1.0 to 0.5
  }

  // Older than TTL - exponential decay from 0.5 to 0.0
  const excessAgeMs = ageMs - ttlMs
  // Exponential decay over 2x TTL period (so after 2x TTL, factor ≈ 0.1)
  const exponentialFactor = Math.exp(-excessAgeMs / (2 * ttlMs))
  return 0.5 * exponentialFactor
}

