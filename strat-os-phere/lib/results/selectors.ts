/**
 * Selectors for frame-based reorganization of results
 * Allows viewing the same data through different analytical lenses
 */

import type { JtbdArtifactContent, JtbdItem } from '@/lib/schemas/jtbd'
import type { OpportunitiesArtifactContent, OpportunityItem } from '@/lib/schemas/opportunities'
import type { CompetitorSnapshot } from '@/lib/schemas/competitorSnapshot'

export type ResultsFrame = 
  | 'jobs' 
  | 'differentiation_themes' 
  | 'customer_struggles' 
  | 'strategic_bets'

export interface FrameGroup {
  id: string
  label: string
  items: FrameItem[]
}

export type FrameItem = 
  | { type: 'jtbd'; job: JtbdItem }
  | { type: 'opportunity'; opportunity: OpportunityItem }
  | { type: 'struggle'; struggle: string; competitor: string }

/**
 * Group JTBD items by jobs (default frame - no reorganization needed)
 */
export function selectByJobs(
  jtbd: JtbdArtifactContent | null | undefined
): FrameGroup[] {
  if (!jtbd?.jobs) return []
  
  // Sort by opportunity score descending
  const sorted = [...jtbd.jobs].sort(
    (a, b) => b.opportunity_score - a.opportunity_score
  )
  
  return [{
    id: 'all-jobs',
    label: 'All Jobs',
    items: sorted.map(job => ({ type: 'jtbd' as const, job })),
  }]
}

/**
 * Group opportunities by differentiation themes (type-based clustering)
 */
export function selectByDifferentiationThemes(
  opportunities: OpportunitiesArtifactContent | null | undefined
): FrameGroup[] {
  if (!opportunities?.opportunities) return []
  
  // Group by opportunity type
  const byType = new Map<string, OpportunityItem[]>()
  
  for (const opp of opportunities.opportunities) {
    const type = opp.type
    if (!byType.has(type)) {
      byType.set(type, [])
    }
    byType.get(type)!.push(opp)
  }
  
  // Convert to frame groups, sorted by average score
  const groups: FrameGroup[] = []
  
  for (const [type, items] of byType.entries()) {
    const sorted = [...items].sort((a, b) => b.score - a.score)
    const avgScore = items.reduce((sum, item) => sum + item.score, 0) / items.length
    
    groups.push({
      id: `theme-${type}`,
      label: formatTypeLabel(type),
      items: sorted.map(opp => ({ type: 'opportunity' as const, opportunity: opp })),
    })
  }
  
  // Sort groups by average score descending
  return groups.sort((a, b) => {
    const aScore = a.items
      .filter((item): item is { type: 'opportunity'; opportunity: OpportunityItem } => 
        item.type === 'opportunity'
      )
      .reduce((sum, item) => sum + item.opportunity.score, 0) / a.items.length
    
    const bScore = b.items
      .filter((item): item is { type: 'opportunity'; opportunity: OpportunityItem } => 
        item.type === 'opportunity'
      )
      .reduce((sum, item) => sum + item.opportunity.score, 0) / b.items.length
    
    return bScore - aScore
  })
}

/**
 * Group insights by customer struggles
 */
export function selectByCustomerStruggles(
  snapshots: CompetitorSnapshot[] | null | undefined,
  jtbd: JtbdArtifactContent | null | undefined
): FrameGroup[] {
  if (!snapshots) return []
  
  // Extract all struggles from snapshots
  const struggleMap = new Map<string, { struggle: string; competitor: string }[]>()
  
  for (const snapshot of snapshots) {
    if (snapshot.customer_struggles) {
      for (const struggle of snapshot.customer_struggles) {
        if (!struggleMap.has(struggle)) {
          struggleMap.set(struggle, [])
        }
        struggleMap.get(struggle)!.push({
          struggle,
          competitor: snapshot.competitor_name,
        })
      }
    }
  }
  
  if (struggleMap.size === 0) return []
  
  // Group struggles by theme (simple keyword-based clustering)
  const themeGroups = new Map<string, { struggle: string; competitor: string }[]>()
  
  for (const [struggle, items] of struggleMap.entries()) {
    // Simple keyword extraction for grouping
    const keywords = extractStruggleKeywords(struggle)
    const theme = keywords.length > 0 ? keywords[0] : 'Other Issues'
    
    if (!themeGroups.has(theme)) {
      themeGroups.set(theme, [])
    }
    themeGroups.get(theme)!.push(...items)
  }
  
  // Convert to frame groups
  const groups: FrameGroup[] = []
  
  for (const [theme, items] of themeGroups.entries()) {
    // Deduplicate struggles
    const uniqueStruggles = new Map<string, string>()
    for (const item of items) {
      if (!uniqueStruggles.has(item.struggle)) {
        uniqueStruggles.set(item.struggle, item.competitor)
      }
    }
    
    groups.push({
      id: `struggle-${theme.toLowerCase().replace(/\s+/g, '-')}`,
      label: theme,
      items: Array.from(uniqueStruggles.entries()).map(([struggle, competitor]) => ({
        type: 'struggle' as const,
        struggle,
        competitor,
      })),
    })
  }
  
  return groups.sort((a, b) => b.items.length - a.items.length)
}

