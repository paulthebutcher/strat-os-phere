/**
 * PR4: Deterministic evidence coverage computation
 * Aggregates evidence_sources to compute coverage metrics per project
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { EvidenceSource } from '@/lib/supabase/types'
import { normalizeEvidenceType, type EvidenceType, EVIDENCE_TYPES } from './evidenceTypes'
import type { ClaimsByType, EvidenceCoverage, EvidenceClaim } from './claims/types'
import type { NormalizedEvidenceType } from './types'

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

/**
 * Extract canonical domain from URL or domain string
 */
function extractCanonicalDomain(input: string): string | null {
  try {
    const url = input.startsWith('http') ? input : `https://${input}`
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    const match = input.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/i)
    if (match && match[1]) {
      return match[1].replace(/^www\./, '').toLowerCase()
    }
    return null
  }
}

/**
 * Check if a domain is first-party (matches competitor domains)
 */
function isFirstPartyDomain(domain: string, competitorDomains: string[]): boolean {
  if (competitorDomains.length === 0) {
    return false
  }
  
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '')
  const normalizedCompetitors = competitorDomains
    .map(d => extractCanonicalDomain(d) || d.toLowerCase().replace(/^www\./, ''))
    .filter((d): d is string => d !== null)
  
  return normalizedCompetitors.some(compDomain => {
    if (normalizedDomain === compDomain) return true
    if (normalizedDomain.endsWith(`.${compDomain}`)) return true
    if (compDomain.endsWith(`.${normalizedDomain}`)) return true
    return false
  })
}

/**
 * Compute evidence coverage from processed claims
 * This is the claim-centric coverage calculator used by getProcessedClaims
 * 
 * @param claimsByType - Claims grouped by evidence type
 * @param competitorDomains - Optional array of competitor domains for first-party detection
 * @returns Coverage metrics and gaps
 */
