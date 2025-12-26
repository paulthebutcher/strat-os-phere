import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { paths } from '@/lib/routes'
import { createPageMetadata } from '@/lib/seo/metadata'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { loadProject } from '@/lib/projects/loadProject'
import { getDecisionModel } from '@/lib/results/getDecisionModel'
import { createClient } from '@/lib/supabase/server'
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
import { CoverageIndicator } from '@/components/ux/CoverageIndicator'
import { DecisionQualityIndicators } from '@/components/projects/DecisionQualityIndicators'
import { getLatestRunningRunForProject } from '@/lib/data/runs'
import { deriveAnalysisViewModel } from '@/lib/ux/analysisViewModel'
import { computeEvidenceCoverageLite } from '@/lib/evidence/coverageLite'
import { EMPTY_EVIDENCE_COVERAGE_LITE } from '@/lib/evidence/coverageTypes'
import { GenerateAnalysisButton } from '@/components/projects/GenerateAnalysisButton'
import { getNextBestAction } from '@/lib/projects/nextBestAction'
import Link from 'next/link'
import type { SearchParams } from '@/lib/routing/searchParams'
import { getBool } from '@/lib/url/searchParams'
import { getDecisionRunState } from '@/lib/decisionRun/getDecisionRunState'
import { DecisionRunStatusBanner } from '@/components/decisionRun/DecisionRunStatusBanner'
import { DecisionReceipt } from '@/components/results/DecisionReceipt'
import { DecisionSummary } from '@/components/results/DecisionSummary'
import { ProjectBreadcrumbs } from '@/components/layout/ProjectBreadcrumbs'
import { DeepDiveLinks } from '@/components/projects/DeepDiveLinks'
import { ReadoutHero } from '@/components/results/ReadoutHero'
import { EvidenceProgressStrip } from '@/components/results/EvidenceProgressStrip'
import { EvidencePreview } from '@/components/results/EvidencePreview'
import { NextStepsPanel } from '@/components/results/NextStepsPanel'

interface DecisionPageProps {
  params: Promise<{
    projectId: string
  }>
  searchParams?: SearchParams
}

export async function generateMetadata(props: DecisionPageProps): Promise<Metadata> {
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
    title: `Executive Readout for ${projectName}`,
    description:
      "Primary recommendation, confidence assessment, and key insights from competitive analysis.",
    path: `/projects/${projectId}/decision`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

/**
 * Decision Summary Page - Primary Analysis Entry Point
 * 
 * This is the default landing page when opening a project.
 * It presents a decision-oriented synthesis that answers:
 * - What should I care about?
 * - What is the strongest recommendation?
 * - Why does it matter?
 * - How confident should I be?
 * 
 * All other sections (Opportunities, Competitors, Scorecard, Evidence, Appendix)
 * remain available as deep-dive views, not the starting point.
 */
export default async function DecisionPage(props: DecisionPageProps) {
  const params = await props.params
  const searchParams = props.searchParams
  const projectId = params.projectId
  const route = `/projects/${projectId}/decision`
  const justGenerated = getBool(searchParams?.justGenerated)

  try {
    const supabase = await createClient()
    
    // Use unified project loader with structured error handling
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
      
      logAppError('project.decision', appError, { projectId, route, kind: projectResult.kind })
      
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
        getDecisionModel(supabase, { projectId }).catch((error) => {
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
      <PageGuidanceWrapper pageId={PAGE_IDS.decision}>
        <PageShell size="wide">
          {/* Breadcrumb Navigation */}
          <PageSection>
            <ProjectBreadcrumbs
              projectId={projectId}
              projectName={project.name}
            />
          </PageSection>

          <PageHeader
            title="Executive Readout"
            subtitle="Primary recommendation, confidence, and next steps"
            secondaryActions={
              <>
                <ShareButton projectId={projectId} />
                <TourLink />
              </>
            }
          />

          {/* Readout Hero - Primary recommendation and confidence */}
          <PageSection>
            <ReadoutHero
              opportunitiesV3={decisionModel?._rawOpportunitiesV3 || null}
              opportunitiesV2={decisionModel?._rawOpportunitiesV2 || null}
              coverage={coverageLite}
              competitorCount={competitorCount}
              projectName={project?.name || undefined}
              projectMarket={project?.market || undefined}
            />
          </PageSection>

          {/* Evidence Progress Strip - Compact progress indicator */}
          {(decisionRunState || viewModel.systemState !== 'complete') && (
            <PageSection>
              <EvidenceProgressStrip
                decisionRunState={decisionRunState}
                coverage={coverageLite}
                competitorCount={competitorCount}
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

          {/* Next Steps Panel */}
          <PageSection>
            <NextStepsPanel
              coverage={coverageLite}
              projectId={projectId}
            />
          </PageSection>

          {/* Evidence Preview - Always shows something */}
          <PageSection>
            <EvidencePreview
              evidenceBundle={evidenceBundle}
              coverage={coverageLite}
              projectId={projectId}
            />
          </PageSection>

          {/* Decision Summary - Deep dive content (collapsed or below fold) */}
          <PageSection>
            <DecisionSummary
              projectId={projectId}
              opportunitiesV3={decisionModel?._rawOpportunitiesV3 || null}
              opportunitiesV2={decisionModel?._rawOpportunitiesV2 || null}
              coverage={coverageLite}
              competitorCount={competitorCount}
              projectName={project?.name || undefined}
              projectMarket={project?.market || undefined}
              justGenerated={justGenerated}
            />
          </PageSection>

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

          {/* Deep Dive Links - Link to other sections */}
          <PageSection>
            <DeepDiveLinks projectId={projectId} />
          </PageSection>
        </PageShell>
      </PageGuidanceWrapper>
    )
  } catch (error) {
    // Log any unexpected errors
    logProjectError({
      route,
      projectId,
      queryName: 'DecisionPage',
      error,
    })
    
    // Convert to AppError and show error state
    const appError = toAppError(error, { projectId, route })
    logAppError('project.decision', appError, { projectId, route })
    return <ProjectErrorState error={appError} projectId={projectId} />
  }
}

