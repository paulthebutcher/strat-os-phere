import { ProjectStatusBar } from './ProjectStatusBar'
import { computeEvidenceCoverageLite } from '@/lib/evidence/coverageLite'
import { EMPTY_EVIDENCE_COVERAGE_LITE } from '@/lib/evidence/coverageTypes'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { listArtifacts } from '@/lib/data/artifacts'
import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { logProjectError } from '@/lib/projects/logProjectError'

interface ProjectStatusBarWrapperProps {
  supabase: TypedSupabaseClient
  projectId: string
  route: string
}

/**
 * Server component wrapper that loads data for ProjectStatusBar
 * Handles errors gracefully and always renders (with safe defaults on error)
 */
export async function ProjectStatusBarWrapper({
  supabase,
  projectId,
  route,
}: ProjectStatusBarWrapperProps) {
  // Load data with error handling - default to safe values on failure
  let competitorCount = 0
  let hasOpportunitiesArtifact = false
  let coverage = EMPTY_EVIDENCE_COVERAGE_LITE

  try {
    // Load competitors count
    try {
      const competitors = await listCompetitorsForProject(supabase, projectId)
      competitorCount = Array.isArray(competitors) ? competitors.length : 0
    } catch (error) {
      logProjectError({
        route,
        projectId,
        queryName: 'listCompetitorsForProject (status bar)',
        error,
      })
      // competitorCount stays 0
    }

    // Load coverage
    try {
      coverage = await computeEvidenceCoverageLite(supabase, projectId)
    } catch (error) {
      logProjectError({
        route,
        projectId,
        queryName: 'computeEvidenceCoverageLite (status bar)',
        error,
      })
      // coverage already has safe defaults
    }

    // Check for opportunities artifacts
    try {
      const artifacts = await listArtifacts(supabase, { projectId })
      const safeArtifacts = Array.isArray(artifacts) ? artifacts : []
      // Check for opportunities artifacts (v3 or v2)
      hasOpportunitiesArtifact = safeArtifacts.some(
        (artifact) =>
          artifact.type === 'opportunities_v3' || artifact.type === 'opportunities_v2'
      )
    } catch (error) {
      logProjectError({
        route,
        projectId,
        queryName: 'listArtifacts (status bar)',
        error,
      })
      // hasOpportunitiesArtifact stays false
    }
  } catch (error) {
    // Catch any unexpected errors
    logProjectError({
      route,
      projectId,
      queryName: 'ProjectStatusBarWrapper',
      error,
    })
    // Use safe defaults (already set above)
  }

  return (
    <ProjectStatusBar
      projectId={projectId}
      competitorCount={competitorCount}
      coverage={coverage}
      hasOpportunitiesArtifact={hasOpportunitiesArtifact}
    />
  )
}

