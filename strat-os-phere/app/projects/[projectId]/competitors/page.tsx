import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { GenerateAnalysisButton } from '@/components/competitors/GenerateAnalysisButton'
import { CompetitorsPageClient } from '@/components/competitors/CompetitorsPageClient'
import { EvidencePreviewPanel } from '@/components/competitors/EvidencePreviewPanel'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { loadProject } from '@/lib/projects/loadProject'
import {
  MAX_COMPETITORS_PER_PROJECT,
  MIN_COMPETITORS_FOR_ANALYSIS,
} from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { getEvidenceSourcesForProject } from '@/lib/data/evidenceSources'
import { DataRecencyNote } from '@/components/shared/DataRecencyNote'
import Link from 'next/link'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import { PAGE_IDS } from '@/lib/guidance/content'
import { TourLink } from '@/components/guidance/TourLink'
import { FirstWinChecklistWrapper } from '@/components/onboarding/FirstWinChecklistWrapper'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { logProjectError } from '@/lib/projects/logProjectError'
import { toAppError, SchemaMismatchError, NotFoundError, UnauthorizedError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'
import { getLatestProjectInput } from '@/lib/data/projectInputs'
import { SuggestedCompetitorsPanel } from '@/components/competitors/SuggestedCompetitorsPanel'

interface CompetitorsPageProps {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata(props: CompetitorsPageProps): Promise<Metadata> {
  const params = await props.params
  const projectId = params.projectId
  
  // Load project name for title
  let projectName = "this project"
  try {
    const supabase = await createClient()
    const projectResult = await loadProject(supabase, projectId)
    if (projectResult.ok) {
      projectName = projectResult.project.name
    }
  } catch (error) {
    // Fallback to generic title if project load fails
  }
  
  return createPageMetadata({
    title: `Competitors for ${projectName}`,
    description:
      "Manage competitors for your competitive analysis. Add and configure competitors to build a comprehensive competitive landscape.",
    path: `/projects/${projectId}/competitors`,
    ogVariant: "competitors",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  });
}

export default async function CompetitorsPage(props: CompetitorsPageProps) {
  const params = await props.params
  const projectId = params.projectId
  const route = `/projects/${projectId}/competitors`

  try {
    const supabase = await createClient()
    
    // Use unified project loader with structured error handling
    // (loadProject handles user authentication internally)
    const projectResult = await loadProject(supabase, projectId, undefined, route)

    if (!projectResult.ok) {
      // Convert to AppError
      let appError: ReturnType<typeof toAppError>
      
      if (projectResult.kind === 'not_found') {
        appError = new NotFoundError(
          projectResult.message || 'Project not found',
          {
            action: { label: 'Back to Projects', href: '/dashboard' },
            details: { projectId, route },
          }
        )
      } else if (projectResult.kind === 'unauthorized') {
        appError = new UnauthorizedError(
          projectResult.message || 'You do not have access to this project',
          {
            action: { label: 'Sign in', href: '/login' },
            details: { projectId, route },
          }
        )
      } else {
        // query_failed - map to SchemaMismatchError if appropriate
        if (projectResult.isMissingColumn) {
          appError = new SchemaMismatchError(
            projectResult.message || 'Schema mismatch detected',
            {
              details: { projectId, route, isMissingColumn: true },
            }
          )
        } else {
          appError = toAppError(
            new Error(projectResult.message || 'Failed to load project'),
            { projectId, route, kind: projectResult.kind }
          )
        }
      }
      
      logAppError('project.competitors', appError, { projectId, route, kind: projectResult.kind })
      
      // For not_found and unauthorized, use Next.js notFound()
      if (projectResult.kind === 'not_found' || projectResult.kind === 'unauthorized') {
        notFound()
      }
      
      // For query failures, show error state
      return <ProjectErrorState error={appError} projectId={projectId} />
    }

    const { project } = projectResult

    // Load suggested competitor names from project inputs (if any)
    let suggestedCompetitorNames: string[] = []
    try {
      const inputResult = await getLatestProjectInput(supabase, projectId)
      if (inputResult.ok && inputResult.data?.input_json) {
        const inputs = inputResult.data.input_json as Record<string, any>
        if (Array.isArray(inputs.suggestedCompetitorNames)) {
          suggestedCompetitorNames = inputs.suggestedCompetitorNames
        }
      }
    } catch (error) {
      // Ignore errors - suggestions are optional
    }

    // Load related data with error handling - default to empty arrays on failure
    let competitors: Awaited<ReturnType<typeof listCompetitorsForProject>> = []
    let artifacts: Awaited<ReturnType<typeof listArtifacts>> = []
    let evidenceSources: Awaited<ReturnType<typeof getEvidenceSourcesForProject>> = []

    try {
      const [competitorsResult, artifactsResult, evidenceResult] = await Promise.all([
        listCompetitorsForProject(supabase, projectId).catch((error) => {
          logProjectError({
            route,
            projectId,
            queryName: 'listCompetitorsForProject',
            error,
          })
          return []
        }),
        listArtifacts(supabase, { projectId }).catch((error) => {
          logProjectError({
            route,
            projectId,
            queryName: 'listArtifacts',
            error,
          })
          return []
        }),
        getEvidenceSourcesForProject(supabase, projectId).catch((error) => {
          logProjectError({
            route,
            projectId,
            queryName: 'getEvidenceSourcesForProject',
            error,
          })
          return []
        }),
      ])
      
      competitors = competitorsResult ?? []
      artifacts = artifactsResult ?? []
      evidenceSources = evidenceResult ?? []
    } catch (error) {
      // Log but continue - we'll show empty states
      logProjectError({
        route,
        projectId,
        queryName: 'loadRelatedData',
        error,
      })
    }
    
    // Ensure arrays are always arrays (defensive programming)
    const safeCompetitors = Array.isArray(competitors) ? competitors : []
    const safeArtifacts = Array.isArray(artifacts) ? artifacts : []
    
    const competitorCount = safeCompetitors.length
  const hasCompetitors = competitorCount > 0
  const readyForAnalysis = competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS
  const remainingToReady = Math.max(
    0,
    MIN_COMPETITORS_FOR_ANALYSIS - competitorCount
  )
  
  // Check evidence sufficiency (at least 5 sources and 2 competitors covered)
  const evidenceCount = evidenceSources.length
  const competitorsWithEvidence = new Set(
    evidenceSources
      .map((s) => s.competitor_id)
      .filter((id): id is string => Boolean(id))
  ).size
  const hasSufficientEvidence = evidenceCount >= 5 && competitorsWithEvidence >= 2
  const canGenerate = readyForAnalysis && hasSufficientEvidence

  const normalized = normalizeResultsArtifacts(safeArtifacts)
  const hasAnyArtifacts = Boolean(
    normalized.profiles ||
    normalized.synthesis ||
    normalized.jtbd ||
    normalized.opportunitiesV2 ||
    normalized.opportunitiesV3 ||
    normalized.scoringMatrix ||
    normalized.strategicBets
  )
  const effectiveCompetitorCount = normalized.competitorCount ?? competitorCount

  return (
    <PageGuidanceWrapper pageId={PAGE_IDS.competitors}>
      <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
        <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
          <header className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Step 2 · Evidence Base
              </p>
              <div className="flex items-center gap-2">
                <h1>{project.name}</h1>
              </div>
              <p className="text-sm text-text-secondary">
                Plinth scans real competitor signals to ground recommendations before ranking anything.
              </p>
              <TourLink />
              <DataRecencyNote />
            </div>

          <div className="flex flex-col items-start gap-2 text-left md:items-end md:text-right">
              <div className="text-xs text-muted-foreground">
                <p>
                  Competitors: {competitorCount} / {MAX_COMPETITORS_PER_PROJECT}
                </p>
                <p>
                  {canGenerate
                    ? 'Ready to generate'
                    : !readyForAnalysis
                      ? `Add ${remainingToReady} more to generate`
                      : !hasSufficientEvidence
                        ? 'Collecting evidence…'
                        : 'Ready to generate'}
                </p>
              </div>
              <GenerateAnalysisButton
                projectId={project.id}
                disabled={!canGenerate}
                competitorCount={competitorCount}
              />
            </div>
        </header>

        <FirstWinChecklistWrapper
          projectId={projectId}
          project={project}
          competitorCount={competitorCount}
          hasResults={hasAnyArtifacts}
        />

        <div className="space-y-6">
          {/* Show suggested competitors panel if we have suggestions and no competitors yet */}
          {suggestedCompetitorNames.length > 0 && competitorCount === 0 && (
            <SuggestedCompetitorsPanel
              projectId={projectId}
              suggestedNames={suggestedCompetitorNames}
            />
          )}

          <CompetitorsPageClient
            projectId={projectId}
            competitors={safeCompetitors}
            competitorCount={competitorCount}
            readyForAnalysis={readyForAnalysis}
            remainingToReady={remainingToReady}
          />
          
          {competitorCount > 0 && (
            <EvidencePreviewPanel
              projectId={projectId}
              competitorCount={competitorCount}
              competitors={safeCompetitors.map((c) => ({
                id: c.id,
                name: c.name,
                url: c.url,
              }))}
            />
          )}
        </div>
      </main>
    </div>
    </PageGuidanceWrapper>
    )
  } catch (error) {
    // Log any unexpected errors
    logProjectError({
      route,
      projectId,
      queryName: 'CompetitorsPage',
      error,
    })
    
    // Convert to AppError and show error state
    const appError = toAppError(error, { projectId, route })
    logAppError('project.competitors', appError, { projectId, route })
    return <ProjectErrorState error={appError} projectId={projectId} />
  }
}

