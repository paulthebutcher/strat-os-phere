/**
 * Canonical DecisionRun State Derivation
 * 
 * This module provides a single source of truth for the state of an analysis run.
 * It derives deterministic state from existing tables/data without requiring schema changes.
 * 
 * This is the "spine" that all UI components should use for:
 * - Navigation decisions
 * - Empty state logic
 * - Status indicators
 * - Routing
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { getLatestRunForProject } from '@/lib/data/runs'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { listArtifacts } from '@/lib/data/artifacts'
import { readLatestEvidenceBundle } from '@/lib/evidence/readBundle'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeResults'
import { computeEvidenceCoverageLite } from '@/lib/evidence/coverageLite'
import { MIN_EVIDENCE_COVERAGE, MIN_COMPETITORS_COVERED } from './constants'

export type DecisionRunState = {
  projectId: string
  runId: string | null

  runStatus: "none" | "running" | "complete" | "failed"
  evidenceStatus: "not_started" | "collecting" | "partial" | "complete"
  opportunitiesStatus: "none" | "generated"

  primaryRoute: "competitors" | "opportunities"
  primaryCta?: "run_evidence" | "generate_analysis" | "view_results"

  summary: {
    competitorsCount: number
    evidenceCount: number
    opportunitiesCount: number
  }
}

/**
 * Normalize undefined to null for consistent state handling
 * 
 * This helper ensures that all bundle/run objects passed to hooks are normalized
 * to prevent undefined/null drift that causes TypeScript errors.
 * 
 * Use this for any value that might be undefined but should be null in state.
 */
export function normalizeValue<T>(value: T | undefined | null): T | null {
  return value === undefined ? null : value
}

/**
 * Derive run status from run data
 */
function deriveRunStatus(
  run: { status: string; completed_at: string | null; finished_at: string | null } | null
): "none" | "running" | "complete" | "failed" {
  if (!run) {
    return "none"
  }

  // Check for failed status
  if (run.status === "failed") {
    return "failed"
  }

  // Check for completion (either completed_at or finished_at present, or status is complete/succeeded)
  const isComplete =
    run.completed_at !== null ||
    run.finished_at !== null ||
    run.status === "complete" ||
    run.status === "succeeded"

  if (isComplete) {
    return "complete"
  }

  // If run exists and not complete, it's running
  return "running"
}

/**
 * Derive evidence status from evidence data and run status
 */
function deriveEvidenceStatus(
  evidenceCount: number,
  runStatus: "none" | "running" | "complete" | "failed",
  coverageLite: { competitorIdsWithEvidence: string[] }
): "not_started" | "collecting" | "partial" | "complete" {
  // Not started: no evidence AND no run
  if (evidenceCount === 0 && runStatus === "none") {
    return "not_started"
  }

  // Collecting: run is running but no evidence yet
  if (runStatus === "running" && evidenceCount === 0) {
    return "collecting"
  }

  // Complete: sufficient evidence coverage
  const hasMinimumCoverage = evidenceCount >= MIN_EVIDENCE_COVERAGE
  const hasCompetitorCoverage = coverageLite.competitorIdsWithEvidence.length >= MIN_COMPETITORS_COVERED

  if (hasMinimumCoverage && hasCompetitorCoverage) {
    return "complete"
  }

  // Partial: some evidence but not complete
  if (evidenceCount > 0) {
    return "partial"
  }

  // Fallback to not_started
  return "not_started"
}

/**
 * Derive opportunities status from artifacts
 */
function deriveOpportunitiesStatus(opportunitiesCount: number): "none" | "generated" {
  return opportunitiesCount > 0 ? "generated" : "none"
}

/**
 * Derive primary route based on opportunities and run status
 */
function derivePrimaryRoute(
  opportunitiesStatus: "none" | "generated",
  runStatus: "none" | "running" | "complete" | "failed"
): "competitors" | "opportunities" {
  // If opportunities are generated OR run is complete, show opportunities
  if (opportunitiesStatus === "generated" || runStatus === "complete") {
    return "opportunities"
  }

  // Otherwise, show competitors
  return "competitors"
}