/**
 * Group opportunities by strategic bets (product direction clustering)
 */
export function selectByStrategicBets(
  opportunities: OpportunitiesArtifactContent | null | undefined
): FrameGroup[] {
  if (!opportunities?.opportunities) return []
  
  // Cluster opportunities by strategic direction keywords
  const betKeywords = [
    { keywords: ['automation', 'automate', 'workflow'], label: 'Automation & Workflow' },
    { keywords: ['ux', 'user experience', 'interface', 'design'], label: 'User Experience' },
    { keywords: ['compliance', 'security', 'trust', 'governance'], label: 'Compliance & Trust' },
    { keywords: ['integration', 'api', 'connect', 'sync'], label: 'Integration & Connectivity' },
    { keywords: ['pricing', 'cost', 'value', 'packaging'], label: 'Pricing & Packaging' },
    { keywords: ['distribution', 'channel', 'partnership'], label: 'Distribution & Channels' },
  ]
  
  const betGroups = new Map<string, OpportunityItem[]>()
  
  for (const opp of opportunities.opportunities) {
    const titleLower = opp.title.toLowerCase()
    const whyNowLower = opp.why_now.toLowerCase()
    const text = `${titleLower} ${whyNowLower}`
    
    let matched = false
    for (const bet of betKeywords) {
      if (bet.keywords.some(keyword => text.includes(keyword))) {
        if (!betGroups.has(bet.label)) {
          betGroups.set(bet.label, [])
        }
        betGroups.get(bet.label)!.push(opp)
        matched = true
        break
      }
    }
    
    if (!matched) {
      if (!betGroups.has('Other Strategic Bets')) {
        betGroups.set('Other Strategic Bets', [])
      }
      betGroups.get('Other Strategic Bets')!.push(opp)
    }
  }
  
  // Convert to frame groups, sorted by average score
  const groups: FrameGroup[] = []
  
  for (const [label, items] of betGroups.entries()) {
    const sorted = [...items].sort((a, b) => b.score - a.score)
    
    groups.push({
      id: `bet-${label.toLowerCase().replace(/\s+/g, '-')}`,
      label,
      items: sorted.map(opp => ({ type: 'opportunity' as const, opportunity: opp })),
    })
  }
  
  // Sort by average score
  return groups.sort((a, b) => {
    const aScore = a.items
      .filter((item): item is { type: 'opportunity'; opportunity: OpportunityItem } => 
        item.type === 'opportunity'
      )
      .reduce((sum, item) => sum + item.opportunity.score, 0) / a.items.length
    
    const bScore = b.items
      .filter((item): item is { type: 'opportunity'; opportunity: OpportunityItem } => 
        item.type === 'opportunity'
      )
      .reduce((sum, item) => sum + item.opportunity.score, 0) / b.items.length
    
    return bScore - aScore
  })
}

/**
 * Format opportunity type label for display
 */
