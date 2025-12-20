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

