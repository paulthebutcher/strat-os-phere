import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { ProjectOverview } from '@/components/projects/ProjectOverview'
import { ReadinessChecklist } from '@/components/projects/ReadinessChecklist'
import { WorkflowTimeline } from '@/components/projects/WorkflowTimeline'
import { ProjectActionsPanel } from '@/components/projects/ProjectActionsPanel'
import { AnalysisRunExperience } from '@/components/results/AnalysisRunExperience'
import { getProjectReadiness } from '@/lib/ui/readiness'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { loadProject } from '@/lib/projects/loadProject'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'
import { createPageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { GenerateAnalysisButton } from '@/components/projects/GenerateAnalysisButton'
import Link from 'next/link'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'
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
      // Handle different error kinds
      if (projectResult.kind === 'not_found' || projectResult.kind === 'unauthorized') {
        notFound()
      }
      
      // For query failures (including schema drift), show error state
      return <ProjectErrorState projectId={projectId} isMissingColumn={projectResult.isMissingColumn} />
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

  // Compute readiness
  const readiness = getProjectReadiness(project, safeCompetitors)

  // Derive view model for state and coverage
  const viewModel = deriveAnalysisViewModel({
    activeRunStatus: runningRun?.status ?? null,
    hasArtifacts: hasAnyArtifacts,
    artifactCount: safeArtifacts.length,
    competitorCount: competitorCount,
  })

  // Determine primary CTA action based on readiness
  const primaryCTA = readiness.nextAction

  // Show AnalysisRunExperience if generating and not explicitly viewing results
  if (isGenerating && !viewResults) {
    return <AnalysisRunExperience projectId={projectId} />
  }

  // Build primary action for header
  const primaryAction = primaryCTA.type === 'generate_analysis' && readiness.allComplete ? (
    <GenerateAnalysisButton
      projectId={projectId}
      label={primaryCTA.label}
      canGenerate={readiness.allComplete}
      missingReasons={
        readiness.allComplete
          ? []
          : readiness.items
              .filter((item) => item.status === 'incomplete')
              .map((item) => item.label)
      }
    />
  ) : (
    <Button asChild variant={primaryCTA.type === 'edit_project' ? 'outline' : 'default'}>
      <Link
        href={
          primaryCTA.href === '/competitors'
            ? `/projects/${projectId}/competitors`
            : primaryCTA.href === '/projects'
            ? `/dashboard`
            : primaryCTA.href === '/overview'
            ? `/projects/${projectId}/overview`
            : primaryCTA.href.startsWith('/')
            ? `/projects/${projectId}${primaryCTA.href}`
            : primaryCTA.href
        }
      >
        {primaryCTA.label}
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

          {/* Readiness Checklist */}
          <Section>
            <ReadinessChecklist
              items={readiness.items}
              projectId={projectId}
            />
          </Section>

          {/* Workflow Timeline */}
          <Section>
            <WorkflowTimeline readinessItems={readiness.items} />
          </Section>
        </div>

        {/* Right column: Actions panel (desktop only) */}
        <ProjectActionsPanel
          projectId={projectId}
          readiness={readiness}
          competitorCount={competitorCount}
          effectiveCompetitorCount={effectiveCompetitorCount}
          hasArtifacts={hasAnyArtifacts}
        />
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
    
    // Show error state instead of crashing
    return <ProjectErrorState projectId={projectId} />
  }
}

