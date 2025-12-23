/**
 * Coverage scoring for evidence bundles
 * Computes deterministic, evidence-driven scores based on bundle metadata
 */

import type { NormalizedEvidenceBundle, NormalizedEvidenceType } from '@/lib/evidence/types'
import { isFirstParty, extractCompetitorDomains } from '@/lib/evidence/isFirstParty'
import type { CoverageThreshold } from './thresholds'
import { DEFAULT_THRESHOLD } from './thresholds'

export type CoverageScoreOptions = {
  threshold?: CoverageThreshold
  competitorDomains?: string[]
}

export type CoverageScoreResult = {
  isSufficient: boolean
  score10?: number // only present if sufficient
  scoreLabel: 'High' | 'Medium' | 'Low' | 'Insufficient'
  reasons: {
    typesPresent: NormalizedEvidenceType[]
    typesMissing: NormalizedEvidenceType[]
    typeCount: number
    totalTypesConsidered: number
    firstPartyCount: number
    thirdPartyCount: number
    firstPartyRatio: number // 0..1
    newestAt?: string
    oldestAt?: string
    medianAgeDays?: number
    recencyScore: number // 0..1
    coverageScore: number // 0..1
    firstPartyScore: number // 0..1
    threshold: CoverageThreshold
    failedChecks: string[]
  }
}

/**
 * All evidence types we consider for coverage
 */
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
 * Computes median of an array of numbers
 */
