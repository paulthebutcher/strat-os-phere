import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { loadProject } from '@/lib/projects/loadProject'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeResults'
import { createClient } from '@/lib/supabase/server'
import { ShareButton } from '@/components/results/ShareButton'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import { TourLink } from '@/components/guidance/TourLink'
import { FLAGS } from '@/lib/flags'
import { getProcessedClaims } from '@/lib/evidence'
import { readLatestEvidenceBundle } from '@/lib/evidence/readBundle'
import { EvidenceTrustPanelWrapper } from '@/components/evidence/EvidenceTrustPanelWrapper'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/layout/Section'
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
    title: `Decision summary for ${projectName}`,
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
    let artifacts: Awaited<ReturnType<typeof listArtifacts>> = []
    let evidenceBundle: Awaited<ReturnType<typeof readLatestEvidenceBundle>> = null
    let runningRun: Awaited<ReturnType<typeof getLatestRunningRunForProject>> = null
    let decisionRunState: Awaited<ReturnType<typeof getDecisionRunState>> | null = null

    try {
      const [competitorsResult, artifactsResult, evidenceBundleResult, runningRunResult, decisionRunStateResult] = await Promise.all([
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
      artifacts = artifactsResult ?? []
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

    // Normalize artifacts once using the canonical normalization function
    const normalized = normalizeResultsArtifacts(artifacts, projectId)
    const { opportunities } = normalized
    
    // Check for opportunities artifacts (v3 or v2)
    const hasOpportunitiesArtifact = Boolean(opportunities.v3 || opportunities.v2)
    
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
      normalized.profiles ||
      normalized.jtbd ||
      opportunities.v3 ||
      opportunities.v2 ||
      normalized.strategicBets
    )
    const competitorCount = competitors.length
    const viewModel = deriveAnalysisViewModel({
      activeRunStatus: runningRun?.status ?? null,
      hasArtifacts: hasAnyArtifacts,
      artifactCount: artifacts.length,
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
      <PageGuidanceWrapper pageId="decision">
        <PageShell size="wide">
          <PageHeader
            title="Decision Summary"
            subtitle="Primary recommendation, confidence assessment, and key insights from your analysis."
            secondaryActions={
              <>
                <TourLink />
                <ShareButton projectId={projectId} />
              </>
            }
          />

          {/* DecisionRun Status Banner - persistent run/evidence status */}
          {decisionRunState && (
            <Section>
              <DecisionRunStatusBanner state={decisionRunState} />
            </Section>
          )}

          {/* System State Banner - shows empty/running/partial/complete states */}
          {viewModel.systemState !== 'complete' && (
            <Section>
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
            </Section>
          )}

          {/* Coverage Indicator - Show when we have results */}
          {viewModel.systemState !== 'empty' && viewModel.systemState !== 'running' && (
            <Section>
              <CoverageIndicator
                level={viewModel.coverageLevel}
                sourceCount={viewModel.sourceCount}
                competitorCount={viewModel.competitorCount}
              />
            </Section>
          )}

          {/* Evidence Trust Panel (if enabled) */}
          {FLAGS.evidenceTrustLayerEnabled && processedClaims && (
            <Section>
              <EvidenceTrustPanelWrapper
                coverage={processedClaims.coverage}
                claimsByType={processedClaims.claimsByType}
                bundle={evidenceBundle}
                lastUpdated={evidenceBundle?.createdAt || null}
              />
            </Section>
          )}

          {/* Decision Summary - Primary decision-oriented synthesis surface */}
          <Section>
            <DecisionSummary
              projectId={projectId}
              opportunitiesV3={opportunities.best?.type === 'opportunities_v3' ? opportunities.best.content : null}
              opportunitiesV2={opportunities.best?.type === 'opportunities_v2' ? opportunities.best.content : null}
              coverage={coverageLite}
              competitorCount={competitorCount}
              projectName={project?.name || undefined}
              projectMarket={project?.market || undefined}
              justGenerated={justGenerated}
            />
          </Section>

          {/* Decision Quality Indicators - Collapsed by default, always accessible */}
          <Section>
            <DecisionQualityIndicators
              competitorCount={competitorCount}
              coverage={coverageLite}
              hasOpportunitiesArtifact={hasOpportunitiesArtifact}
              projectId={projectId}
              defaultCollapsed={true}
            />
          </Section>

          {/* Deep Dive Links - Link to other sections */}
          <Section>
            <div className="p-4 bg-muted/30 rounded-lg border border-border-subtle">
              <h3 className="text-sm font-semibold text-foreground mb-3">Deep dives</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/projects/${projectId}/opportunities`}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  All opportunities →
                </Link>
                <Link
                  href={`/projects/${projectId}/competitors`}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Competitors →
                </Link>
                <Link
                  href={`/projects/${projectId}/scorecard`}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Scorecard →
                </Link>
                <Link
                  href={`/projects/${projectId}/evidence`}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Evidence →
                </Link>
              </div>
            </div>
          </Section>
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

