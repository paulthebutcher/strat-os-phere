/**
 * Helpers to compute diffs between artifact runs
 * Compares latest run with previous run
 */

import type { JtbdArtifactContent, JtbdItem } from '@/lib/schemas/jtbd'
import type { OpportunitiesArtifactContent, OpportunityItem } from '@/lib/schemas/opportunities'
import type { ScoringMatrixArtifactContent, CompetitorScoreSummary } from '@/lib/schemas/scoring'
import type {
  NormalizedJtbdArtifact,
  NormalizedOpportunitiesV2Artifact,
  NormalizedScoringMatrixArtifact,
} from '@/lib/results/normalizeArtifacts'

export interface JtbdDiff {
  added: JtbdItem[]
  removed: JtbdItem[]
  rankChanges: Array<{
    job: JtbdItem
    oldRank: number
    newRank: number
  }>
}

export interface OpportunitiesDiff {
  added: OpportunityItem[]
  removed: OpportunityItem[]
  scoreChanges: Array<{
    opportunity: OpportunityItem
    oldScore: number
    newScore: number
    delta: number
  }>
}

export interface ScorecardDiff {
  scoreChanges: Array<{
    competitor: string
    oldScore: number
    newScore: number
    delta: number
  }>
}

export interface ContrastSummary {
  jtbd: JtbdDiff | null
  opportunities: OpportunitiesDiff | null
  scorecard: ScorecardDiff | null
  hasChanges: boolean
}

const SCORE_CHANGE_THRESHOLD = 10 // ±10 points considered meaningful

/**
 * Compute diff between two JTBD artifacts
 */
export function diffJtbd(
  latest: NormalizedJtbdArtifact | null,
  previous: NormalizedJtbdArtifact | null
): JtbdDiff | null {
  if (!latest?.content?.jobs || !previous?.content?.jobs) {
    return null
  }

  const latestJobs = [...latest.content.jobs].sort(
    (a, b) => b.opportunity_score - a.opportunity_score
  )
  const previousJobs = [...previous.content.jobs].sort(
    (a, b) => b.opportunity_score - a.opportunity_score
  )

  // Find added jobs (by job_statement matching)
  const added: JtbdItem[] = []
  for (const job of latestJobs) {
    const exists = previousJobs.some(
      (p) => p.job_statement === job.job_statement
    )
    if (!exists) {
      added.push(job)
    }
  }

  // Find removed jobs
  const removed: JtbdItem[] = []
  for (const job of previousJobs) {
    const exists = latestJobs.some(
      (l) => l.job_statement === job.job_statement
    )
    if (!exists) {
      removed.push(job)
    }
  }

  // Find rank changes (jobs that exist in both but changed position)
  const rankChanges: Array<{
    job: JtbdItem
    oldRank: number
    newRank: number
  }> = []

  for (let i = 0; i < latestJobs.length; i++) {
    const latestJob = latestJobs[i]
    const previousIndex = previousJobs.findIndex(
      (p) => p.job_statement === latestJob.job_statement
    )

    if (previousIndex !== -1 && previousIndex !== i) {
      rankChanges.push({
        job: latestJob,
        oldRank: previousIndex + 1,
        newRank: i + 1,
      })
    }
  }

  return {
    added,
    removed,
    rankChanges,
  }
}

/**
 * Compute diff between two Opportunities artifacts
 */
