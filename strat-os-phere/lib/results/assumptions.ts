/**
 * Assumptions derivation from Opportunities artifacts
 * 
 * Derives explicit assumptions from opportunity data without requiring
 * new artifact types or schema changes.
 */

import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import { getOpportunityScore } from './opportunityUx'

export type AssumptionCategory = 'Market' | 'Buyer' | 'Product' | 'Competition' | 'Evidence' | 'Execution'

export type AssumptionConfidence = 'High' | 'Medium' | 'Low'

export interface Assumption {
  id: string // Deterministic hash from text+category
  category: AssumptionCategory
  statement: string // 1 sentence
  whyItMatters: string // 1 sentence
  confidence: AssumptionConfidence
  impact: number // 1-5 integer
  relatedOpportunityIds: string[] // Array of opportunity IDs or indexes
  sourcesCount: number // Derived from citations count
}

/**
 * Generate a stable ID from text and category
 */
function generateAssumptionId(text: string, category: AssumptionCategory): string {
  // Simple hash function for deterministic IDs
  const str = `${category}:${text}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `assumption-${Math.abs(hash).toString(36)}`
}

/**
 * Derive confidence from evidence strength/recency
 */
function deriveConfidence(
  citationsCount: number,
  recencyConfidence?: number,
  hasRecentEvidence?: boolean
): AssumptionConfidence {
  if (citationsCount >= 4 && (recencyConfidence ?? 0) >= 7) {
    return 'High'
  }
  if (citationsCount >= 2 || (recencyConfidence ?? 0) >= 5) {
    return 'Medium'
  }
  return 'Low'
}

/**
 * Derive impact from whether assumption affects top opportunities
 */
function deriveImpact(
  affectsTopOpportunities: boolean,
  opportunityScore?: number | null
): number {
  if (affectsTopOpportunities && (opportunityScore ?? 0) >= 70) {
    return 5
  }
  if (affectsTopOpportunities && (opportunityScore ?? 0) >= 50) {
    return 4
  }
  if (affectsTopOpportunities) {
    return 3
  }
  return 2
}

/**
 * Derive assumptions from Opportunities artifact
 */
export function deriveAssumptionsFromOpportunities(
  opportunitiesV3: OpportunityV3ArtifactContent | null | undefined,
  opportunitiesV2: OpportunitiesArtifactContent | null | undefined
): Assumption[] {
  const assumptions: Assumption[] = []

  // Prefer V3, fallback to V2
  const opportunities = opportunitiesV3?.opportunities ?? opportunitiesV2?.opportunities ?? []
  
  if (opportunities.length === 0) {
    // Return generic exploratory assumptions if no opportunities
    return [
      {
        id: generateAssumptionId('Market dynamics are shifting in ways that create new opportunities', 'Market'),
        category: 'Market',
        statement: 'Market dynamics are shifting in ways that create new opportunities',
        whyItMatters: 'Understanding market shifts is critical for strategic positioning',
        confidence: 'Low',
        impact: 3,
        relatedOpportunityIds: [],
        sourcesCount: 0,
      },
      {
        id: generateAssumptionId('Buyer needs and pain points are evolving', 'Buyer'),
        category: 'Buyer',
        statement: 'Buyer needs and pain points are evolving',
        whyItMatters: 'Buyer evolution drives product strategy and positioning',
        confidence: 'Low',
        impact: 3,
        relatedOpportunityIds: [],
        sourcesCount: 0,
      },
    ]
  }

  // Sort opportunities by score (descending)
  const sortedOpportunities = [...opportunities].sort((a, b) => {
    const scoreA = getOpportunityScore(a) ?? 0
    const scoreB = getOpportunityScore(b) ?? 0
    return scoreB - scoreA
  })

  const topOpportunities = sortedOpportunities.slice(0, 3)
  const topOpportunityIds = topOpportunities.map((opp, idx) => 
    'id' in opp && typeof opp.id === 'string' ? opp.id : `opp-${idx}`
  )

  // Market assumptions (2)
  const marketAssumptions: Assumption[] = []
  
  // Extract market assumptions from top opportunities
  for (const opp of topOpportunities.slice(0, 2)) {
    const oppId = 'id' in opp && typeof opp.id === 'string' ? opp.id : `opp-${sortedOpportunities.indexOf(opp)}`
    const score = getOpportunityScore(opp) ?? 0
    const citationsCount = 'citations' in opp && Array.isArray(opp.citations) 
      ? opp.citations.length 
      : ('proof_points' in opp && Array.isArray(opp.proof_points))
        ? opp.proof_points.reduce((sum, pp) => sum + (Array.isArray(pp.citations) ? pp.citations.length : 0), 0)
        : 0
    
    const recencyConfidence = 'scoring' in opp && typeof opp.scoring === 'object' && opp.scoring !== null
      ? (opp.scoring as { breakdown?: { recencyConfidence?: number } }).breakdown?.recencyConfidence
      : undefined

    const whyNow = 'why_now' in opp ? String(opp.why_now) : ''
    const problem = 'problem_today' in opp ? String(opp.problem_today) : ''

    if (whyNow || problem) {
      marketAssumptions.push({
        id: generateAssumptionId(
          whyNow || `Market conditions favor ${'title' in opp ? opp.title : 'this opportunity'}`,
          'Market'
        ),
        category: 'Market',
        statement: whyNow || `Market conditions favor ${'title' in opp ? opp.title : 'this opportunity'}`,
        whyItMatters: `This market assumption underpins the ${'title' in opp ? opp.title : 'top opportunity'}`,
        confidence: deriveConfidence(citationsCount, recencyConfidence, citationsCount > 0),
        impact: deriveImpact(true, score),
        relatedOpportunityIds: [oppId],
        sourcesCount: citationsCount,
      })
    }
  }

  // Add generic market assumption if needed
  if (marketAssumptions.length < 2) {
    marketAssumptions.push({
      id: generateAssumptionId('Market dynamics are shifting to create new opportunities', 'Market'),
      category: 'Market',
      statement: 'Market dynamics are shifting to create new opportunities',
      whyItMatters: 'Market shifts drive strategic opportunities and competitive positioning',
      confidence: 'Medium',
      impact: 3,
      relatedOpportunityIds: topOpportunityIds.slice(0, 1),
      sourcesCount: sortedOpportunities.reduce((sum, opp) => {
        const citations = 'citations' in opp && Array.isArray(opp.citations) ? opp.citations.length : 0
        return sum + citations
      }, 0),
    })
  }

  assumptions.push(...marketAssumptions.slice(0, 2))

  // Buyer assumptions (2)
  const buyerAssumptions: Assumption[] = []

  for (const opp of topOpportunities.slice(0, 2)) {
    const oppId = 'id' in opp && typeof opp.id === 'string' ? opp.id : `opp-${sortedOpportunities.indexOf(opp)}`
    const score = getOpportunityScore(opp) ?? 0
    const citationsCount = 'citations' in opp && Array.isArray(opp.citations) 
      ? opp.citations.length 
      : ('proof_points' in opp && Array.isArray(opp.proof_points))
        ? opp.proof_points.reduce((sum, pp) => sum + (Array.isArray(pp.citations) ? pp.citations.length : 0), 0)
        : 0

    const customer = 'customer' in opp ? String(opp.customer) : ''
    const problem = 'problem_today' in opp ? String(opp.problem_today) : ''

    if (customer || problem) {
      buyerAssumptions.push({
        id: generateAssumptionId(
          customer ? `${customer} experience significant pain` : `Buyers have unmet needs in this area`,
          'Buyer'
        ),
        category: 'Buyer',
        statement: customer ? `${customer} experience significant pain` : `Buyers have unmet needs in this area`,
        whyItMatters: `Buyer pain drives the opportunity for ${'title' in opp ? opp.title : 'this solution'}`,
        confidence: deriveConfidence(citationsCount),
        impact: deriveImpact(true, score),
        relatedOpportunityIds: [oppId],
        sourcesCount: citationsCount,
      })
    }
  }

  if (buyerAssumptions.length < 2) {
    buyerAssumptions.push({
      id: generateAssumptionId('Buyer needs are evolving and creating new opportunities', 'Buyer'),
      category: 'Buyer',
      statement: 'Buyer needs are evolving and creating new opportunities',
      whyItMatters: 'Understanding buyer evolution is critical for product-market fit',
      confidence: 'Medium',
      impact: 3,
      relatedOpportunityIds: topOpportunityIds.slice(0, 1),
      sourcesCount: sortedOpportunities.reduce((sum, opp) => {
        const citations = 'citations' in opp && Array.isArray(opp.citations) ? opp.citations.length : 0
        return sum + citations
      }, 0),
    })
  }

  assumptions.push(...buyerAssumptions.slice(0, 2))

  // Competition assumptions (2)
  const competitionAssumptions: Assumption[] = []

  for (const opp of topOpportunities.slice(0, 2)) {
    const oppId = 'id' in opp && typeof opp.id === 'string' ? opp.id : `opp-${sortedOpportunities.indexOf(opp)}`
    const score = getOpportunityScore(opp) ?? 0

    // Check for tradeoffs/defensibility fields
    const whyCompetitorsWontFollow = 'tradeoffs' in opp && typeof opp.tradeoffs === 'object' && opp.tradeoffs !== null
      ? (opp.tradeoffs as { why_competitors_wont_follow?: string[] }).why_competitors_wont_follow
      : undefined

    if (whyCompetitorsWontFollow && Array.isArray(whyCompetitorsWontFollow) && whyCompetitorsWontFollow.length > 0) {
      competitionAssumptions.push({
        id: generateAssumptionId(whyCompetitorsWontFollow[0], 'Competition'),
        category: 'Competition',
        statement: whyCompetitorsWontFollow[0],
        whyItMatters: `This competitive assumption supports the defensibility of ${'title' in opp ? opp.title : 'this opportunity'}`,
        confidence: 'Medium',
        impact: deriveImpact(true, score),
        relatedOpportunityIds: [oppId],
        sourcesCount: 'citations' in opp && Array.isArray(opp.citations) ? opp.citations.length : 0,
      })
    }
  }

  if (competitionAssumptions.length < 2) {
    competitionAssumptions.push({
      id: generateAssumptionId('Competitors are not addressing this opportunity effectively', 'Competition'),
      category: 'Competition',
      statement: 'Competitors are not addressing this opportunity effectively',
      whyItMatters: 'Competitive gaps create strategic opportunities',
      confidence: 'Medium',
      impact: 3,
      relatedOpportunityIds: topOpportunityIds.slice(0, 1),
      sourcesCount: 0,
    })
  }

  assumptions.push(...competitionAssumptions.slice(0, 2))

  // Evidence assumption (1)
  const totalCitations = sortedOpportunities.reduce((sum, opp) => {
    const citations = 'citations' in opp && Array.isArray(opp.citations) 
      ? opp.citations.length 
      : ('proof_points' in opp && Array.isArray(opp.proof_points))
        ? opp.proof_points.reduce((sum, pp) => sum + (Array.isArray(pp.citations) ? pp.citations.length : 0), 0)
        : 0
    return sum + citations
  }, 0)

  assumptions.push({
    id: generateAssumptionId('Evidence quality and recency support these opportunities', 'Evidence'),
    category: 'Evidence',
    statement: totalCitations >= 10 
      ? 'Evidence quality and recency support these opportunities'
      : 'Evidence is limited and may require additional validation',
    whyItMatters: 'Evidence quality determines confidence in strategic decisions',
    confidence: totalCitations >= 10 ? 'High' : totalCitations >= 5 ? 'Medium' : 'Low',
    impact: 4,
    relatedOpportunityIds: topOpportunityIds,
    sourcesCount: totalCitations,
  })

  // Execution assumption (1)
  const topOpp = topOpportunities[0]
  if (topOpp) {
    const oppId = 'id' in topOpp && typeof topOpp.id === 'string' ? topOpp.id : 'opp-0'
    const capability = 'tradeoffs' in topOpp && typeof topOpp.tradeoffs === 'object' && topOpp.tradeoffs !== null
      ? (topOpp.tradeoffs as { capability_forced?: string[] }).capability_forced?.[0]
      : undefined

    assumptions.push({
      id: generateAssumptionId(
        capability || 'We have the capability to execute on this opportunity',
        'Execution'
      ),
      category: 'Execution',
      statement: capability || 'We have the capability to execute on this opportunity',
      whyItMatters: `Execution capability determines feasibility of ${'title' in topOpp ? topOpp.title : 'the top opportunity'}`,
      confidence: capability ? 'Medium' : 'Low',
      impact: 5,
      relatedOpportunityIds: [oppId],
      sourcesCount: 0,
    })
  } else {
    assumptions.push({
      id: generateAssumptionId('We have the capability to execute on identified opportunities', 'Execution'),
      category: 'Execution',
      statement: 'We have the capability to execute on identified opportunities',
      whyItMatters: 'Execution capability is critical for turning opportunities into outcomes',
      confidence: 'Low',
      impact: 3,
      relatedOpportunityIds: [],
      sourcesCount: 0,
    })
  }

  // Limit to 8-15 assumptions
  return assumptions.slice(0, 15)
}

