/**
 * UX helper functions for Opportunities display
 * These functions safely extract and derive UI data from opportunity objects
 * without requiring schema changes or database migrations.
 */

import type { OpportunityV3Item } from '@/lib/schemas/opportunityV3'
import type { OpportunityItem } from '@/lib/schemas/opportunities'

type Opportunity = OpportunityV3Item | OpportunityItem

/**
 * Extract numeric score from an opportunity object
 * Tries multiple field names to support different schema versions
 */
export function getOpportunityScore(opportunity: Opportunity | null | undefined): number | null {
  if (!opportunity || typeof opportunity !== 'object') {
    return null
  }

  // Try V3 scoring.total
  if ('scoring' in opportunity && typeof opportunity.scoring === 'object' && opportunity.scoring !== null) {
    const scoring = opportunity.scoring as { total?: number }
    if (typeof scoring.total === 'number') {
      return scoring.total
    }
  }

  // Try direct score field (V2)
  if ('score' in opportunity && typeof opportunity.score === 'number') {
    return opportunity.score
  }

  // Try opportunity_score
  if ('opportunity_score' in opportunity && typeof opportunity.opportunity_score === 'number') {
    return opportunity.opportunity_score
  }

  // Try total_score
  if ('total_score' in opportunity && typeof opportunity.total_score === 'number') {
    return opportunity.total_score
  }

  return null
}

/**
 * Signal extracted from citations/evidence for "Why now" display
 */
export interface WhyNowSignal {
  label: string
  kind: 'product_movement' | 'pricing_friction' | 'user_complaints' | 'hiring_signal' | 'reliability_signal' | 'generic'
  citations?: Array<{
    title?: string | null
    hostname?: string | null
    url: string
  }>
}

/**
 * Extract "Why now" signals from opportunity citations and evidence
 * Uses explicit fields if present, otherwise infers from citation URLs
 */
export function getWhyNowSignals(opportunity: Opportunity | null | undefined): WhyNowSignal[] {
  const signals: WhyNowSignal[] = []

  if (!opportunity || typeof opportunity !== 'object') {
    return [
      {
        label: 'Timing signal: inferred from available sources',
        kind: 'generic',
      },
    ]
  }

  // Priority 1: Use explicit live-signal fields if present
  if ('citations' in opportunity && Array.isArray(opportunity.citations)) {
    const citations = opportunity.citations as Array<{
      url?: string
      source_type?: string
      title?: string | null
      domain?: string | null
      source_date_range?: string | null
    }>

    // Group citations by inferred signal type
    const signalMap = new Map<string, WhyNowSignal>()

    for (const citation of citations) {
      if (!citation.url) continue

      const url = citation.url.toLowerCase()
      let kind: WhyNowSignal['kind'] = 'generic'
      let label = 'Timing signal'

      // Infer signal type from URL patterns
      if (url.includes('changelog') || url.includes('release') || url.includes('updates')) {
        kind = 'product_movement'
        label = 'Recent product movement'
      } else if (url.includes('pricing')) {
        kind = 'pricing_friction'
        label = 'Pricing friction signal'
      } else if (url.includes('reviews') || url.includes('g2') || url.includes('capterra') || url.includes('trustpilot')) {
        kind = 'user_complaints'
        label = 'User complaints signal'
      } else if (url.includes('jobs') || url.includes('careers') || url.includes('greenhouse') || url.includes('lever')) {
        kind = 'hiring_signal'
        label = 'Hiring signal'
      } else if (url.includes('status')) {
        kind = 'reliability_signal'
        label = 'Reliability signal'
      }

      // Use source_type if available
      if (citation.source_type) {
        const sourceType = citation.source_type.toLowerCase()
        if (sourceType === 'changelog') {
          kind = 'product_movement'
          label = 'Recent product movement'
        } else if (sourceType === 'pricing') {
          kind = 'pricing_friction'
          label = 'Pricing friction signal'
        } else if (sourceType === 'reviews') {
          kind = 'user_complaints'
          label = 'User complaints signal'
        } else if (sourceType === 'jobs') {
          kind = 'hiring_signal'
          label = 'Hiring signal'
        } else if (sourceType === 'status') {
          kind = 'reliability_signal'
          label = 'Reliability signal'
        }
      }

      const key = `${kind}:${label}`
      if (!signalMap.has(key)) {
        signalMap.set(key, {
          label,
          kind,
          citations: [],
        })
      }

      const signal = signalMap.get(key)!
      signal.citations!.push({
        title: citation.title || null,
        hostname: citation.domain || null,
        url: citation.url,
      })
    }

    // Convert map to array, limit citations per signal to 3
    for (const signal of signalMap.values()) {
      if (signal.citations) {
        signal.citations = signal.citations.slice(0, 3)
      }
      signals.push(signal)
    }
  }

  // Priority 2: Check proof_points for citations (V3)
  if ('proof_points' in opportunity && Array.isArray(opportunity.proof_points)) {
    const proofPoints = opportunity.proof_points as Array<{
      citations?: Array<{
        url?: string
        source_type?: string
        title?: string | null
        domain?: string | null
      }>
    }>

    for (const proofPoint of proofPoints) {
      if (!proofPoint.citations || proofPoint.citations.length === 0) continue

      for (const citation of proofPoint.citations) {
        if (!citation.url) continue

        const url = citation.url.toLowerCase()
        let kind: WhyNowSignal['kind'] = 'generic'
        let label = 'Timing signal'

        if (url.includes('changelog') || url.includes('release') || url.includes('updates')) {
          kind = 'product_movement'
          label = 'Recent product movement'
        } else if (url.includes('pricing')) {
          kind = 'pricing_friction'
          label = 'Pricing friction signal'
        } else if (url.includes('reviews') || url.includes('g2') || url.includes('capterra') || url.includes('trustpilot')) {
          kind = 'user_complaints'
          label = 'User complaints signal'
        } else if (url.includes('jobs') || url.includes('careers') || url.includes('greenhouse') || url.includes('lever')) {
          kind = 'hiring_signal'
          label = 'Hiring signal'
        } else if (url.includes('status')) {
          kind = 'reliability_signal'
          label = 'Reliability signal'
        }

        if (citation.source_type) {
          const sourceType = citation.source_type.toLowerCase()
          if (sourceType === 'changelog') {
            kind = 'product_movement'
            label = 'Recent product movement'
          } else if (sourceType === 'pricing') {
            kind = 'pricing_friction'
            label = 'Pricing friction signal'
          } else if (sourceType === 'reviews') {
            kind = 'user_complaints'
            label = 'User complaints signal'
          } else if (sourceType === 'jobs') {
            kind = 'hiring_signal'
            label = 'Hiring signal'
          } else if (sourceType === 'status') {
            kind = 'reliability_signal'
            label = 'Reliability signal'
          }
        }

        // Check if we already have this signal
        const existingSignal = signals.find((s) => s.kind === kind && s.label === label)
        if (existingSignal) {
          if (!existingSignal.citations) {
            existingSignal.citations = []
          }
          // Only add if not already present
          const exists = existingSignal.citations.some((c) => c.url === citation.url)
          if (!exists && existingSignal.citations.length < 3) {
            existingSignal.citations.push({
              title: citation.title || null,
              hostname: citation.domain || null,
              url: citation.url,
            })
          }
        } else {
          signals.push({
            label,
            kind,
            citations: [
              {
                title: citation.title || null,
                hostname: citation.domain || null,
                url: citation.url,
              },
            ],
          })
        }
      }
    }
  }

  // Priority 3: If no signals found, return a generic one
  if (signals.length === 0) {
    return [
      {
        label: 'Timing signal: inferred from available sources',
        kind: 'generic',
      },
    ]
  }

  // Limit to 4 signals max
  return signals.slice(0, 4)
}

