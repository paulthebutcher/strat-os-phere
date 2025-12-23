/**
 * Evidence coverage scoring
 * Deterministic metrics for evidence quality and completeness
 */

import type { EvidenceClaim, EvidenceCoverage } from './claims/types'
import type { NormalizedEvidenceType } from './types'
import { isFirstParty } from './isFirstParty'

const ALL_EVIDENCE_TYPES: NormalizedEvidenceType[] = [
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

/**
 * Minimum viable coverage (MVC) requirements
 * Requires at least 3 of: pricing, reviews, changelog, jobs, docs
 * (Note: status pages are normalized to changelog type)
 * AND requires pricing OR reviews present
 */
const MVC_TYPES: NormalizedEvidenceType[] = [
  'pricing',
  'reviews',
  'changelog',
  'jobs',
  'docs',
]

/**
 * Compute median age of evidence items in days
 */
function computeMedianAge(claims: EvidenceClaim[]): number | null {
  const dates: number[] = []
  
  for (const claim of claims) {
    const dateStr = claim.publishedAt || claim.retrievedAt
    if (dateStr) {
      try {
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
          dates.push(daysAgo)
        }
      } catch {
        // Skip invalid dates
      }
    }
  }
  
  if (dates.length === 0) return null
  
  dates.sort((a, b) => a - b)
  const mid = Math.floor(dates.length / 2)
  
  if (dates.length % 2 === 0) {
    return (dates[mid - 1] + dates[mid]) / 2
  }
  return dates[mid]
}

/**
 * Compute recency score (0..1)
 * Based on median age of evidence items
 */
function computeRecencyScore(claims: EvidenceClaim[]): number {
  const medianAge = computeMedianAge(claims)
  
  if (medianAge === null) return 0.5 // No dates = neutral
  
  // Score based on median age:
  // - 0-30 days: 1.0
  // - 30-90 days: 0.8
  // - 90-180 days: 0.6
  // - 180-365 days: 0.4
  // - >365 days: 0.2
  if (medianAge <= 30) return 1.0
  if (medianAge <= 90) return 0.8
  if (medianAge <= 180) return 0.6
  if (medianAge <= 365) return 0.4
  return 0.2
}

/**
 * Check if minimum viable coverage (MVC) is met
 */
function meetsMVC(countsByType: Record<NormalizedEvidenceType, number>): boolean {
  // Count how many MVC types have at least 1 item
  const mvcTypesPresent = MVC_TYPES.filter(
    (type) => (countsByType[type] ?? 0) > 0
  ).length
  
  // Need at least 3 MVC types
  if (mvcTypesPresent < 3) return false
  
  // AND need pricing OR reviews
  const hasPricing = (countsByType.pricing ?? 0) > 0
  const hasReviews = (countsByType.reviews ?? 0) > 0
  
  return hasPricing || hasReviews
}

/**
 * Generate coverage gaps
 */
function generateGaps(
  countsByType: Record<NormalizedEvidenceType, number>,
  typesPresent: NormalizedEvidenceType[]
): Array<{ type: NormalizedEvidenceType; reason: string; suggestion: string }> {
  const gaps: Array<{ type: NormalizedEvidenceType; reason: string; suggestion: string }> = []
  
  const suggestions: Record<NormalizedEvidenceType, string> = {
    pricing: 'Try searching for "/pricing" or "/plans" pages',
    docs: 'Try searching for "/docs" or documentation sites',
    reviews: 'Try searching for product reviews on G2, Capterra, or Trustpilot',
    changelog: 'Try adding /releases or /blog product updates',
    jobs: 'Try searching for job postings on company careers pages',
    security: 'Try searching for security pages or compliance docs',
    community: 'Try searching for community forums or Discord servers',
    blog: 'Try searching for company blog or news pages',
    other: 'Try broadening search terms',
  }
  
  // Check MVC types first
  for (const type of MVC_TYPES) {
    if ((countsByType[type] ?? 0) === 0) {
      gaps.push({
        type,
        reason: `No ${type} evidence found`,
        suggestion: suggestions[type] || `Try searching for ${type} information`,
      })
    }
  }
  
  // Limit to top 3 gaps
  return gaps.slice(0, 3)
}

/**
 * Compute evidence coverage metrics
 */
export function computeEvidenceCoverage(
  claimsByType: Record<NormalizedEvidenceType, EvidenceClaim[]>,
  competitorDomains: string[] = []
): EvidenceCoverage {
  // Initialize counts
  const countsByType = ALL_EVIDENCE_TYPES.reduce(
    (acc, type) => ({ ...acc, [type]: claimsByType[type]?.length ?? 0 }),
    {} as Record<NormalizedEvidenceType, number>
  )
  
  // Get types present
  const typesPresent = ALL_EVIDENCE_TYPES.filter(
    (type) => (countsByType[type] ?? 0) > 0
  )
  
  // Compute first-party ratio
  let firstPartyCount = 0
  let totalCount = 0
  
  for (const type of ALL_EVIDENCE_TYPES) {
    const claims = claimsByType[type] ?? []
    for (const claim of claims) {
      totalCount++
    // Check first-party: domain matches competitor domain
    const claimDomain = claim.domain.toLowerCase().replace(/^www\./, '')
    const isFirstPartyClaim = competitorDomains.some((compDomain) => {
      const normalized = compDomain.toLowerCase().replace(/^www\./, '')
      return claimDomain === normalized || claimDomain.endsWith(`.${normalized}`)
    })
    if (isFirstPartyClaim) {
      firstPartyCount++
    }
    }
  }
  
  const firstPartyRatio = totalCount > 0 ? firstPartyCount / totalCount : 0
  
  // Compute recency score
  const allClaims = Object.values(claimsByType).flat()
  const recencyScore = computeRecencyScore(allClaims)
  
  // Compute coverage score
  // Based on: number of types present + minimum counts per type
  const typesPresentCount = typesPresent.length
  const maxTypes = ALL_EVIDENCE_TYPES.length
  const typeCoverage = typesPresentCount / maxTypes
  
  // Minimum counts: at least 2 items per type for good coverage
  const typesWithMinCount = typesPresent.filter(
    (type) => (countsByType[type] ?? 0) >= 2
  ).length
  const minCountCoverage = typesWithMinCount / maxTypes
  
  // Coverage score is average of type coverage and min count coverage
  const coverageScore = (typeCoverage + minCountCoverage) / 2
  
  // Determine overall confidence label
  const meetsMinimumViable = meetsMVC(countsByType)
  let overallConfidenceLabel: 'High' | 'Medium' | 'Low' | 'Insufficient'
  
  if (!meetsMinimumViable) {
    overallConfidenceLabel = 'Insufficient'
  } else if (coverageScore >= 0.7 && recencyScore >= 0.7 && firstPartyRatio >= 0.3) {
    overallConfidenceLabel = 'High'
  } else if (coverageScore >= 0.5 && recencyScore >= 0.5) {
    overallConfidenceLabel = 'Medium'
  } else {
    overallConfidenceLabel = 'Low'
  }
  
  // Generate gaps
  const gaps = generateGaps(countsByType, typesPresent)
  
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