function formatTypeLabel(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Extract keywords from struggle text for grouping
 */
function extractStruggleKeywords(struggle: string): string[] {
  const commonKeywords = [
    'performance',
    'speed',
    'reliability',
    'usability',
    'complexity',
    'cost',
    'pricing',
    'support',
    'documentation',
    'integration',
    'scalability',
    'security',
  ]
  
  const lower = struggle.toLowerCase()
  return commonKeywords.filter(keyword => lower.includes(keyword))
}

/**
 * Readout-specific selectors for executive narrative view
 */

import type { NormalizedResults } from './normalizeResults'
import { getOpportunityScore } from './opportunityUx'

export interface ReadoutData {
  lastGeneratedAt: string | null
  topOpportunities: Array<{
    title: string
    score: number | null
    oneLiner: string | null
    whyNow: string | null
    proposedMove: string | null
    whatItEnables: string[]
    whoItsFor: string | null
    firstExperiment: string | null
    raw: unknown // Raw opportunity object for citation extraction
  }>
  execSummaryBullets: string[]
  actionPlan: {
    decision: string | null
    next3Moves: string[]
    whatToSayNoTo: string[]
  }
  whyThisMatters: {
    marketTension: string | null
    whyNow: string | null
    whyDefensible: string | null
  }
}

/**
 * Selects data for readout view from normalized artifacts
 */
export function selectReadoutData(normalized: NormalizedResults): ReadoutData {
  const opportunities = normalized.opportunities.best
  const strategicBets = normalized.strategicBets
  const lastGeneratedAt = normalized.meta.lastGeneratedAt

  // Extract top 3 opportunities
  const topOpportunities: ReadoutData['topOpportunities'] = []
  if (opportunities) {
    const oppsList = 'opportunities' in opportunities.content 
      ? opportunities.content.opportunities 
      : []
    
    // Sort by score
    const sorted = [...oppsList].sort((a, b) => {
      const scoreA = getOpportunityScore(a) ?? 0
      const scoreB = getOpportunityScore(b) ?? 0
      return scoreB - scoreA
    })

    // Take top 3
    for (const opp of sorted.slice(0, 3)) {
      const score = getOpportunityScore(opp)
      const title = 'title' in opp ? opp.title : 'Untitled Opportunity'
      const oneLiner = 'one_liner' in opp ? opp.one_liner : null
      const whyNow = 'why_now' in opp ? opp.why_now : null
      const proposedMove = 'proposed_move' in opp ? opp.proposed_move : null
      
      // Extract "what it enables" from various fields
      const whatItEnables: string[] = []
      if ('what_this_enables' in opp && Array.isArray(opp.what_this_enables)) {
        whatItEnables.push(...opp.what_this_enables)
      } else if ('how_to_win' in opp && Array.isArray(opp.how_to_win)) {
        whatItEnables.push(...opp.how_to_win)
      } else if ('impact' in opp && typeof opp.impact === 'string') {
        whatItEnables.push(opp.impact)
      }
      
      // Extract "who it's for"
      const whoItsFor = 'who_this_serves' in opp && typeof opp.who_this_serves === 'string'
        ? opp.who_this_serves 
        : ('who_it_serves' in opp && typeof opp.who_it_serves === 'string' ? opp.who_it_serves : null)
      
      // Extract first experiment (V3 has experiments array, V2 has first_experiments array)
      let firstExperiment: string | null = null
      if ('experiments' in opp && Array.isArray(opp.experiments) && opp.experiments.length > 0) {
        const exp = opp.experiments[0]
        if (exp && typeof exp === 'object' && 'hypothesis' in exp) {
          firstExperiment = (exp as any).hypothesis || (exp as any).smallest_test || null
        }
      } else if ('first_experiments' in opp && Array.isArray(opp.first_experiments) && opp.first_experiments.length > 0) {
        const firstExp = opp.first_experiments[0]
        firstExperiment = typeof firstExp === 'string' ? firstExp : null
      }

      topOpportunities.push({
        title,
        score,
        oneLiner,
        whyNow,
        proposedMove,
        whatItEnables,
        whoItsFor,
        firstExperiment,
        raw: opp,
      })
    }
  }

  // Extract executive summary bullets (from synthesis if available, otherwise from top opportunities)
  const execSummaryBullets: string[] = []
  if (topOpportunities.length > 0) {
    // Use top 3 opportunities to create bullets (limit to 5-7 total)
    for (const opp of topOpportunities.slice(0, 3)) {
      if (opp.oneLiner) {
        execSummaryBullets.push(opp.oneLiner)
      } else if (opp.title && opp.whyNow) {
        execSummaryBullets.push(`${opp.title}: ${opp.whyNow}`)
      }
    }
  }
  // Ensure we have at least 3-5 bullets, pad if needed
  while (execSummaryBullets.length < 3 && topOpportunities.length > execSummaryBullets.length) {
    const opp = topOpportunities[execSummaryBullets.length]
    if (opp.title) {
      execSummaryBullets.push(opp.title)
    }
  }

  // Extract action plan from strategic bets or derive from opportunities
  const actionPlan: ReadoutData['actionPlan'] = {
    decision: null,
    next3Moves: [],
    whatToSayNoTo: [],
  }

  if (strategicBets?.content?.bets && strategicBets.content.bets.length > 0) {
    const topBet = strategicBets.content.bets[0]
    actionPlan.decision = topBet.summary || null
    actionPlan.next3Moves = strategicBets.content.bets
      .slice(0, 3)
      .map(bet => bet.title)
      .filter(Boolean) as string[]
    actionPlan.whatToSayNoTo = topBet.what_we_say_no_to || []
  } else if (topOpportunities.length > 0) {
    // Derive from top opportunity
    const topOpp = topOpportunities[0]
    actionPlan.decision = topOpp.proposedMove || topOpp.oneLiner || null
    actionPlan.next3Moves = topOpportunities
      .slice(0, 3)
      .map(opp => opp.title)
      .filter(Boolean)
    
    // Try to extract "what to say no to" from tradeoffs if available (V3) or use generic (V2)
    if (opportunities && 'opportunities' in opportunities.content) {
      const sortedOpps = [...opportunities.content.opportunities].sort((a, b) => {
        const scoreA = getOpportunityScore(a) ?? 0
        const scoreB = getOpportunityScore(b) ?? 0
        return scoreB - scoreA
      })
      const topOppRaw = sortedOpps[0]
      if (topOppRaw && 'tradeoffs' in topOppRaw && topOppRaw.tradeoffs) {
        actionPlan.whatToSayNoTo = (topOppRaw.tradeoffs as any).what_we_say_no_to || []
      }
    }
  }

  // Extract "why this matters" content
  const whyThisMatters: ReadoutData['whyThisMatters'] = {
    marketTension: null,
    whyNow: null,
    whyDefensible: null,
  }

  if (strategicBets?.content?.bets && strategicBets.content.bets.length > 0) {
    const topBet = strategicBets.content.bets[0]
    whyThisMatters.whyNow = topBet.first_real_world_proof?.description || null
    whyThisMatters.whyDefensible = topBet.why_competitors_wont_follow || null
  } else if (topOpportunities.length > 0) {
    const topOpp = topOpportunities[0]
    whyThisMatters.whyNow = topOpp.whyNow
    // Try to extract defensibility from tradeoffs (V3) or why_they_cant_easily_copy (V2)
    if (opportunities && 'opportunities' in opportunities.content) {
      const sortedOpps = [...opportunities.content.opportunities].sort((a, b) => {
        const scoreA = getOpportunityScore(a) ?? 0
        const scoreB = getOpportunityScore(b) ?? 0
        return scoreB - scoreA
      })
      const topOppRaw = sortedOpps[0]
      if (topOppRaw) {
        if ('tradeoffs' in topOppRaw && topOppRaw.tradeoffs) {
          const defensibilityReasons = (topOppRaw.tradeoffs as any).why_competitors_wont_follow || []
          whyThisMatters.whyDefensible = defensibilityReasons.join('. ') || null
        } else if ('why_they_cant_easily_copy' in topOppRaw && typeof topOppRaw.why_they_cant_easily_copy === 'string') {
          whyThisMatters.whyDefensible = topOppRaw.why_they_cant_easily_copy
        }
      }
    }
  }

  // Market tension: derive from opportunity context or use a generic message
  if (topOpportunities.length > 0) {
    const tensionSignals = topOpportunities
      .filter(opp => opp.whyNow)
      .map(opp => opp.whyNow)
      .filter(Boolean) as string[]
    if (tensionSignals.length > 0) {
      whyThisMatters.marketTension = tensionSignals[0]
    }
  }

  return {
    lastGeneratedAt,
    topOpportunities,
    execSummaryBullets,
    actionPlan,
    whyThisMatters,
  }
}

