/**
 * Generate one smart follow-up question based on evidence gaps/conflicts
 * Deterministic heuristic - no LLM required
 */

import type { NormalizedEvidenceBundle } from '@/lib/evidence/types'
import type { ClaimsBundle } from '@/lib/claims/types'
import type { FollowUpQuestion } from './types'

/**
 * Generate at most ONE follow-up question based on evidence analysis
 */
export function generateFollowUpQuestion(
  evidenceBundle: NormalizedEvidenceBundle | null,
  claimsBundle: ClaimsBundle | null
): FollowUpQuestion | null {
  if (!evidenceBundle && !claimsBundle) {
    return null
  }

  const gaps: string[] = []
  const conflicts: string[] = []
  const lowConfidenceAreas: string[] = []

  // Analyze evidence bundle for gaps
  if (evidenceBundle) {
    const itemsByType = new Map<string, number>()
    for (const item of evidenceBundle.items) {
      const type = item.type || 'other'
      itemsByType.set(type, (itemsByType.get(type) || 0) + 1)
    }

    // Check for missing evidence types
    const importantTypes = ['pricing', 'reviews', 'docs', 'jobs', 'changelog']
    for (const type of importantTypes) {
      if (!itemsByType.has(type) || itemsByType.get(type)! === 0) {
        gaps.push(`No ${type} evidence found`)
      }
    }

    // Check for low evidence count
    const totalItems = evidenceBundle.items.length
    if (totalItems < 10) {
      gaps.push('Limited evidence collected (less than 10 sources)')
    }
  }

  // Analyze claims for conflicts and low confidence
  if (claimsBundle) {
    // Count support levels
    const supportCounts = { strong: 0, medium: 0, weak: 0 }
    for (const claim of claimsBundle.claims) {
      supportCounts[claim.support]++
    }

    // If many weak claims, flag as low confidence
    if (supportCounts.weak > supportCounts.strong + supportCounts.medium) {
      lowConfidenceAreas.push('Many claims have weak support')
    }

    // Check for conflicting claims (same category, different statements)
    const claimsByCategory = new Map<string, typeof claimsBundle.claims>()
    for (const claim of claimsBundle.claims) {
      if (!claimsByCategory.has(claim.category)) {
        claimsByCategory.set(claim.category, [])
      }
      claimsByCategory.get(claim.category)!.push(claim)
    }

    // Look for pricing conflicts (e.g., "contact sales" vs "public pricing")
    const pricingClaims = claimsByCategory.get('pricing') || []
    const hasContactSales = pricingClaims.some(c => 
      c.statement.toLowerCase().includes('contact sales') ||
      c.statement.toLowerCase().includes('enterprise')
    )
    const hasPublicPricing = pricingClaims.some(c =>
      c.statement.toLowerCase().includes('$') ||
      c.statement.toLowerCase().includes('per month') ||
      c.statement.toLowerCase().includes('starting at')
    )

    if (hasContactSales && hasPublicPricing) {
      conflicts.push('Pricing evidence suggests both enterprise-only and public pricing')
    }
  }

  // Prioritize: conflicts > gaps > low confidence
  if (conflicts.length > 0) {
    // Ask about the top conflict
    const topConflict = conflicts[0]
    
    if (topConflict.includes('pricing')) {
      return {
        schema_version: 1,
        generatedAt: new Date().toISOString(),
        question: 'Is price transparency a deal-breaker for your target users?',
        rationale: 'Evidence suggests both enterprise-only and public pricing models. Understanding price sensitivity will help prioritize opportunities.',
        inputType: 'single_select',
        options: [
          'Yes, price transparency is critical',
          'No, users are willing to contact sales',
          'Depends on the use case',
        ],
        derivedFrom: { conflicts: [topConflict] },
      }
    }
  }

  if (gaps.length > 0) {
    // Ask about the most important gap
    const topGap = gaps[0]
    
    if (topGap.includes('pricing')) {
      return {
        schema_version: 1,
        generatedAt: new Date().toISOString(),
        question: 'Is pricing information important for your analysis?',
        rationale: 'No pricing evidence was found. This may affect opportunity prioritization.',
        inputType: 'single_select',
        options: [
          'Yes, pricing is a key factor',
          'No, pricing is not relevant',
        ],
        derivedFrom: { gaps: [topGap] },
      }
    }
    
    if (topGap.includes('reviews')) {
      return {
        schema_version: 1,
        generatedAt: new Date().toISOString(),
        question: 'Is user feedback and review sentiment important for your analysis?',
        rationale: 'No review evidence was found. User sentiment can reveal pain points and opportunities.',
        inputType: 'single_select',
        options: [
          'Yes, user feedback is critical',
          'No, reviews are not relevant',
        ],
        derivedFrom: { gaps: [topGap] },
      }
    }
    
    if (topGap.includes('Limited evidence')) {
      return {
        schema_version: 1,
        generatedAt: new Date().toISOString(),
        question: 'Would collecting more evidence improve your analysis?',
        rationale: 'Limited evidence was collected. More sources could strengthen opportunity recommendations.',
        inputType: 'single_select',
        options: [
          'Yes, collect more evidence',
          'No, current evidence is sufficient',
        ],
        derivedFrom: { gaps: [topGap] },
      }
    }
  }

  if (lowConfidenceAreas.length > 0) {
    const topLowConfidence = lowConfidenceAreas[0]
    
    if (topLowConfidence.includes('weak support')) {
      return {
        schema_version: 1,
        generatedAt: new Date().toISOString(),
        question: 'Is time-to-value a top priority vs depth of capability?',
        rationale: 'Many claims have weak support. Understanding your priorities will help focus the analysis.',
        inputType: 'single_select',
        options: [
          'Time-to-value is more important',
          'Depth of capability is more important',
          'Both are equally important',
        ],
        derivedFrom: { lowConfidenceAreas: [topLowConfidence] },
      }
    }
  }

  // No question needed if evidence is strong
  return null
}

