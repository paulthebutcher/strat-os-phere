import type { OpportunityV3Item, Citation } from '@/lib/schemas/opportunityV3'
import { newestCitationDate } from '@/lib/utils/citations'
import { daysAgo } from '@/lib/utils/dates'

export type DecisionConfidenceLevel = 'high' | 'moderate' | 'exploratory'

export interface DecisionConfidence {
  level: DecisionConfidenceLevel
  reasons: string[]
  evidenceCount: number
  evidenceRecency?: string // e.g., "14 days ago"
  sourceTypeCount: number
  hasScoreBreakdown: boolean
}

/**
 * Compute decision confidence from opportunity data (UI-only, defensive)
 * Gracefully handles missing data and never throws errors
 */
export function computeDecisionConfidence(
  opportunity: OpportunityV3Item
): DecisionConfidence {
  const reasons: string[] = []
  let evidenceCount = 0
  let sourceTypeCount = 0
  const sourceTypes = new Set<string>()

  // Collect all citations from proof_points and citations array
  const allCitations: Citation[] = []

  // Add citations from proof_points
  if (opportunity.proof_points && Array.isArray(opportunity.proof_points)) {
    opportunity.proof_points.forEach((proof) => {
      if (proof.citations && Array.isArray(proof.citations)) {
        allCitations.push(...proof.citations)
      }
    })
  }

  // Add direct citations
  if (opportunity.citations && Array.isArray(opportunity.citations)) {
    allCitations.push(...opportunity.citations)
  }

  // Deduplicate citations by URL
  const uniqueCitations = Array.from(
    new Map(allCitations.map((c) => [c.url, c])).values()
  )

  evidenceCount = uniqueCitations.length

  // Analyze citations
  uniqueCitations.forEach((citation) => {
    if (citation.source_type) {
      sourceTypes.add(citation.source_type)
    }
  })

  sourceTypeCount = sourceTypes.size

  // Get newest citation date using centralized utility
  const newest = newestCitationDate(uniqueCitations)

  // Compute evidence recency
  let evidenceRecency: string | undefined
  if (newest) {
    const days = daysAgo(newest)
    if (days !== null) {
      if (days === 0) {
        evidenceRecency = 'Today'
      } else if (days === 1) {
        evidenceRecency = '1 day ago'
      } else if (days < 30) {
        evidenceRecency = `${days} days ago`
      } else if (days < 90) {
        const weeks = Math.floor(days / 7)
        evidenceRecency = `${weeks} week${weeks !== 1 ? 's' : ''} ago`
      } else {
        evidenceRecency = '90+ days ago'
      }
    }
  }

  // Check if scoring breakdown exists and is detailed
  const hasScoreBreakdown =
    opportunity.scoring &&
    typeof opportunity.scoring === 'object' &&
    'breakdown' in opportunity.scoring &&
    opportunity.scoring.breakdown &&
    typeof opportunity.scoring.breakdown === 'object' &&
    Object.keys(opportunity.scoring.breakdown).length > 0

  // Extract recencyConfidence from scoring breakdown if available
  let recencyConfidenceScore: number | null = null
  if (
    hasScoreBreakdown &&
    'recencyConfidence' in opportunity.scoring.breakdown
  ) {
    const rc = opportunity.scoring.breakdown.recencyConfidence
    if (typeof rc === 'number') {
      recencyConfidenceScore = rc
    }
  }

  // Build reasons with executive-friendly language
  if (evidenceCount >= 8) {
    reasons.push(`${evidenceCount} sources`)
  } else if (evidenceCount >= 4) {
    reasons.push(`${evidenceCount} sources`)
  } else if (evidenceCount > 0) {
    reasons.push(`${evidenceCount} source${evidenceCount !== 1 ? 's' : ''}`)
  }

  if (sourceTypeCount >= 3) {
    const sourceTypeLabels = Array.from(sourceTypes)
      .slice(0, 3)
      .map((st) => st.replace(/_/g, ' '))
      .join(', ')
    reasons.push(`${sourceTypeLabels} signals`)
  } else if (sourceTypeCount >= 2) {
    const sourceTypeLabels = Array.from(sourceTypes)
      .map((st) => st.replace(/_/g, ' '))
      .join(' + ')
    reasons.push(`${sourceTypeLabels} signals`)
  }

  if (evidenceRecency && newest) {
    const days = daysAgo(newest)
    if (days !== null) {
      if (days <= 30) {
        reasons.push('Signals are recent and consistent')
      } else if (days <= 90) {
        reasons.push('Signals from last quarter')
      }
    }
  }

  if (recencyConfidenceScore !== null && recencyConfidenceScore >= 7) {
    reasons.push('Strong external evidence')
  }

  if (hasScoreBreakdown) {
    reasons.push('Detailed score breakdown')
  }

  // Determine confidence level
  let level: DecisionConfidenceLevel = 'exploratory'

  // High confidence criteria:
  // - 8+ citations
  // - 3+ source types
  // - Recent signals (within 30 days)
  // - Recency confidence >= 7 (if available)
  const hasHighEvidenceCount = evidenceCount >= 8
  const hasHighSourceDiversity = sourceTypeCount >= 3
  const newestDays = newest ? daysAgo(newest) : null
  const hasRecentSignals = newestDays !== null && newestDays <= 30
  const hasHighRecencyConfidence =
    recencyConfidenceScore !== null && recencyConfidenceScore >= 7

  if (
    hasHighEvidenceCount &&
    hasHighSourceDiversity &&
    (hasRecentSignals || hasHighRecencyConfidence)
  ) {
    level = 'high'
  } else if (
    evidenceCount >= 4 &&
    sourceTypeCount >= 2 &&
    (newest === null || (newestDays !== null && newestDays <= 90))
  ) {
    level = 'moderate'
  }

  // Default to exploratory if we don't have enough data
  if (evidenceCount === 0 && !hasScoreBreakdown) {
    level = 'exploratory'
    // Replace reasons with more appropriate messaging
    reasons.length = 0
    reasons.push('Early signal')
  }

  return {
    level,
    reasons: reasons.length > 0 ? reasons : ['Early signal, worth validating'],
    evidenceCount,
    evidenceRecency,
    sourceTypeCount,
    hasScoreBreakdown,
  }
}