/**
 * Derive primary CTA based on state
 */
function derivePrimaryCta(
  runStatus: "none" | "running" | "complete" | "failed",
  evidenceStatus: "not_started" | "collecting" | "partial" | "complete",
  opportunitiesStatus: "none" | "generated",
  competitorCount: number
): "run_evidence" | "generate_analysis" | "view_results" | undefined {
  // If opportunities exist, show view_results
  if (opportunitiesStatus === "generated") {
    return "view_results"
  }

  // If run is complete but no opportunities, something went wrong - still show view_results
  if (runStatus === "complete") {
    return "view_results"
  }

  // If run is running, no CTA (waiting)
  if (runStatus === "running") {
    return undefined
  }

  // If evidence is not started or partial, suggest running evidence
  if (evidenceStatus === "not_started" || evidenceStatus === "partial") {
    return "run_evidence"
  }

  // If evidence is complete or collecting, suggest generating analysis
  if (evidenceStatus === "complete" || evidenceStatus === "collecting") {
    // But only if we have enough competitors
    if (competitorCount >= 3) {
      return "generate_analysis"
    }
  }

  return undefined
}

/**
 * Get the canonical DecisionRun state for a project
 * 
 * This is the single source of truth for run state. All UI components should
 * use this instead of directly querying runs/evidence/opportunities.
 */
export async function getDecisionRunState(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<DecisionRunState> {
  // Fetch all required data in parallel
  const [run, competitors, artifacts, evidenceBundle, coverageLite] = await Promise.all([
    getLatestRunForProject(supabase, projectId).catch(() => null),
    listCompetitorsForProject(supabase, projectId).catch(() => []),
    listArtifacts(supabase, { projectId }).catch(() => []),
    readLatestEvidenceBundle(supabase, projectId).catch(() => null),
    computeEvidenceCoverageLite(supabase, projectId).catch(() => ({
      competitorIdsWithEvidence: [],
      evidenceTypesPresent: [],
      isEvidenceSufficient: false,
      reasonsMissing: [],
    })),
  ])

  // Normalize run data (handle undefined)
  const normalizedRun = normalizeValue(run)

  // Derive run status (adapt run type to match expected interface)
  const runForStatus = normalizedRun
    ? {
        status: normalizedRun.status,
        completed_at: normalizedRun.completed_at ?? null,
        finished_at: ('finished_at' in normalizedRun && typeof normalizedRun.finished_at === 'string' ? normalizedRun.finished_at : null),
      }
    : null
  const runStatus = deriveRunStatus(runForStatus)

  // Count evidence items
  const evidenceCount = evidenceBundle?.items?.length ?? 0

  // Derive evidence status
  const evidenceStatus = deriveEvidenceStatus(evidenceCount, runStatus, coverageLite)

  // Normalize artifacts and count opportunities
  const normalized = normalizeResultsArtifacts(artifacts, projectId)
  const opportunities = normalized.opportunities
  const opportunitiesCount =
    (opportunities.v3?.content?.opportunities?.length ?? 0) ||
    (opportunities.v2?.content?.opportunities?.length ?? 0)

  // Derive opportunities status
  const opportunitiesStatus = deriveOpportunitiesStatus(opportunitiesCount)

  // Derive primary route
  const primaryRoute = derivePrimaryRoute(opportunitiesStatus, runStatus)

  // Derive primary CTA
  const primaryCta = derivePrimaryCta(
    runStatus,
    evidenceStatus,
    opportunitiesStatus,
    competitors.length
  )

  return {
    projectId,
    runId: normalizedRun?.id ?? null,
    runStatus,
    evidenceStatus,
    opportunitiesStatus,
    primaryRoute,
    primaryCta,
    summary: {
      competitorsCount: competitors.length,
      evidenceCount,
      opportunitiesCount,
    },
  }
}