function median(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const sorted = [...numbers].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

/**
 * Computes recency score from median age in days
 * Piecewise linear function:
 * - <=14 days => 1.0
 * - 14-90 days => linear interpolation from 1.0 to 0.2
 * - 90-180 days => linear interpolation from 0.2 to 0.0
 * - >180 days => 0.0
 */
function computeRecencyScore(medianAgeDays: number | null): number {
  if (medianAgeDays === null || medianAgeDays === undefined) {
    // If we can't determine age, give a neutral score
    return 0.5
  }

  if (medianAgeDays <= 14) {
    return 1.0
  }

  if (medianAgeDays <= 90) {
    // Linear interpolation: 14 days = 1.0, 90 days = 0.2
    const slope = (0.2 - 1.0) / (90 - 14)
    return 1.0 + slope * (medianAgeDays - 14)
  }

  if (medianAgeDays <= 180) {
    // Linear interpolation: 90 days = 0.2, 180 days = 0.0
    const slope = (0.0 - 0.2) / (180 - 90)
    return 0.2 + slope * (medianAgeDays - 90)
  }

  return 0.0
}

/**
 * Clamps a number between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Rounds to 1 decimal place
 */
function roundTo1Decimal(value: number): number {
  return Math.round(value * 10) / 10
}

/**
 * Computes coverage score from evidence bundle
 * 
 * Formula:
 * - coverageScore = clamp(typeCount / totalTypesConsidered, 0, 1)
 * - recencyScore = computed from median age (piecewise linear)
 * - firstPartyScore = clamp(firstPartyRatio / 0.6, 0, 1)
 * - finalScore01 = 0.45*coverageScore + 0.35*recencyScore + 0.20*firstPartyScore
 * - score10 = roundTo1Decimal(finalScore01 * 10)
 */
export function computeCoverageScore(
  bundle: NormalizedEvidenceBundle | null | undefined,
  opts: CoverageScoreOptions = {}
): CoverageScoreResult {
  const threshold = opts.threshold ?? DEFAULT_THRESHOLD
  const competitorDomains = opts.competitorDomains ?? 
    (bundle ? extractCompetitorDomains(bundle.primaryUrl, bundle.company) : [])

  // Handle null/undefined bundle
  if (!bundle || !bundle.items || bundle.items.length === 0) {
    return {
      isSufficient: false,
      scoreLabel: 'Insufficient',
      reasons: {
        typesPresent: [],
        typesMissing: ALL_EVIDENCE_TYPES,
        typeCount: 0,
        totalTypesConsidered: ALL_EVIDENCE_TYPES.length,
        firstPartyCount: 0,
        thirdPartyCount: 0,
        firstPartyRatio: 0,
        recencyScore: 0,
        coverageScore: 0,
        firstPartyScore: 0,
        threshold,
        failedChecks: ['No evidence bundle available'],
      },
    }
  }

  const items = bundle.items

  // Group items by type
  const byType = new Map<NormalizedEvidenceType, typeof items>()
  for (const item of items) {
    const type = item.type
    if (!byType.has(type)) {
      byType.set(type, [])
    }
    byType.get(type)!.push(item)
  }

  const typesPresent = Array.from(byType.keys())
  const typesMissing = ALL_EVIDENCE_TYPES.filter(t => !typesPresent.includes(t))
  const typeCount = typesPresent.length
  const totalTypesConsidered = ALL_EVIDENCE_TYPES.length

  // Compute first-party ratio
  let firstPartyCount = 0
  let thirdPartyCount = 0

  for (const item of items) {
    if (isFirstParty(item, competitorDomains)) {
      firstPartyCount++
    } else {
      thirdPartyCount++
    }
  }

  const totalSources = firstPartyCount + thirdPartyCount
  const firstPartyRatio = totalSources > 0 ? firstPartyCount / totalSources : 0

  // Compute recency (median age)
  const ages: number[] = []
  const dates: string[] = []

  for (const item of items) {
    const dateStr = item.publishedAt ?? item.retrievedAt
    if (dateStr) {
      try {
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          dates.push(dateStr)
          const now = new Date()
          const ageMs = now.getTime() - date.getTime()
          const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24))
          ages.push(ageDays)
        }
      } catch {
        // Invalid date, skip
      }
    }
  }

  const medianAgeDays = ages.length > 0 ? median(ages) : null
  const newestAt = dates.length > 0 
    ? dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
    : undefined
  const oldestAt = dates.length > 0
    ? dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
    : undefined

  // Compute component scores
  const coverageScore = clamp(typeCount / totalTypesConsidered, 0, 1)
  const recencyScore = computeRecencyScore(medianAgeDays)
  const firstPartyScore = clamp(firstPartyRatio / 0.6, 0, 1) // Caps at ~60% first-party

  // Compute final score
  const finalScore01 = 0.45 * coverageScore + 0.35 * recencyScore + 0.20 * firstPartyScore
  const score10 = roundTo1Decimal(finalScore01 * 10)

  // Determine score label
  let scoreLabel: 'High' | 'Medium' | 'Low' | 'Insufficient'
  if (score10 >= 7.5) {
    scoreLabel = 'High'
  } else if (score10 >= 5.0) {
    scoreLabel = 'Medium'
  } else if (score10 >= 2.5) {
    scoreLabel = 'Low'
  } else {
    scoreLabel = 'Insufficient'
  }

  // Check gating requirements
  const failedChecks: string[] = []

  if (totalSources < threshold.minTotalSources) {
    failedChecks.push(`Need ${threshold.minTotalSources} sources, have ${totalSources}`)
  }

  if (typeCount < threshold.minEvidenceTypes) {
    failedChecks.push(`Need ${threshold.minEvidenceTypes} evidence types, have ${typeCount}`)
  }

  if (firstPartyRatio < threshold.minFirstPartyRatio) {
    failedChecks.push(
      `Need ${(threshold.minFirstPartyRatio * 100).toFixed(0)}% first-party sources, have ${(firstPartyRatio * 100).toFixed(0)}%`
    )
  }

  if (medianAgeDays !== null && medianAgeDays > threshold.maxMedianAgeDays) {
    failedChecks.push(
      `Median evidence age ${medianAgeDays} days exceeds maximum ${threshold.maxMedianAgeDays} days`
    )
  } else if (medianAgeDays === null && dates.length === 0) {
    // No dates available - this is a warning but not necessarily a failure
    // We'll allow it but note it
  }

  const isSufficient = failedChecks.length === 0

  // If insufficient, don't include score10
  if (!isSufficient) {
    return {
      isSufficient: false,
      scoreLabel: 'Insufficient',
      reasons: {
        typesPresent,
        typesMissing,
        typeCount,
        totalTypesConsidered,
        firstPartyCount,
        thirdPartyCount,
        firstPartyRatio,
        newestAt,
        oldestAt,
        medianAgeDays: medianAgeDays ?? undefined,
        recencyScore,
        coverageScore,
        firstPartyScore,
        threshold,
        failedChecks,
      },
    }
  }

  return {
    isSufficient: true,
    score10,
    scoreLabel,
    reasons: {
      typesPresent,
      typesMissing,
      typeCount,
      totalTypesConsidered,
      firstPartyCount,
      thirdPartyCount,
      firstPartyRatio,
      newestAt,
      oldestAt,
      medianAgeDays: medianAgeDays ?? undefined,
      recencyScore,
      coverageScore,
      firstPartyScore,
      threshold,
      failedChecks: [],
    },
  }
}

