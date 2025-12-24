import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { GenerateAnalysisButton } from '@/components/competitors/GenerateAnalysisButton'
import { CompetitorsPageClient } from '@/components/competitors/CompetitorsPageClient'
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
import { DataRecencyNote } from '@/components/shared/DataRecencyNote'
import Link from 'next/link'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import { TourLink } from '@/components/guidance/TourLink'
import { FirstWinChecklistWrapper } from '@/components/onboarding/FirstWinChecklistWrapper'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { logProjectError } from '@/lib/projects/logProjectError'
import { toAppError, SchemaMismatchError, NotFoundError, UnauthorizedError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'

interface CompetitorsPageProps {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata(props: CompetitorsPageProps): Promise<Metadata> {
  const params = await props.params;
  return createPageMetadata({
    title: "Competitors — Plinth",
    description:
      "Manage competitors for your competitive analysis. Add and configure competitors to build a comprehensive competitive landscape.",
    path: `/projects/${params.projectId}/competitors`,
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

    // Load related data with error handling - default to empty arrays on failure
    let competitors: Awaited<ReturnType<typeof listCompetitorsForProject>> = []
    let artifacts: Awaited<ReturnType<typeof listArtifacts>> = []

    try {
      const [competitorsResult, artifactsResult] = await Promise.all([
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
      ])
      
      competitors = competitorsResult ?? []
      artifacts = artifactsResult ?? []
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
    <PageGuidanceWrapper pageId="competitors">
      <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
        <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
          <header className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Step 2 · Competitors
              </p>
              <div className="flex items-center gap-2">
                <h1>{project.name}</h1>
              </div>
              <p className="text-sm text-text-secondary">
                Add real alternatives so Plinth can generate a sharp,
                exec-ready landscape summary.
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
                  {readyForAnalysis
                    ? 'Ready to generate'
                    : `Add ${remainingToReady} more to generate`}
                </p>
              </div>
              <GenerateAnalysisButton
                projectId={project.id}
                disabled={!readyForAnalysis}
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

        <CompetitorsPageClient
          projectId={projectId}
          competitors={safeCompetitors}
          competitorCount={competitorCount}
          readyForAnalysis={readyForAnalysis}
          remainingToReady={remainingToReady}
        />
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

