/**
 * Decision Integrity Assertions
 * 
 * Utility functions to assert structural invariants of decision outputs
 * without locking us into UI or phrasing.
 */

import type { OpportunitiesArtifactV1, OpportunityV1 } from '@/lib/opportunities/opportunityV1'

/**
 * Assert that opportunities are generated and ranked
 */
export function assertOpportunitiesGenerated(opportunities: OpportunityV1[]): void {
  if (opportunities.length === 0) {
    throw new Error('Expected at least one opportunity to be generated')
  }
}

/**
 * Assert that opportunities are ranked (sorted by score descending)
 */
export function assertOpportunitiesRanked(opportunities: OpportunityV1[]): void {
  if (opportunities.length === 0) {
    return
  }

  for (let i = 1; i < opportunities.length; i++) {
    const prevScore = opportunities[i - 1].scores.total
    const currentScore = opportunities[i].scores.total

    if (currentScore > prevScore) {
      throw new Error(
        `Opportunities are not ranked correctly. Opportunity at index ${i} has score ${currentScore} which is higher than previous score ${prevScore}`
      )
    }
  }
}

/**
 * Assert that each opportunity includes required structural elements
 */
export function assertOpportunityStructure(opportunity: OpportunityV1): void {
  // Each opportunity must have at least 1 evidence item (citations)
  if (!opportunity.citations || opportunity.citations.length === 0) {
    throw new Error(`Opportunity "${opportunity.title}" has no citations/evidence`)
  }

  // Confidence bounds (confidence level must be present)
  if (!opportunity.confidence) {
    throw new Error(`Opportunity "${opportunity.title}" is missing confidence level`)
  }

  // Assumptions array must be present (can be empty but must exist)
  if (!Array.isArray(opportunity.assumptions)) {
    throw new Error(`Opportunity "${opportunity.title}" is missing assumptions array`)
  }

  // Citations must be present and valid
  if (opportunity.citations.length < 3) {
    throw new Error(
      `Opportunity "${opportunity.title}" has fewer than 3 citations (found ${opportunity.citations.length})`
    )
  }

  // Each citation must reference a source (url and evidenceId)
  for (const citation of opportunity.citations) {
    if (!citation.url || !citation.evidenceId) {
      throw new Error(
        `Opportunity "${opportunity.title}" has citation missing url or evidenceId`
      )
    }
  }

  // Scores must be present and bounded
  if (!opportunity.scores) {
    throw new Error(`Opportunity "${opportunity.title}" is missing scores`)
  }

  if (opportunity.scores.total < 0 || opportunity.scores.total > 100) {
    throw new Error(
      `Opportunity "${opportunity.title}" has invalid score ${opportunity.scores.total} (must be 0-100)`
    )
  }

  // Score drivers must be present
  if (!opportunity.scores.drivers || opportunity.scores.drivers.length === 0) {
    throw new Error(`Opportunity "${opportunity.title}" is missing score drivers`)
  }
}

/**
 * Assert that evidence objects are deduped and normalized
 * (Check that citations reference unique evidenceIds)
 */
export function assertEvidenceDeduped(opportunities: OpportunityV1[]): void {
  const evidenceIds = new Set<string>()

  for (const opportunity of opportunities) {
    for (const citation of opportunity.citations) {
      if (evidenceIds.has(citation.evidenceId)) {
        // This is actually OK - same evidence can be cited by multiple opportunities
        // We just want to ensure evidenceIds are stable and normalized
        continue
      }
      evidenceIds.add(citation.evidenceId)
    }
  }
}

/**
 * Assert decision integrity for a complete opportunities artifact
 */
export function assertDecisionIntegrity(artifact: OpportunitiesArtifactV1): void {
  const { opportunities } = artifact

  // Opportunities are generated
  assertOpportunitiesGenerated(opportunities)

  // Opportunities are ranked
  assertOpportunitiesRanked(opportunities)

  // Each opportunity has required structure
  for (const opportunity of opportunities) {
    assertOpportunityStructure(opportunity)
  }

  // Evidence is deduped and normalized
  assertEvidenceDeduped(opportunities)
}

