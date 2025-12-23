/**
 * Deterministic scoring for Jobs To Be Done (JTBD)
 * Computes completeness/quality score based on available fields
 * 
 * This is an "input quality" score - not evidence-backed yet.
 * Citations/tags will be added in a future PR.
 */

import type { JtbdItem } from '@/lib/schemas/jtbd'

export type JTBDScoreResult = {
  isSufficient: boolean
  score10?: number // only present if sufficient
  scoreLabel: 'High' | 'Medium' | 'Low' | 'Insufficient'
  reasons: {
    hasWho: boolean
    hasContext: boolean
    outcomesCount: number
    constraintsCount: number
    statementLength: number
    failedChecks: string[]
  }
}

/**
 * Rounds to 1 decimal place
 */
function roundTo1Decimal(value: number): number {
  return Math.round(value * 10) / 10
}

/**
 * Computes statement quality score based on length
 * - 0-39 chars: 0 points
 * - 40-79 chars: 1 point
 * - 80-119 chars: 2 points
 * - 120+ chars: 3 points
 */
function computeStatementQualityScore(length: number): number {
  if (length < 40) return 0
  if (length < 80) return 1
  if (length < 120) return 2
  return 3
}

/**
 * Computes completeness score for a JTBD item
 * 
 * Scoring breakdown:
 * - Outcomes present: 0-3 points (1 point per outcome, max 3)
 * - Constraints present: 0-2 points (1 point per constraint, max 2)
 * - Who/Context: 0-2 points (1 point each)
 * - Statement quality: 0-3 points (based on length)
 * 
 * Total: 0-10 points
 * 
 * Sufficient if:
 * - statement length >= 40 chars
 * - outcomesCount >= 1
 * - hasContext OR hasWho
 */
export function computeJTBDScore(jtbd: JtbdItem | null | undefined): JTBDScoreResult {
  // Handle null/undefined
  if (!jtbd) {
    return {
      isSufficient: false,
      scoreLabel: 'Insufficient',
      reasons: {
        hasWho: false,
        hasContext: false,
        outcomesCount: 0,
        constraintsCount: 0,
        statementLength: 0,
        failedChecks: ['No JTBD item provided'],
      },
    }
  }

  const statementLength = (jtbd.job_statement || '').length
  const hasWho = Boolean(jtbd.who && jtbd.who.trim().length > 0)
  const hasContext = Boolean(jtbd.context && jtbd.context.trim().length > 0)
  const outcomesCount = jtbd.desired_outcomes?.length || 0
  const constraintsCount = jtbd.constraints?.length || 0

  // Check sufficiency requirements
  const failedChecks: string[] = []

  if (statementLength < 40) {
    failedChecks.push(`Statement too short (${statementLength} chars, need 40+)`)
  }

  if (outcomesCount < 1) {
    failedChecks.push('Need at least 1 desired outcome')
  }

  if (!hasContext && !hasWho) {
    failedChecks.push('Need either context or who field')
  }

  const isSufficient = failedChecks.length === 0

  // Compute component scores
  // Outcomes: 0-3 points (1 point per outcome, max 3)
  const outcomesScore = Math.min(outcomesCount, 3)

  // Constraints: 0-2 points (1 point per constraint, max 2)
  const constraintsScore = Math.min(constraintsCount, 2)

  // Who/Context: 0-2 points (1 point each)
  const whoContextScore = (hasWho ? 1 : 0) + (hasContext ? 1 : 0)

  // Statement quality: 0-3 points (based on length)
  const statementScore = computeStatementQualityScore(statementLength)

  // Total score (0-10)
  const totalScore = outcomesScore + constraintsScore + whoContextScore + statementScore
  const score10 = roundTo1Decimal(totalScore)

  // Determine score label
  let scoreLabel: 'High' | 'Medium' | 'Low' | 'Insufficient'
  if (score10 >= 8) {
    scoreLabel = 'High'
  } else if (score10 >= 6) {
    scoreLabel = 'Medium'
  } else if (score10 >= 4) {
    scoreLabel = 'Low'
  } else {
    scoreLabel = 'Insufficient'
  }

  // If insufficient, override label and don't include score10
  if (!isSufficient) {
    return {
      isSufficient: false,
      scoreLabel: 'Insufficient',
      reasons: {
        hasWho,
        hasContext,
        outcomesCount,
        constraintsCount,
        statementLength,
        failedChecks,
      },
    }
  }

  return {
    isSufficient: true,
    score10,
    scoreLabel,
    reasons: {
      hasWho,
      hasContext,
      outcomesCount,
      constraintsCount,
      statementLength,
      failedChecks: [],
    },
  }
}

