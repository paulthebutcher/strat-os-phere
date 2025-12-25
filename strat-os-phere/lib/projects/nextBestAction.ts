/**
 * Next Best Action resolver for project pages
 * 
 * Determines the single primary action a user should take next based on
 * project state (competitors, evidence coverage, artifacts).
 * 
 * This is a pure, deterministic function that never throws.
 */

import type { EvidenceCoverageLite } from '@/lib/evidence/coverageLite'
import { MIN_COMPETITORS } from '@/lib/evidence/coverageLite'

export interface NextBestAction {
  label: string
  href?: string
  onClickIntent?: 'generate'
  disabledReason?: string
}

export interface NextBestActionParams {
  projectId: string
  competitorCount: number
  coverage: EvidenceCoverageLite
  hasOpportunitiesArtifact: boolean
}

/**
 * Determine the next best action for a project
 * 
 * Rules (in priority order):
 * 1. If competitorCount < MIN_COMPETITORS:
 *    - label: "Add competitors"
 *    - href: `/projects/${projectId}/competitors`
 * 
 * 2. Else if !coverage.isEvidenceSufficient:
 *    - label: "Fetch more evidence"
 *    - href: `/projects/${projectId}/evidence`
 * 
 * 3. Else if coverage.isEvidenceSufficient && !hasOpportunitiesArtifact:
 *    - label: "Generate opportunities"
 *    - onClickIntent: 'generate'
 *    - Note: Caller should use GenerateAnalysisButton or link to overview page
 * 
 * 4. Else (hasOpportunitiesArtifact):
 *    - label: "View opportunities"
 *    - href: `/projects/${projectId}/opportunities`
 */
export function getNextBestAction({
  projectId,
  competitorCount,
  coverage,
  hasOpportunitiesArtifact,
}: NextBestActionParams): NextBestAction {
  // Rule 1: Need more competitors
  if (competitorCount < MIN_COMPETITORS) {
    return {
      label: 'Add competitors',
      href: `/projects/${projectId}/competitors`,
    }
  }

  // Rule 2: Need more evidence
  if (!coverage.isEvidenceSufficient) {
    return {
      label: 'Fetch more evidence',
      href: `/projects/${projectId}/evidence`,
    }
  }

  // Rule 3: Ready to generate
  if (coverage.isEvidenceSufficient && !hasOpportunitiesArtifact) {
    // Use onClickIntent for generation - caller should handle with GenerateAnalysisButton
    // Or fallback to opportunities page where generation can be triggered
    return {
      label: 'Generate opportunities',
      onClickIntent: 'generate',
      // Fallback href to opportunities page where generation can be triggered
      // Callers should prefer using GenerateAnalysisButton with onClickIntent
      href: `/projects/${projectId}/opportunities`,
    }
  }

  // Rule 4: Opportunities exist - view them
  return {
    label: 'View opportunities',
    href: `/projects/${projectId}/opportunities`,
  }
}