export function diffOpportunities(
  latest: NormalizedOpportunitiesV2Artifact | null,
  previous: NormalizedOpportunitiesV2Artifact | null
): OpportunitiesDiff | null {
  if (!latest?.content?.opportunities || !previous?.content?.opportunities) {
    return null
  }

  const latestOpps = [...latest.content.opportunities]
  const previousOpps = [...previous.content.opportunities]

  // Find added opportunities (by title matching)
  const added: OpportunityItem[] = []
  for (const opp of latestOpps) {
    const exists = previousOpps.some((p) => p.title === opp.title)
    if (!exists) {
      added.push(opp)
    }
  }

  // Find removed opportunities
  const removed: OpportunityItem[] = []
  for (const opp of previousOpps) {
    const exists = latestOpps.some((l) => l.title === opp.title)
    if (!exists) {
      removed.push(opp)
    }
  }

  // Find score changes above threshold
  const scoreChanges: Array<{
    opportunity: OpportunityItem
    oldScore: number
    newScore: number
    delta: number
  }> = []

  for (const latestOpp of latestOpps) {
    const previousOpp = previousOpps.find((p) => p.title === latestOpp.title)
    if (previousOpp) {
      const delta = latestOpp.score - previousOpp.score
      if (Math.abs(delta) >= SCORE_CHANGE_THRESHOLD) {
        scoreChanges.push({
          opportunity: latestOpp,
          oldScore: previousOpp.score,
          newScore: latestOpp.score,
          delta,
        })
      }
    }
  }

  return {
    added,
    removed,
    scoreChanges,
  }
}

/**
 * Compute diff between two Scorecard artifacts
 */
export function diffScorecard(
  latest: NormalizedScoringMatrixArtifact | null,
  previous: NormalizedScoringMatrixArtifact | null
): ScorecardDiff | null {
  if (!latest?.content?.summary || !previous?.content?.summary) {
    return null
  }

  const latestSummary = latest.content.summary
  const previousSummary = previous.content.summary

  const scoreChanges: Array<{
    competitor: string
    oldScore: number
    newScore: number
    delta: number
  }> = []

  for (const latestItem of latestSummary) {
    const previousItem = previousSummary.find(
      (p) => p.competitor_name === latestItem.competitor_name
    )
    if (previousItem) {
      const delta =
        latestItem.total_weighted_score - previousItem.total_weighted_score
      if (Math.abs(delta) >= SCORE_CHANGE_THRESHOLD) {
        scoreChanges.push({
          competitor: latestItem.competitor_name,
          oldScore: previousItem.total_weighted_score,
          newScore: latestItem.total_weighted_score,
          delta,
        })
      }
    }
  }

  return {
    scoreChanges,
  }
}

/**
 * Compute overall contrast summary between latest and previous runs
 */
export function computeContrastSummary(
  latest: {
    jtbd: NormalizedJtbdArtifact | null
    opportunities: NormalizedOpportunitiesV2Artifact | null
    scorecard: NormalizedScoringMatrixArtifact | null
  },
  previous: {
    jtbd: NormalizedJtbdArtifact | null
    opportunities: NormalizedOpportunitiesV2Artifact | null
    scorecard: NormalizedScoringMatrixArtifact | null
  }
): ContrastSummary {
  const jtbdDiff = diffJtbd(latest.jtbd, previous.jtbd)
  const opportunitiesDiff = diffOpportunities(
    latest.opportunities,
    previous.opportunities
  )
  const scorecardDiff = diffScorecard(latest.scorecard, previous.scorecard)

  const hasChanges =
    (jtbdDiff &&
      (jtbdDiff.added.length > 0 ||
        jtbdDiff.removed.length > 0 ||
        jtbdDiff.rankChanges.length > 0)) ||
    (opportunitiesDiff &&
      (opportunitiesDiff.added.length > 0 ||
        opportunitiesDiff.removed.length > 0 ||
        opportunitiesDiff.scoreChanges.length > 0)) ||
    (scorecardDiff && scorecardDiff.scoreChanges.length > 0)

  return {
    jtbd: jtbdDiff,
    opportunities: opportunitiesDiff,
    scorecard: scorecardDiff,
    hasChanges,
  }
}

/**
 * Count total changes for display
 */
export function countTotalChanges(summary: ContrastSummary): number {
  let count = 0

  if (summary.jtbd) {
    count += summary.jtbd.added.length
    count += summary.jtbd.removed.length
    count += summary.jtbd.rankChanges.length
  }

  if (summary.opportunities) {
    count += summary.opportunities.added.length
    count += summary.opportunities.removed.length
    count += summary.opportunities.scoreChanges.length
  }

  if (summary.scorecard) {
    count += summary.scorecard.scoreChanges.length
  }

  return count
}