/**
 * Compute aggregate confidence across all opportunities (for summary)
 */
export function computeAggregateConfidence(
  opportunities: OpportunityV3Item[]
): {
  overallLevel: DecisionConfidenceLevel
  totalEvidenceCount: number
  sourceTypes: Set<string>
  averageRecency: string | null
} {
  if (opportunities.length === 0) {
    return {
      overallLevel: 'exploratory',
      totalEvidenceCount: 0,
      sourceTypes: new Set(),
      averageRecency: null,
    }
  }

  const allConfidences = opportunities.map(computeDecisionConfidence)
  const totalEvidenceCount = allConfidences.reduce(
    (sum, conf) => sum + conf.evidenceCount,
    0
  )

  // Collect all source types
  const allSourceTypes = new Set<string>()
  opportunities.forEach((opp) => {
    const citations: Citation[] = []
    if (opp.proof_points) {
      opp.proof_points.forEach((proof) => {
        if (proof.citations) {
          citations.push(...proof.citations)
        }
      })
    }
    if (opp.citations) {
      citations.push(...opp.citations)
    }
    citations.forEach((c) => {
      if (c.source_type) {
        allSourceTypes.add(c.source_type)
      }
    })
  })

  // Find newest citation across all opportunities
  const allCitationsForDate: Citation[] = []
  opportunities.forEach((opp) => {
    if (opp.proof_points) {
      opp.proof_points.forEach((proof) => {
        if (proof.citations) {
          allCitationsForDate.push(...proof.citations)
        }
      })
    }
    if (opp.citations) {
      allCitationsForDate.push(...opp.citations)
    }
  })

  const newest = newestCitationDate(allCitationsForDate)

  let averageRecency: string | null = null
  if (newest) {
    const days = daysAgo(newest)
    if (days !== null) {
      if (days <= 90) {
        if (days === 0) {
          averageRecency = 'today'
        } else if (days === 1) {
          averageRecency = '1 day ago'
        } else if (days < 30) {
          averageRecency = `${days} days ago`
        } else {
          const weeks = Math.floor(days / 7)
          averageRecency = `${weeks} week${weeks !== 1 ? 's' : ''} ago`
        }
      } else {
        averageRecency = 'last 90 days'
      }
    }
  }

  // Determine overall level based on average
  const highCount = allConfidences.filter((c) => c.level === 'high').length
  const moderateCount = allConfidences.filter((c) => c.level === 'moderate')
    .length

  let overallLevel: DecisionConfidenceLevel = 'exploratory'
  if (highCount > moderateCount + allConfidences.length / 3) {
    overallLevel = 'high'
  } else if (
    moderateCount > 0 ||
    (highCount > 0 && allConfidences.length <= 3)
  ) {
    overallLevel = 'moderate'
  }

  return {
    overallLevel,
    totalEvidenceCount,
    sourceTypes: allSourceTypes,
    averageRecency,
  }
}

