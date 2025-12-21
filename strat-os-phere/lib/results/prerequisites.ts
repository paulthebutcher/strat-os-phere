/**
 * Prerequisite checks for pipeline phases
 * Ensures hard dependencies are met before proceeding with each phase
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { AppError } from '@/lib/errors'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { listArtifacts } from '@/lib/data/artifacts'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'

/**
 * Assert that the project has at least the minimum required competitors
 * Throws AppError with code INSUFFICIENT_COMPETITORS if check fails
 */
export async function assertHasCompetitors(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<void> {
  const competitors = await listCompetitorsForProject(supabase, projectId)
  
  if (competitors.length < MIN_COMPETITORS_FOR_ANALYSIS) {
    throw new AppError(
      'INSUFFICIENT_COMPETITORS',
      `At least ${MIN_COMPETITORS_FOR_ANALYSIS} competitors are required. Found ${competitors.length}.`,
      { competitorCount: competitors.length }
    )
  }
}

/**
 * Assert that competitor profiles exist for the project
 * Profiles are the foundation artifact that must exist before:
 * - Evidence/live signals generation
 * - JTBD/scorecard/opportunities generation
 * - Strategic bets generation
 * 
 * Throws AppError with code MISSING_COMPETITOR_PROFILES if check fails
 */
export async function assertHasCompetitorProfiles(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<void> {
  const artifacts = await listArtifacts(supabase, { projectId })
  const profilesArtifact = artifacts.find((a) => a.type === 'profiles')
  
  if (!profilesArtifact) {
    const competitors = await listCompetitorsForProject(supabase, projectId)
    throw new AppError(
      'MISSING_COMPETITOR_PROFILES',
      'Competitor profiles are required before live market signals and scoring can run.',
      {
        competitorCount: competitors.length,
        profilesFoundCount: 0,
      }
    )
  }

  // Verify profiles artifact has snapshots
  const profilesContent = profilesArtifact.content_json as {
    snapshots?: unknown[]
  }
  const snapshots = profilesContent?.snapshots || []

  if (snapshots.length === 0) {
    throw new AppError(
      'NO_SNAPSHOTS',
      'Competitor profiles artifact exists but contains no snapshots.',
      {
        profilesFoundCount: 1,
        snapshotCount: 0,
      }
    )
  }
}

