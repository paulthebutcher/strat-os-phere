/**
 * Helper functions to extract insight lineage from artifacts
 * Uses existing artifact metadata without new LLM calls
 */

import type { JtbdArtifactContent, JtbdItem } from '@/lib/schemas/jtbd'
import type { OpportunitiesArtifactContent, OpportunityItem } from '@/lib/schemas/opportunities'
import type { CompetitorSnapshot } from '@/lib/schemas/competitorSnapshot'

export type SignalType = 
  | 'reviews'
  | 'pricing'
  | 'changelog'
  | 'docs'
  | 'jobs'
  | 'marketing'
  | 'support_forums'
  | 'unknown'

export interface InsightLineage {
  inputs: {
    signalTypes: SignalType[]
  }
  observedPatterns: string[]
  synthesis: string
}

/**
 * Extract signal types from artifact metadata
 */
function extractSignalTypes(meta: { signals?: Record<string, unknown> } | undefined): SignalType[] {
  if (!meta?.signals) return []
  
  const signalTypes: SignalType[] = []
  const signals = meta.signals
  
  // Check for common signal indicators in metadata
  if (signals.reviews || signals.review_count) signalTypes.push('reviews')
  if (signals.pricing || signals.pricing_page) signalTypes.push('pricing')
  if (signals.changelog || signals.changelog_entries) signalTypes.push('changelog')
  if (signals.docs || signals.documentation) signalTypes.push('docs')
  if (signals.jobs || signals.job_postings) signalTypes.push('jobs')
  if (signals.marketing || signals.marketing_site) signalTypes.push('marketing')
  if (signals.support_forums || signals.forum_posts) signalTypes.push('support_forums')
  
  // If no specific signals found but signals object exists, mark as unknown
  if (signalTypes.length === 0 && Object.keys(signals).length > 0) {
    signalTypes.push('unknown')
  }
  
  return signalTypes.length > 0 ? signalTypes : ['unknown']
}

/**
 * Generate observed patterns from evidence and proof points
 */
function generateObservedPatterns(
  evidence?: Array<{ competitor?: string; citation?: string; quote?: string }>,
  proofPoints?: Array<{ claim: string; confidence: string }>
): string[] {
  const patterns: string[] = []
  
  if (evidence && evidence.length > 0) {
    const competitorCount = new Set(evidence.map(e => e.competitor).filter(Boolean)).size
    if (competitorCount > 0) {
      patterns.push(`Evidence from ${competitorCount} competitor${competitorCount > 1 ? 's' : ''}`)
    }
    
    const hasCitations = evidence.some(e => e.citation)
    if (hasCitations) {
      patterns.push('Multiple source citations present')
    }
  }
  
  if (proofPoints && proofPoints.length > 0) {
    const highConfidenceCount = proofPoints.filter(p => p.confidence === 'high').length
    if (highConfidenceCount > 0) {
      patterns.push(`${highConfidenceCount} high-confidence proof point${highConfidenceCount > 1 ? 's' : ''}`)
    }
    
    const avgConfidence = proofPoints.reduce((acc, p) => {
      const weight = p.confidence === 'high' ? 3 : p.confidence === 'med' ? 2 : 1
      return acc + weight
    }, 0) / proofPoints.length
    
    if (avgConfidence >= 2.5) {
      patterns.push('Strong evidence confidence across sources')
    }
  }
  
  return patterns.slice(0, 4) // Limit to 2-4 patterns
}

/**
 * Generate synthesis sentence from patterns and context
 */
function generateSynthesis(
  patterns: string[],
  context: {
    type: 'jtbd' | 'opportunity' | 'struggle'
    item: JtbdItem | OpportunityItem | string
  }
): string {
  if (patterns.length === 0) {
    return 'This insight emerged from analysis of competitor evidence and market signals.'
  }
  
  const patternSummary = patterns.length === 1 
    ? patterns[0]
    : patterns.slice(0, 2).join(' and ')
  
  if (context.type === 'jtbd') {
    const job = context.item as JtbdItem
    return `Analysis of ${patternSummary} revealed a recurring job pattern: ${job.who} need to ${job.job_statement.split('I want to ')[1]?.split(' so I can')[0] || 'accomplish this task'}.`
  } else if (context.type === 'opportunity') {
    const opp = context.item as OpportunityItem
    return `Synthesis of ${patternSummary} identified a differentiation opportunity: ${opp.title}.`
  } else {
    const struggle = context.item as string
    return `Pattern analysis of ${patternSummary} highlighted customer struggles: ${struggle}.`
  }
}

