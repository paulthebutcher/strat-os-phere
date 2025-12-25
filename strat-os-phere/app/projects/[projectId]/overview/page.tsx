import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { ProjectOverview } from '@/components/projects/ProjectOverview'
import { EvidenceReadinessChecklist } from '@/components/projects/ReadinessChecklist'
import { WorkflowTimeline } from '@/components/projects/WorkflowTimeline'
import { AnalysisRunExperience } from '@/components/results/AnalysisRunExperience'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { loadProject } from '@/lib/projects/loadProject'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'
import { createPageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { GenerateAnalysisButton } from '@/components/projects/GenerateAnalysisButton'
import Link from 'next/link'
import type { SearchParams } from '@/lib/routing/searchParams'
import { getParam } from '@/lib/routing/searchParams'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/layout/Section'
import { SystemStateBanner } from '@/components/ux/SystemStateBanner'
import { CoverageIndicator } from '@/components/ux/CoverageIndicator'
import { deriveAnalysisViewModel } from '@/lib/ux/analysisViewModel'
import { getLatestRunningRunForProject } from '@/lib/data/runs'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { logProjectError } from '@/lib/projects/logProjectError'
import { toAppError, SchemaMismatchError, NotFoundError, UnauthorizedError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'
import { EvidenceCoveragePanelWrapper } from '@/components/evidence/EvidenceCoveragePanelWrapper'
import { computeEvidenceCoverageLite } from '@/lib/evidence/coverageLite'
import { EMPTY_EVIDENCE_COVERAGE_LITE } from '@/lib/evidence/coverageTypes'
import { getNextBestAction } from '@/lib/projects/nextBestAction'

interface OverviewPageProps {
  params: Promise<{
    projectId: string
  }>
  searchParams?: SearchParams
}

export async function generateMetadata(props: OverviewPageProps): Promise<Metadata> {
  const params = await props.params
  return createPageMetadata({
    title: "Overview — Plinth",
    description:
      "View project status, readiness checklist, and next actions for your competitive analysis project.",
    path: `/projects/${params.projectId}/overview`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

export default async function OverviewPage(props: OverviewPageProps) {
  const params = await props.params
  const projectId = params.projectId
  const route = `/projects/${projectId}/overview`
  const isGenerating = getParam(props.searchParams, 'generating') === 'true'
  const viewResults = getParam(props.searchParams, 'view') === 'results'

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
      
      logAppError('project.overview', appError, { projectId, route, kind: projectResult.kind })
      
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
    let runningRun: Awaited<ReturnType<typeof getLatestRunningRunForProject>> = null

    try {
      const [competitorsResult, artifactsResult, runningRunResult] = await Promise.all([
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
        getLatestRunningRunForProject(supabase, projectId).catch((error) => {
          logProjectError({
            route,
            projectId,
            queryName: 'getLatestRunningRunForProject',
            error,
          })
          return null
        }),
      ])
      
      competitors = competitorsResult ?? []
      artifacts = artifactsResult ?? []
      runningRun = runningRunResult ?? null
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
  const normalized = normalizeResultsArtifacts(safeArtifacts)
  const {
    opportunitiesV2,
    opportunitiesV3,
    generatedAt,
  } = normalized

  const hasAnyArtifacts = Boolean(
    normalized.profiles ||
    normalized.synthesis ||
    normalized.jtbd ||
    opportunitiesV2 ||
    opportunitiesV3 ||
    normalized.scoringMatrix ||
    normalized.strategicBets
  )
  const effectiveCompetitorCount = normalized.competitorCount ?? competitorCount

  // Check for opportunities artifacts (v3 or v2)
  const hasOpportunitiesArtifact = Boolean(opportunitiesV3 || opportunitiesV2)
  
  // Compute evidence coverage using coverageLite (schema-free, fail-safe)
  let coverageLite = EMPTY_EVIDENCE_COVERAGE_LITE
  try {
    coverageLite = await computeEvidenceCoverageLite(supabase, projectId)
  } catch (error) {
    // Log but don't fail - coverageLite already has safe defaults
    logProjectError({
      route,
      projectId,
      queryName: 'computeEvidenceCoverageLite',
      error: error instanceof Error ? error : new Error(String(error)),
    })
  }

  // Derive view model for state and coverage
  const viewModel = deriveAnalysisViewModel({
    activeRunStatus: runningRun?.status ?? null,
    hasArtifacts: hasAnyArtifacts,
    artifactCount: safeArtifacts.length,
    competitorCount: competitorCount,
  })

  // Determine next best action using new helper
  const nextAction = getNextBestAction({
    projectId,
    competitorCount,
    coverage: coverageLite,
    hasOpportunitiesArtifact,
  })

  // Show AnalysisRunExperience if generating and not explicitly viewing results
  if (isGenerating && !viewResults) {
    return <AnalysisRunExperience projectId={projectId} />
  }

  // Build primary action for header based on nextBestAction
  const primaryAction =
    nextAction.onClickIntent === 'generate' ? (
      <GenerateAnalysisButton
        projectId={projectId}
        label={nextAction.label}
        canGenerate={coverageLite.isEvidenceSufficient}
        missingReasons={coverageLite.isEvidenceSufficient ? [] : coverageLite.reasonsMissing}
      />
    ) : (
      <Button asChild variant="default">
        <Link href={nextAction.href || `/projects/${projectId}`}>
          {nextAction.label}
        </Link>
      </Button>
    )

  return (
    <PageShell>
      <PageHeader
        title="Project Overview"
        subtitle="Review project status, readiness, and next actions"
        primaryAction={primaryAction}
      />

      {/* System State Banner */}
      <Section>
        <SystemStateBanner state={viewModel.systemState} />
      </Section>

      {/* Coverage Indicator - Show when we have results */}
      {viewModel.systemState !== 'empty' && (
        <Section>
          <CoverageIndicator
            level={viewModel.coverageLevel}
            competitorCount={viewModel.competitorCount}
          />
        </Section>
      )}

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
        {/* Left column: Main content */}
        <div className="space-y-6">
          {/* Project Summary & Recent Outputs */}
          <Section>
            <ProjectOverview
              project={project}
              projectId={projectId}
              hasArtifacts={hasAnyArtifacts}
              generatedAt={generatedAt}
              opportunitiesV3={opportunitiesV3?.content}
              opportunitiesV2={opportunitiesV2?.content}
            />
          </Section>

          {/* Evidence Coverage Panel */}
          <Section>
            <EvidenceCoveragePanelWrapper projectId={projectId} />
          </Section>

          {/* Evidence-Focused Readiness Checklist */}
          <Section>
            <EvidenceReadinessChecklist
              competitorCount={competitorCount}
              coverage={coverageLite}
              hasOpportunitiesArtifact={hasOpportunitiesArtifact}
              projectId={projectId}
            />
          </Section>

          {/* Workflow Timeline - temporarily removed, can be restored if needed */}
        </div>

        {/* Right column: Project Actions panel */}
        <div className="space-y-6">
          <Section>
            <div className="bg-card border border-border rounded-md p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Project Actions
              </h3>
              <div className="space-y-4">
                {/* Primary action button */}
                {nextAction.onClickIntent === 'generate' ? (
                  <GenerateAnalysisButton
                    projectId={projectId}
                    label={nextAction.label}
                    canGenerate={coverageLite.isEvidenceSufficient}
                    missingReasons={coverageLite.isEvidenceSufficient ? [] : coverageLite.reasonsMissing}
                    className="w-full"
                  />
                ) : (
                  <Button asChild variant="default" className="w-full">
                    <Link href={nextAction.href || `/projects/${projectId}`}>
                      {nextAction.label}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </Section>
        </div>
      </div>
    </PageShell>
    )
  } catch (error) {
    // Log any unexpected errors
    logProjectError({
      route,
      projectId,
      queryName: 'OverviewPage',
      error,
    })
    
    // Convert to AppError and show error state
    const appError = toAppError(error, { projectId, route })
    logAppError('project.overview', appError, { projectId, route })
    return <ProjectErrorState error={appError} projectId={projectId} />
  }
}