/**
 * Decision frame data extracted from opportunity
 */
export interface DecisionFrame {
  noTo: string[]
  capability: string
  defensibility: string
  isDerived: boolean
}

/**
 * Extract decision frame (tradeoffs, capability, defensibility) from opportunity
 * Uses explicit fields if present, otherwise derives heuristically
 */
export function getDecisionFrame(opportunity: Opportunity | null | undefined): DecisionFrame {
  if (!opportunity || typeof opportunity !== 'object') {
    return {
      noTo: ['Deprioritize features that don\'t directly address this opportunity'],
      capability: 'Product development and engineering capabilities',
      defensibility: 'First-mover advantage and customer relationships create defensibility',
      isDerived: true,
    }
  }

  // Priority 1: Use explicit tradeoffs field (V3)
  if ('tradeoffs' in opportunity && typeof opportunity.tradeoffs === 'object' && opportunity.tradeoffs !== null) {
    const tradeoffs = opportunity.tradeoffs as {
      what_we_say_no_to?: string[]
      capability_forced?: string[]
      why_competitors_wont_follow?: string[]
    }

    const noTo = Array.isArray(tradeoffs.what_we_say_no_to) ? tradeoffs.what_we_say_no_to : []
    const capabilities = Array.isArray(tradeoffs.capability_forced) ? tradeoffs.capability_forced : []
    const defensibilityReasons = Array.isArray(tradeoffs.why_competitors_wont_follow)
      ? tradeoffs.why_competitors_wont_follow
      : []

    return {
      noTo: noTo.length > 0 ? noTo : deriveNoTo(opportunity),
      capability: capabilities.length > 0 ? capabilities.join(', ') : deriveCapability(opportunity),
      defensibility: defensibilityReasons.length > 0 ? defensibilityReasons.join(' ') : deriveDefensibility(opportunity),
      isDerived: noTo.length === 0 || capabilities.length === 0 || defensibilityReasons.length === 0,
    }
  }

  // Priority 2: Check for individual fields
  const noTo: string[] = []
  let capability = ''
  let defensibility = ''

  // Check for "no_to", "tradeoffs", etc.
  if ('no_to' in opportunity && Array.isArray(opportunity.no_to)) {
    noTo.push(...opportunity.no_to)
  }
  if ('required_capabilities' in opportunity && Array.isArray(opportunity.required_capabilities)) {
    capability = opportunity.required_capabilities.join(', ')
  }
  if ('defensibility' in opportunity && typeof opportunity.defensibility === 'string') {
    defensibility = opportunity.defensibility
  }
  if ('moat' in opportunity && typeof opportunity.moat === 'string') {
    defensibility = opportunity.moat
  }
  if ('hard_to_copy' in opportunity && typeof opportunity.hard_to_copy === 'string') {
    defensibility = opportunity.hard_to_copy
  }

  // V2 specific fields
  if ('why_they_cant_easily_copy' in opportunity && typeof opportunity.why_they_cant_easily_copy === 'string') {
    defensibility = opportunity.why_they_cant_easily_copy
  }

  // If we found some fields, use them; otherwise derive
  return {
    noTo: noTo.length > 0 ? noTo : deriveNoTo(opportunity),
    capability: capability || deriveCapability(opportunity),
    defensibility: defensibility || deriveDefensibility(opportunity),
    isDerived: noTo.length === 0 && !capability && !defensibility,
  }
}