/**
 * Get lineage for a JTBD item
 */
export function getJtbdLineage(
  job: JtbdItem,
  artifact: JtbdArtifactContent
): InsightLineage {
  const signalTypes = extractSignalTypes(artifact.meta)
  const patterns = generateObservedPatterns(job.evidence)
  
  // If no patterns from evidence, create deterministic patterns from job data
  if (patterns.length === 0) {
    if (job.evidence && job.evidence.length > 0) {
      patterns.push('Evidence-based job identification')
    }
    if (job.importance_score >= 4) {
      patterns.push('High importance score indicates strong market signal')
    }
    if (job.satisfaction_score <= 2) {
      patterns.push('Low satisfaction suggests unmet need')
    }
  }
  
  const synthesis = generateSynthesis(patterns, { type: 'jtbd', item: job })
  
  return {
    inputs: { signalTypes: signalTypes.length > 0 ? signalTypes : ['unknown'] },
    observedPatterns: patterns.length > 0 ? patterns : ['Pattern analysis from competitor evidence'],
    synthesis,
  }
}

/**
 * Get lineage for an Opportunity item
 */
export function getOpportunityLineage(
  opportunity: OpportunityItem,
  artifact: OpportunitiesArtifactContent
): InsightLineage {
  const signalTypes = extractSignalTypes(artifact.meta)
  
  // Generate patterns from opportunity characteristics
  const patterns: string[] = []
  
  if (opportunity.confidence === 'high') {
    patterns.push('High confidence based on strong evidence')
  }
  
  if (opportunity.impact === 'high') {
    patterns.push('High impact potential identified')
  }
  
  if (opportunity.job_link) {
    patterns.push('Linked to high-opportunity job')
  }
  
  if (opportunity.score >= 70) {
    patterns.push('High opportunity score indicates strong differentiation potential')
  }
  
  const synthesis = generateSynthesis(
    patterns.length > 0 ? patterns : ['Opportunity analysis'],
    { type: 'opportunity', item: opportunity }
  )
  
  return {
    inputs: { signalTypes: signalTypes.length > 0 ? signalTypes : ['unknown'] },
    observedPatterns: patterns.length > 0 ? patterns : ['Strategic opportunity analysis'],
    synthesis,
  }
}

/**
 * Get lineage for a customer struggle (from competitor snapshot)
 */
export function getStruggleLineage(
  struggle: string,
  snapshot: CompetitorSnapshot,
  artifactMeta?: { signals?: Record<string, unknown> }
): InsightLineage {
  const signalTypes = extractSignalTypes(artifactMeta)
  
  // Prefer reviews and support forums for struggles
  const relevantSignals = signalTypes.filter(s => 
    s === 'reviews' || s === 'support_forums' || s === 'unknown'
  )
  
  const patterns: string[] = []
  
  // Check if there are proof points that might indicate struggles
  if (snapshot.proof_points && snapshot.proof_points.length > 0) {
    const struggleRelated = snapshot.proof_points.filter(p => 
      p.claim.toLowerCase().includes('struggle') ||
      p.claim.toLowerCase().includes('pain') ||
      p.claim.toLowerCase().includes('issue') ||
      p.claim.toLowerCase().includes('problem')
    )
    
    if (struggleRelated.length > 0) {
      patterns.push('Evidence of customer pain points in proof points')
    }
  }
  
  if (snapshot.customer_struggles && snapshot.customer_struggles.length > 1) {
    patterns.push('Multiple struggle patterns identified')
  }
  
  const synthesis = generateSynthesis(
    patterns.length > 0 ? patterns : ['Customer feedback analysis'],
    { type: 'struggle', item: struggle }
  )
  
  return {
    inputs: { 
      signalTypes: relevantSignals.length > 0 
        ? relevantSignals 
        : ['reviews', 'support_forums'] // Default assumption for struggles
    },
    observedPatterns: patterns.length > 0 
      ? patterns 
      : ['Customer feedback and review analysis'],
    synthesis,
  }
}

