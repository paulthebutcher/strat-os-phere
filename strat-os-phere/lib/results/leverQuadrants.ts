/**
 * Decision Lever quadrant logic
 * 
 * Derives "Decision Sensitivity" (Y-axis) and assigns quadrants based on
 * Confidence (X-axis) and Decision Sensitivity (Y-axis).
 */

import type { Assumption, AssumptionCategory } from './assumptions'

export type LeverQuadrant = 'mustProveNow' | 'watchClosely' | 'safeToProceed' | 'ignoreForNow'

export interface LeverQuadrantCounts {
  mustProveNow: number
  watchClosely: number
  safeToProceed: number
  ignoreForNow: number
}

/**
 * Derive Decision Sensitivity (1-5) from assumption data
 * 
 * V1 heuristic based on existing fields:
 * - Start with impact if present (1-5)
 * - Boost if category is Market or Demand (actually "Market")
 * - Boost if associated with top opportunity (if relation exists)
 * - Default to mid if missing
 */
export function deriveDecisionSensitivity(lever: Assumption): number {
  const baseImpact = lever.impact ?? 3
  const isMarketOrDemand = lever.category === 'Market' || lever.category === 'Buyer'
  const isTopOpportunityLinked = lever.relatedOpportunityIds.length > 0
  
  let sensitivity = baseImpact
  if (isMarketOrDemand) sensitivity += 1
  if (isTopOpportunityLinked) sensitivity += 1
  
  // Clamp to 1-5 range
  return Math.max(1, Math.min(5, sensitivity))
}

/**
 * Get confidence index (0-2 for Low, Medium, High)
 */
function getConfidenceIndex(confidence: Assumption['confidence']): number {
  return confidence === 'High' ? 2 : confidence === 'Medium' ? 1 : 0
}

/**
 * Determine quadrant for a lever
 */
export function getLeverQuadrant(lever: Assumption): LeverQuadrant {
  const confidenceIdx = getConfidenceIndex(lever.confidence)
  const sensitivity = deriveDecisionSensitivity(lever)
  
  // Decision Sensitivity thresholds: low (1-2), med (3), high (4-5)
  // Confidence thresholds: low (0), med (1), high (2)
  
  const isLowConfidence = confidenceIdx <= 0
  const isMedConfidence = confidenceIdx === 1
  const isHighConfidence = confidenceIdx >= 2
  const isLowSensitivity = sensitivity <= 2
  const isMedSensitivity = sensitivity === 3
  const isHighSensitivity = sensitivity >= 4
  
  // Must Prove Now: low confidence, high sensitivity
  if (isLowConfidence && isHighSensitivity) {
    return 'mustProveNow'
  }
  
  // Safe to Proceed: high confidence, low sensitivity
  if (isHighConfidence && isLowSensitivity) {
    return 'safeToProceed'
  }
  
  // Ignore for Now: low sensitivity (regardless of confidence)
  if (isLowSensitivity) {
    return 'ignoreForNow'
  }
  
  // Watch Closely: everything else (medium confidence + medium sensitivity, or other combinations)
  return 'watchClosely'
}

/**
 * Get quadrant label for display
 */
export function getQuadrantLabel(quadrant: LeverQuadrant): string {
  switch (quadrant) {
    case 'mustProveNow':
      return 'Must Prove Now'
    case 'watchClosely':
      return 'Watch Closely'
    case 'safeToProceed':
      return 'Safe to Proceed'
    case 'ignoreForNow':
      return 'Ignore for Now'
  }
}

/**
 * Compute quadrant counts for all levers
 */
export function computeQuadrantCounts(levers: Assumption[]): LeverQuadrantCounts {
  const counts: LeverQuadrantCounts = {
    mustProveNow: 0,
    watchClosely: 0,
    safeToProceed: 0,
    ignoreForNow: 0,
  }
  
  levers.forEach(lever => {
    const quadrant = getLeverQuadrant(lever)
    counts[quadrant]++
  })
  
  return counts
}

/**
 * Get action priority order for sorting
 * Lower number = higher priority
 */
export function getActionPriority(quadrant: LeverQuadrant): number {
  switch (quadrant) {
    case 'mustProveNow':
      return 1
    case 'watchClosely':
      return 2
    case 'safeToProceed':
      return 3
    case 'ignoreForNow':
      return 4
  }
}