export function computeEvidenceCoverage(
  claimsByType: ClaimsByType,
  competitorDomains: string[] = []
): EvidenceCoverage {
  const allTypes: NormalizedEvidenceType[] = [
    'pricing',
    'docs',
    'reviews',
    'jobs',
    'changelog',
    'blog',
    'community',
    'security',
    'other',
  ]
  
  // Calculate counts by type and types present
  const countsByType: Record<NormalizedEvidenceType, number> = {
    pricing: 0,
    docs: 0,
    reviews: 0,
    jobs: 0,
    changelog: 0,
    blog: 0,
    community: 0,
    security: 0,
    other: 0,
  }
  
  const typesPresent: NormalizedEvidenceType[] = []
  let totalClaims = 0
  let firstPartyCount = 0
  const allPublishedDates: Date[] = []
  
  for (const type of allTypes) {
    const claims = claimsByType[type] || []
    countsByType[type] = claims.length
    totalClaims += claims.length
    
    if (claims.length > 0) {
      typesPresent.push(type)
    }
    
    // Calculate first-party ratio and collect dates
    for (const claim of claims) {
      if (isFirstPartyDomain(claim.domain, competitorDomains)) {
        firstPartyCount++
      }
      
      if (claim.publishedAt) {
        try {
          const date = new Date(claim.publishedAt)
          if (!isNaN(date.getTime())) {
            allPublishedDates.push(date)
          }
        } catch {
          // Ignore invalid dates
        }
      }
    }
  }
  
  // Calculate first-party ratio
  const firstPartyRatio = totalClaims > 0 ? firstPartyCount / totalClaims : 0
  
  // Calculate recency score (0..1)
  // Based on how recent the most recent evidence is
  let recencyScore = 0
  if (allPublishedDates.length > 0) {
    const mostRecent = Math.max(...allPublishedDates.map(d => d.getTime()))
    const now = Date.now()
    const daysAgo = (now - mostRecent) / (1000 * 60 * 60 * 24)
    
    if (daysAgo <= 30) {
      recencyScore = 1
    } else if (daysAgo <= 90) {
      recencyScore = 0.7
    } else if (daysAgo <= 180) {
      recencyScore = 0.4
    } else {
      recencyScore = 0.1
    }
  } else if (totalClaims > 0) {
    // Have claims but no dates - penalize slightly
    recencyScore = 0.3
  }
  
  // Calculate coverage score (0..1)
  // MVC (Minimum Viable Coverage) requires: pricing, docs, reviews
  // Additional points for: jobs, changelog, blog, community, security
  const mvcTypes: NormalizedEvidenceType[] = ['pricing', 'docs', 'reviews']
  const mvcMet = mvcTypes.every(type => countsByType[type] > 0)
  
  const bonusTypes: NormalizedEvidenceType[] = ['jobs', 'changelog', 'blog', 'community', 'security']
  const bonusTypeCount = bonusTypes.filter(type => countsByType[type] > 0).length
  
  let coverageScore = 0
  if (mvcMet) {
    coverageScore = 0.6 // Base score for MVC
    // Add points for bonus types (up to 0.4)
    coverageScore += Math.min(0.4, (bonusTypeCount / bonusTypes.length) * 0.4)
    // Boost for having multiple claims per type
    const avgClaimsPerType = totalClaims / Math.max(1, typesPresent.length)
    if (avgClaimsPerType >= 3) {
      coverageScore = Math.min(1, coverageScore + 0.1)
    }
  } else {
    // Below MVC - score based on progress toward MVC
    const mvcProgress = mvcTypes.filter(type => countsByType[type] > 0).length / mvcTypes.length
    coverageScore = mvcProgress * 0.4 // Max 0.4 if not MVC
  }
  
  coverageScore = Math.min(1, Math.max(0, coverageScore))
  
  // Determine overall confidence label
  // High: MVC met + good recency + good first-party ratio (even if coverageScore is moderate)
  // Medium: MVC met OR decent recency/first-party
  // Low: MVC met but poor recency/first-party
  // Insufficient: MVC not met
  let overallConfidenceLabel: 'High' | 'Medium' | 'Low' | 'Insufficient'
  if (!mvcMet || totalClaims === 0) {
    overallConfidenceLabel = 'Insufficient'
  } else if (recencyScore >= 0.7 && firstPartyRatio >= 0.5 && mvcMet) {
    // MVC met with good recency and first-party sources = High confidence
    overallConfidenceLabel = 'High'
  } else if (coverageScore >= 0.6 || (recencyScore >= 0.5 && firstPartyRatio >= 0.3)) {
    overallConfidenceLabel = 'Medium'
  } else {
    overallConfidenceLabel = 'Low'
  }
  
  // Identify gaps
  const gaps: Array<{
    type: NormalizedEvidenceType
    reason: string
    suggestion: string
  }> = []
  
  // Check for missing MVC types
  for (const type of mvcTypes) {
    if (countsByType[type] === 0) {
      const typeLabels: Record<NormalizedEvidenceType, string> = {
        pricing: 'Pricing information',
        docs: 'Documentation',
        reviews: 'Customer reviews',
        jobs: 'Job postings',
        changelog: 'Changelog/updates',
        blog: 'Blog posts',
        community: 'Community resources',
        security: 'Security information',
        other: 'Other evidence',
      }
      gaps.push({
        type,
        reason: `No ${typeLabels[type].toLowerCase()} found`,
        suggestion: `Add ${typeLabels[type].toLowerCase()} to strengthen competitive analysis`,
      })
    }
  }
  
  // Check for other missing important types
  const importantTypes: NormalizedEvidenceType[] = ['jobs', 'changelog']
  for (const type of importantTypes) {
    if (countsByType[type] === 0 && mvcMet) {
      const typeLabels: Record<NormalizedEvidenceType, string> = {
        pricing: 'Pricing information',
        docs: 'Documentation',
        reviews: 'Customer reviews',
        jobs: 'Job postings',
        changelog: 'Changelog/updates',
        blog: 'Blog posts',
        community: 'Community resources',
        security: 'Security information',
        other: 'Other evidence',
      }
      gaps.push({
        type,
        reason: `No ${typeLabels[type].toLowerCase()} found`,
        suggestion: `Consider adding ${typeLabels[type].toLowerCase()} for more comprehensive coverage`,
      })
    }
  }
  
  return {
    typesPresent,
    countsByType,
    firstPartyRatio,
    recencyScore,
    coverageScore,
    overallConfidenceLabel,
    gaps,
  }
}
