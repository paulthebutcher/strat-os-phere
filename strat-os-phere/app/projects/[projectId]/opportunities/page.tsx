import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { loadProject } from '@/lib/projects/loadProject'
import { getDecisionModel } from '@/lib/results/getDecisionModel'
import { createClient } from '@/lib/supabase/server'
import { OpportunitiesContent } from '@/components/results/OpportunitiesContent'
import { ResultsReadout } from '@/components/results/ResultsReadout'
import { ShareButton } from '@/components/results/ShareButton'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import { PAGE_IDS } from '@/lib/guidance/content'
import { TourLink } from '@/components/guidance/TourLink'
import { FLAGS } from '@/lib/flags'
import { getProcessedClaims } from '@/lib/evidence'
import { readLatestEvidenceBundle } from '@/lib/evidence/readBundle'
import { EvidenceTrustPanelWrapper } from '@/components/evidence/EvidenceTrustPanelWrapper'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageSection } from '@/components/layout/Section'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { logProjectError } from '@/lib/projects/logProjectError'
import { toAppError, SchemaMismatchError, NotFoundError, UnauthorizedError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'
import { SystemStateBanner } from '@/components/ux/SystemStateBanner'
import { DecisionQualityIndicators } from '@/components/projects/DecisionQualityIndicators'
import { OpportunitiesStatusHeader } from '@/components/opportunities/OpportunitiesStatusHeader'
import { getLatestRunningRunForProject } from '@/lib/data/runs'
import { getLatestCommittedRunForProject } from '@/lib/data/projectRuns'
import { deriveAnalysisViewModel } from '@/lib/ux/analysisViewModel'
import { computeEvidenceCoverageLite } from '@/lib/evidence/coverageLite'
import { EMPTY_EVIDENCE_COVERAGE_LITE } from '@/lib/evidence/coverageTypes'
import { GenerateAnalysisButton } from '@/components/projects/GenerateAnalysisButton'
import { getNextBestAction } from '@/lib/projects/nextBestAction'
import Link from 'next/link'
import type { SearchParams } from '@/lib/routing/searchParams'
import { getBool } from '@/lib/url/searchParams'
import { OpportunitiesEntryState } from '@/components/results/OpportunitiesEntryState'
import { getDecisionRunState } from '@/lib/decisionRun/getDecisionRunState'
import { DecisionRunStatusBanner } from '@/components/decisionRun/DecisionRunStatusBanner'
import { DecisionReceipt } from '@/components/results/DecisionReceipt'
import { ProjectBreadcrumbs } from '@/components/layout/ProjectBreadcrumbs'

interface OpportunitiesPageProps {
  params: Promise<{
    projectId: string
  }>
  searchParams?: SearchParams
}

export async function generateMetadata(props: OpportunitiesPageProps): Promise<Metadata> {
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
    title: `Ranked opportunities for ${projectName}`,
    description:
      "Strategic opportunities ranked by evidence strength, confidence boundaries, and competitive signals.",
    path: `/projects/${projectId}/opportunities`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

/**
 * Canonical Opportunities page
 * 
 * This is the primary view for viewing project results and opportunities.
 * It loads artifacts, normalizes them once, and renders the opportunities-first view.
 */
export default async function OpportunitiesPage(props: OpportunitiesPageProps) {
  const params = await props.params
  const searchParams = props.searchParams
  const projectId = params.projectId
  const route = `/projects/${projectId}/opportunities`
  const justGenerated = getBool(searchParams?.justGenerated)

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
      
      logAppError('project.opportunities', appError, { projectId, route, kind: projectResult.kind })
      
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
    let decisionModel: Awaited<ReturnType<typeof getDecisionModel>> | null = null
    let evidenceBundle: Awaited<ReturnType<typeof readLatestEvidenceBundle>> = null
    let runningRun: Awaited<ReturnType<typeof getLatestRunningRunForProject>> = null
    let decisionRunState: Awaited<ReturnType<typeof getDecisionRunState>> | null = null

    // Get committed run to use for loading decision model
    let committedRunId: string | undefined = undefined
    try {
      const committedRunResult = await getLatestCommittedRunForProject(supabase, projectId)
      if (committedRunResult.ok && committedRunResult.data) {
        committedRunId = committedRunResult.data.id
        
        if (process.env.NODE_ENV !== 'production') {
          console.log('[opportunities] Using committed run for DecisionModel', {
            projectId,
            runId: committedRunId,
          })
        }
      }
    } catch (error) {
      // Log but continue - will fall back to latest artifacts
      logProjectError({
        route,
        projectId,
        queryName: 'getLatestCommittedRunForProject',
        error,
      })
    }

    try {
      const [competitorsResult, decisionModelResult, evidenceBundleResult, runningRunResult, decisionRunStateResult] = await Promise.all([
        listCompetitorsForProject(supabase, projectId).catch((error) => {
          logProjectError({
            route,
            projectId,
            queryName: 'listCompetitorsForProject',
            error,
          })
          return []
        }),
        getDecisionModel(supabase, { projectId, runId: committedRunId }).catch((error) => {
          logProjectError({
            route,
            projectId,
            queryName: 'getDecisionModel',
            error,
          })
          return null
        }),
        readLatestEvidenceBundle(supabase, projectId).catch((error) => {
          logProjectError({
            route,
            projectId,
            queryName: 'readLatestEvidenceBundle',
            error,
          })
          return null
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
        getDecisionRunState(supabase, projectId).catch((error) => {
          logProjectError({
            route,
            projectId,
            queryName: 'getDecisionRunState',
            error,
          })
          return null
        }),
      ])
      
      competitors = competitorsResult ?? []
      decisionModel = decisionModelResult
      evidenceBundle = evidenceBundleResult ?? null
      runningRun = runningRunResult ?? null
      decisionRunState = decisionRunStateResult
    } catch (error) {
      // Log but continue - we'll show empty states
      logProjectError({
        route,
        projectId,
        queryName: 'loadRelatedData',
        error,
      })
    }

  // Use DecisionModel - no version checks needed
  const hasOpportunitiesArtifact = Boolean(decisionModel?.opportunities?.length && decisionModel.opportunities.length > 0)
  
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
  const hasAnyArtifacts = Boolean(
    decisionModel?.competitors ||
    (decisionModel?.opportunities && decisionModel.opportunities.length > 0) ||
    decisionModel?.scorecard
  )
  const competitorCount = competitors.length
  const viewModel = deriveAnalysisViewModel({
    activeRunStatus: runningRun?.status ?? null,
    hasArtifacts: hasAnyArtifacts,
    artifactCount: decisionModel ? 1 : 0, // DecisionModel represents one logical artifact
    competitorCount: competitorCount,
  })

  // Determine next best action
  const nextAction = getNextBestAction({
    projectId,
    competitorCount,
    coverage: coverageLite,
    hasOpportunitiesArtifact,
  })
  
  // Load and process claims if trust layer is enabled
  const competitorDomains = competitors
    .map(c => c.url)
    .filter((u): u is string => Boolean(u))
  
  const processedClaims = FLAGS.evidenceTrustLayerEnabled
    ? await getProcessedClaims(supabase, projectId, competitorDomains)
    : null

    return (
      <PageGuidanceWrapper pageId={PAGE_IDS.results}>
        <PageShell size="wide">
          {/* Breadcrumb Navigation */}
          <PageSection>
            <ProjectBreadcrumbs
              projectId={projectId}
              projectName={project.name}
            />
          </PageSection>

          <PageHeader
            title="Opportunities"
            subtitle="Candidate opportunities ranked by score. Click any opportunity to explore in detail."
            secondaryActions={
              <>
                <TourLink />
                <ShareButton projectId={projectId} />
              </>
            }
          />

        {/* DecisionRun Status Banner - persistent run/evidence status */}
        {decisionRunState && (
          <PageSection>
            <DecisionRunStatusBanner state={decisionRunState} />
          </PageSection>
        )}

        {/* System State Banner - only show for empty/running/failed states (not partial/complete) */}
        {(viewModel.systemState === 'empty' || viewModel.systemState === 'running' || viewModel.systemState === 'failed') && (
          <PageSection>
            <SystemStateBanner
              state={viewModel.systemState}
              actions={
                nextAction.onClickIntent === 'generate' ? (
                  <GenerateAnalysisButton
                    projectId={projectId}
                    label={nextAction.label}
                    canGenerate={coverageLite.isEvidenceSufficient}
                    missingReasons={coverageLite.isEvidenceSufficient ? [] : coverageLite.reasonsMissing}
                  />
                ) : nextAction.href ? (
                  <Link href={nextAction.href} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                    {nextAction.label}
                  </Link>
                ) : undefined
              }
            />
          </PageSection>
        )}

        {/* Evidence Trust Panel (if enabled) */}
        {FLAGS.evidenceTrustLayerEnabled && processedClaims && (
          <PageSection>
            <EvidenceTrustPanelWrapper
              coverage={processedClaims.coverage}
              claimsByType={processedClaims.claimsByType}
              bundle={evidenceBundle}
              lastUpdated={evidenceBundle?.createdAt || null}
            />
          </PageSection>
        )}

        {/* Decision Receipt - Above-the-fold decision artifact (Phase 2) */}
        <PageSection>
          <DecisionReceipt
            projectId={projectId}
            opportunitiesV3={decisionModel?._rawOpportunitiesV3 || null}
            opportunitiesV2={decisionModel?._rawOpportunitiesV2 || null}
            coverage={coverageLite}
            competitorCount={competitorCount}
            justGenerated={justGenerated}
          />
        </PageSection>

        {/* Decision Brief - Primary post-run experience (shown first when results exist) */}
        {hasOpportunitiesArtifact && (
          <PageSection id="decision-brief">
            <ResultsReadout
              projectId={projectId}
              opportunitiesV3={decisionModel?._rawOpportunitiesV3 || null}
              opportunitiesV2={decisionModel?._rawOpportunitiesV2 || null}
              generatedAt={decisionModel?.generatedAt || undefined}
              projectName={project?.name || undefined}
              competitorCount={competitorCount}
            />
          </PageSection>
        )}

        {/* Entry state handler for just-generated state */}
        {justGenerated && hasOpportunitiesArtifact && (
          <OpportunitiesEntryState
            opportunitiesV3={decisionModel?._rawOpportunitiesV3 || null}
            opportunitiesV2={decisionModel?._rawOpportunitiesV2 || null}
          />
        )}

        {/* Decision Quality Indicators - Collapsed by default, always accessible */}
        <PageSection>
          <DecisionQualityIndicators
            competitorCount={competitorCount}
            coverage={coverageLite}
            hasOpportunitiesArtifact={hasOpportunitiesArtifact}
            projectId={projectId}
            defaultCollapsed
          />
        </PageSection>

        {/* Progress & Results Header - Unified status and coverage above opportunities list */}
        {hasOpportunitiesArtifact && (
          <PageSection>
            <OpportunitiesStatusHeader
              projectId={projectId}
              competitorCount={competitorCount}
              coverage={coverageLite}
              hasOpportunitiesArtifact={hasOpportunitiesArtifact}
            />
          </PageSection>
        )}

        {/* Opportunities Content - primary view */}
        <PageSection>
          <OpportunitiesContent
            projectId={projectId}
            opportunitiesV3={decisionModel?._rawOpportunitiesV3 || undefined}
            opportunitiesV2={decisionModel?._rawOpportunitiesV2 || undefined}
            profiles={decisionModel?.competitors ? { snapshots: decisionModel.competitors } : null}
            strategicBets={undefined} // TODO: Add strategicBets to DecisionModel if needed
            jtbd={undefined} // TODO: Add jtbd to DecisionModel if needed
            evidenceBundle={evidenceBundle}
          />
        </PageSection>
      </PageShell>
    </PageGuidanceWrapper>
    )
  } catch (error) {
    // Log any unexpected errors
    logProjectError({
      route,
      projectId,
      queryName: 'OpportunitiesPage',
      error,
    })
    
    // Convert to AppError and show error state
    const appError = toAppError(error, { projectId, route })
    logAppError('project.opportunities', appError, { projectId, route })
    return <ProjectErrorState error={appError} projectId={projectId} />
  }
}