/**
 * Derive "what we say no to" from opportunity content
 */
function deriveNoTo(opportunity: Opportunity): string[] {
  const noTo: string[] = []
  const title = ('title' in opportunity ? opportunity.title : '').toLowerCase()
  const description = ('one_liner' in opportunity ? opportunity.one_liner : '').toLowerCase()
  const problem = ('problem_today' in opportunity ? opportunity.problem_today : '').toLowerCase()
  const text = `${title} ${description} ${problem}`

  // Generic deprioritizations based on opportunity type
  if (text.includes('ux') || text.includes('interface') || text.includes('design')) {
    noTo.push('Deprioritize incremental UX polish on existing flows')
  }
  if (text.includes('integration') || text.includes('api')) {
    noTo.push('Deprioritize standalone feature development without ecosystem connections')
  }
  if (text.includes('enterprise') || text.includes('compliance')) {
    noTo.push('Deprioritize consumer-focused features that don\'t scale to enterprise needs')
  }

  // Default if nothing matched
  if (noTo.length === 0) {
    noTo.push('Deprioritize features that don\'t directly address this opportunity')
    noTo.push('Deprioritize incremental improvements that don\'t create meaningful differentiation')
  }

  return noTo.slice(0, 2)
}

/**
 * Derive capability requirement from opportunity content
 */
function deriveCapability(opportunity: Opportunity): string {
  const title = ('title' in opportunity ? opportunity.title : '').toLowerCase()
  const description = ('one_liner' in opportunity ? opportunity.one_liner : '').toLowerCase()
  const problem = ('problem_today' in opportunity ? opportunity.problem_today : '').toLowerCase()
  const proposed = ('proposed_move' in opportunity ? opportunity.proposed_move : '').toLowerCase()
  const text = `${title} ${description} ${problem} ${proposed}`

  // Capability archetypes
  if (text.includes('data') || text.includes('analytics') || text.includes('ml') || text.includes('ai') || text.includes('machine learning')) {
    return 'Data/ML infrastructure and modeling capabilities'
  }
  if (text.includes('workflow') || text.includes('automation') || text.includes('process')) {
    return 'Workflow automation and orchestration capabilities'
  }
  if (text.includes('integration') || text.includes('api') || text.includes('connect')) {
    return 'Integration platform and API capabilities'
  }
  if (text.includes('enterprise') || text.includes('governance') || text.includes('compliance')) {
    return 'Enterprise governance and compliance capabilities'
  }
  if (text.includes('research') || text.includes('user') || text.includes('customer')) {
    return 'Research operations and customer insight capabilities'
  }
  if (text.includes('performance') || text.includes('scale') || text.includes('reliability')) {
    return 'Performance and reliability engineering capabilities'
  }

  return 'Product development and engineering capabilities'
}

/**
 * Derive defensibility from opportunity content
 */
function deriveDefensibility(opportunity: Opportunity): string {
  const title = ('title' in opportunity ? opportunity.title : '').toLowerCase()
  const description = ('one_liner' in opportunity ? opportunity.one_liner : '').toLowerCase()
  const problem = ('problem_today' in opportunity ? opportunity.problem_today : '').toLowerCase()
  const text = `${title} ${description} ${problem}`

  // Defensibility archetypes
  if (text.includes('data') || text.includes('network') || text.includes('user')) {
    return 'Data advantage and network effects create switching costs'
  }
  if (text.includes('workflow') || text.includes('process') || text.includes('integration')) {
    return 'Deep workflow integration creates switching costs and operating model lock-in'
  }
  if (text.includes('enterprise') || text.includes('compliance')) {
    return 'Enterprise compliance requirements and procurement processes create barriers'
  }
  if (text.includes('specialized') || text.includes('niche') || text.includes('vertical')) {
    return 'Specialized domain knowledge and vertical-specific features create moat'
  }

  return 'First-mover advantage and customer relationships create defensibility'
}

