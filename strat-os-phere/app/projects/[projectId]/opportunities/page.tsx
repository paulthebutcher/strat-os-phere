import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { loadProject } from '@/lib/projects/loadProject'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeResults'
import { createClient } from '@/lib/supabase/server'
import { OpportunitiesContent } from '@/components/results/OpportunitiesContent'
import { ResultsReadout } from '@/components/results/ResultsReadout'
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

interface OpportunitiesPageProps {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata(props: OpportunitiesPageProps): Promise<Metadata> {
  const params = await props.params
  return createPageMetadata({
    title: "Opportunities — Plinth",
    description:
      "Strategic opportunities ranked by score with actionable experiments and proof points.",
    path: `/projects/${params.projectId}/opportunities`,
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
  const projectId = params.projectId
  const route = `/projects/${projectId}/opportunities`

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
    let artifacts: Awaited<ReturnType<typeof listArtifacts>> = []
    let evidenceBundle: Awaited<ReturnType<typeof readLatestEvidenceBundle>> = null
    let runningRun: Awaited<ReturnType<typeof getLatestRunningRunForProject>> = null

    try {
      const [competitorsResult, artifactsResult, evidenceBundleResult, runningRunResult] = await Promise.all([
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
      ])
      
      competitors = competitorsResult ?? []
      artifacts = artifactsResult ?? []
      evidenceBundle = evidenceBundleResult ?? null
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

  // Normalize artifacts once using the canonical normalization function
  const normalized = normalizeResultsArtifacts(artifacts, projectId)
  const { opportunities, strategicBets, profiles, jtbd } = normalized
  
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
    <PageGuidanceWrapper pageId="results">
      <PageShell size="wide">
        <PageHeader
          title="Opportunities"
          subtitle="Strategic opportunities ranked by score with actionable experiments and proof points."
          secondaryActions={
            <>
              <TourLink />
              <ShareButton projectId={projectId} />
            </>
          }
        />

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

        {/* Decision Brief - Primary post-run experience (shown first when results exist) */}
        {hasOpportunitiesArtifact && (
          <Section>
            <ResultsReadout
              projectId={projectId}
              opportunitiesV3={opportunities.best?.type === 'opportunities_v3' ? opportunities.best.content : null}
              opportunitiesV2={opportunities.best?.type === 'opportunities_v2' ? opportunities.best.content : null}
              generatedAt={normalized.meta.lastGeneratedAt || undefined}
              projectName={project?.name || undefined}
              competitorCount={competitorCount}
            />
          </Section>
        )}

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

        {/* Opportunities Content - primary view */}
        <Section>
          <OpportunitiesContent
            projectId={projectId}
            opportunitiesV3={opportunities.v3?.content}
            opportunitiesV2={opportunities.v2?.content}
            profiles={profiles?.snapshots ? { snapshots: profiles.snapshots } : null}
            strategicBets={strategicBets?.content}
            jtbd={jtbd?.content}
          />
        </Section>
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

