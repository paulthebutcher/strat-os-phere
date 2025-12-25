import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { createClient } from '@/lib/supabase/server'
import { getProjectResults } from '@/lib/results/getProjectResults'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeResults'
import { normalizeResultsArtifacts as normalizeArtifactsInternal } from '@/lib/results/normalizeArtifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { OpportunitiesContent } from '@/components/results/OpportunitiesContent'
import { ResultsReadoutView } from '@/components/results/readout/ResultsReadoutView'
import { AppendixContent } from '@/components/results/AppendixContent'
import { ScorecardContent } from '@/components/results/ScorecardContent'
import { EvidenceContent } from '@/components/results/EvidenceContent'
import { StrategicBetsSection } from '@/components/results/memo/StrategicBetsSection'
import { ShareButton } from '@/components/results/ShareButton'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import { RerunAnalysisButton } from '@/components/results/RerunAnalysisButton'
import { RunHistoryDrawer } from '@/components/results/RunHistoryDrawer'
import { InProgressBanner } from '@/components/results/InProgressBanner'
import { ResultsPageClient } from '@/components/results/ResultsPageClient'
import { SectionSkeleton } from '@/components/results/SectionSkeleton'
import { listArtifacts } from '@/lib/data/artifacts'
import { FirstWinChecklistWrapper } from '@/components/onboarding/FirstWinChecklistWrapper'
import { selectReadoutData } from '@/lib/results/selectors'
import type { SearchParams } from '@/lib/routing/searchParams'
import { getParam } from '@/lib/routing/searchParams'
import { readLatestEvidenceBundle } from '@/lib/evidence/readBundle'
import { FollowUpQuestionWrapper } from '@/components/followup/FollowUpQuestionWrapper'
import { FLAGS } from '@/lib/flags'
import { getProcessedClaims } from '@/lib/evidence'
import { EvidenceTrustPanelWrapper } from '@/components/evidence/EvidenceTrustPanelWrapper'
import { normalizeEvidenceBundleToLedger } from '@/lib/evidence/ledger'
import { EvidenceLedgerSection } from '@/components/evidence/EvidenceLedgerSection'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/layout/Section'
import { EmptyState } from '@/components/layout/EmptyState'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SystemStateBanner } from '@/components/ux/SystemStateBanner'
import { CoverageIndicator } from '@/components/ux/CoverageIndicator'
import { NextBestActionCard } from '@/components/ux/NextBestActionCard'
import { deriveAnalysisViewModel } from '@/lib/ux/analysisViewModel'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { logProjectError } from '@/lib/projects/logProjectError'
import { isMissingColumnError } from '@/lib/db/safeDb'
import { toAppError, SchemaMismatchError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'

interface ResultsPageProps {
  params: Promise<{
    projectId: string
  }>
  searchParams?: SearchParams
}

export async function generateMetadata(props: ResultsPageProps): Promise<Metadata> {
  const params = await props.params
  return createPageMetadata({
    title: "Results — Plinth",
    description: "Competitive analysis results and insights.",
    path: `/projects/${params.projectId}/results`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

/**
 * Canonical results route
 * 
 * Shows saved results by default (latest successful run).
 * Supports ?runId=... to view a specific run.
 * Handles legacy ?tab=... URLs by redirecting to canonical routes.
 */
export default async function ResultsPage(props: ResultsPageProps) {
  const params = await props.params
  const projectId = params.projectId
  const route = `/projects/${projectId}/results`
  const tab = getParam(props.searchParams, 'tab')
  const runId = getParam(props.searchParams, 'runId')

  try {
    const supabase = await createClient()
    
    // Get user with error handling
    let user
    try {
      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        logProjectError({
          route,
          projectId,
          queryName: 'auth.getUser',
          error: userError,
        })
        notFound()
      }

      user = authUser
    } catch (error) {
      logProjectError({
        route,
        projectId,
        queryName: 'auth.getUser',
        error,
      })
      notFound()
    }

    if (!user) {
      notFound()
    }

    // Handle legacy tab redirects (only for routes that need to redirect away)
    if (tab) {
      const tabToRoute: Record<string, string> = {
        overview: `/projects/${projectId}/opportunities`,
        competitors: `/projects/${projectId}/competitors`,
        settings: `/projects/${projectId}/settings`,
      }
      if (tabToRoute[tab]) {
        redirect(tabToRoute[tab])
      }
    }

    // Load project results with error handling
    let results
    try {
      results = await getProjectResults(supabase, projectId, runId)
    } catch (error) {
      logProjectError({
        route,
        projectId,
        queryName: 'getProjectResults',
        error,
      })
      
      // If it's a schema drift error, show error state instead of crashing
      if (isMissingColumnError(error)) {
        const appError = new SchemaMismatchError(
          error instanceof Error ? error.message : String(error),
          { details: { projectId, route } }
        )
        logAppError('project.results', appError, { projectId, route })
        return <ProjectErrorState error={appError} projectId={projectId} />
      }
      
      // Re-throw other errors to trigger error boundary
      throw error
    }

    if (results.project.user_id !== user.id) {
      notFound()
    }

    // Load competitors, all artifacts (for run history), and evidence bundle with error handling
    let competitors: Awaited<ReturnType<typeof listCompetitorsForProject>> = []
    let allArtifacts: Awaited<ReturnType<typeof listArtifacts>> = []
    let evidenceBundle: Awaited<ReturnType<typeof readLatestEvidenceBundle>> = null

    try {
      const [competitorsResult, allArtifactsResult, evidenceBundleResult] = await Promise.all([
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
      ])
      
      competitors = competitorsResult ?? []
      allArtifacts = allArtifactsResult ?? []
      evidenceBundle = evidenceBundleResult ?? null
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
    const safeAllArtifacts = Array.isArray(allArtifacts) ? allArtifacts : []
  
  // Load and process claims if trust layer is enabled
  const competitorDomains = safeCompetitors
    .map(c => c.url)
    .filter((u): u is string => Boolean(u))
  
  let processedClaims = null
  if (FLAGS.evidenceTrustLayerEnabled && competitorDomains.length > 0) {
    try {
      processedClaims = await getProcessedClaims(supabase, projectId, competitorDomains)
    } catch (error) {
      logProjectError({
        route,
        projectId,
        queryName: 'getProcessedClaims',
        error,
      })
      // Continue without processed claims - not critical
    }
  }

  // Normalize artifacts (may be partial if run is still running)
  const normalized = normalizeResultsArtifacts(results.artifacts, projectId)
  const { opportunities, strategicBets, profiles, jtbd } = normalized
  
  // Get scoring matrix from normalized artifacts
  const normalizedArtifacts = normalizeArtifactsInternal(results.artifacts)
  const scoringMatrix = normalizedArtifacts.scoringMatrix?.content || null

  // Select readout data for the decision brief view
  const readoutData = selectReadoutData(normalized)

  // Normalize evidence bundle to ledger model
  const evidenceLedgerModel = normalizeEvidenceBundleToLedger(evidenceBundle)

  // Check if we have any artifacts to show
  const hasArtifacts = results.artifacts.length > 0
  
  // Check if run is in progress
  const isRunning = results.activeRun?.status === 'running' || results.activeRun?.status === 'queued'

  // Derive view model for state and coverage
  const viewModel = deriveAnalysisViewModel({
    activeRunStatus: results.activeRun?.status ?? null,
    hasArtifacts,
    artifactCount: results.artifacts.length,
    competitorCount: safeCompetitors.length,
    // Source count can be added here if evidence bundle structure is known
    // For now, coverage will default based on competitor count
  })

  // Determine which view to show based on tab parameter
  // Default to readout view if no tab specified
  const showReadout = !tab || tab === 'readout'
  const showAppendix = tab === 'appendix'
  const showTabContent = tab && tab !== 'readout' && tab !== 'appendix'

  return (
    <PageGuidanceWrapper pageId="results">
      <ResultsPageClient
        projectId={projectId}
        initialRun={results.activeRun}
        initialArtifacts={results.artifacts}
      >
        <PageShell size="wide">
          {/* First Win Checklist in Guided Mode */}
          <FirstWinChecklistWrapper
            projectId={projectId}
            project={results.project}
            competitorCount={safeCompetitors.length}
            hasResults={hasArtifacts}
          />

          {/* System State Banner - Always visible to show current state */}
          {!isRunning && (
            <Section>
              <SystemStateBanner state={viewModel.systemState} />
            </Section>
          )}

          {/* In-progress banner - Shows when running (replaces state banner) */}
          {isRunning && results.activeRun && (
            <InProgressBanner run={results.activeRun} projectId={projectId} />
          )}

          {/* Coverage Indicator - Show when we have results or partial results */}
          {viewModel.systemState !== 'empty' && (
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

          {/* Follow-up question (after analysis completes) */}
          {!isRunning && hasArtifacts && (
            <FollowUpQuestionWrapper
              projectId={projectId}
              evidenceBundle={evidenceBundle}
              claimsBundle={null} // Will be generated client-side if needed
              hasCompletedRun={true}
            />
          )}

          {!hasArtifacts ? (
            // Empty/failed state: show NextBestActionCard
            <Section>
              <NextBestActionCard
                state={viewModel.systemState === 'failed' ? 'failed' : 'empty'}
                primaryAction={
                  <RerunAnalysisButton projectId={projectId} />
                }
              />
            </Section>
          ) : showReadout ? (
            // Default: Show decision brief view
            (opportunities.best || !isRunning) && (
              <>
                <PageHeader
                  title="Results readout"
                  subtitle="A decision-ready synthesis of your competitive landscape"
                  primaryAction={<RerunAnalysisButton projectId={projectId} />}
                  secondaryActions={
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/projects/${projectId}/results?tab=appendix`}>
                        View Appendix
                      </Link>
                    </Button>
                  }
                />
                <Section>
                  <ResultsReadoutView
                    projectId={projectId}
                    projectName={results.project?.name || 'Results'}
                    readoutData={readoutData}
                    normalized={normalized}
                    hideHeader={true}
                  />
                </Section>
                {/* Evidence Ledger Section - Always visible (handles empty state internally) */}
                <Section>
                  <EvidenceLedgerSection model={evidenceLedgerModel} />
                </Section>
              </>
            )
          ) : showTabContent ? (
            // Show specific tab content (deep dives)
            <>
              {tab === 'opportunities' && (opportunities.v3?.content || opportunities.v2?.content) && (
                <OpportunitiesContent
                  projectId={projectId}
                  opportunitiesV3={opportunities.v3?.content}
                  opportunitiesV2={opportunities.v2?.content}
                  profiles={profiles?.snapshots ? { snapshots: profiles.snapshots } : null}
                  strategicBets={strategicBets?.content}
                  jtbd={jtbd?.content}
                />
              )}
              {tab === 'strategic_bets' && (
                <StrategicBetsSection
                  bets={strategicBets?.content || null}
                  opportunities={opportunities.best?.content || null}
                  projectId={projectId}
                />
              )}
              {tab === 'jobs' && jtbd?.content && (
                <AppendixContent
                  projectId={projectId}
                  normalized={{ jtbd }}
                />
              )}
              {tab === 'profiles' && profiles && (
                <AppendixContent
                  projectId={projectId}
                  normalized={{ profiles }}
                />
              )}
              {tab === 'scorecard' && (
                <ScorecardContent
                  projectId={projectId}
                  scoring={scoringMatrix}
                  evidenceBundle={evidenceBundle}
                  competitorDomains={safeCompetitors.map(c => c.url).filter((u): u is string => Boolean(u))}
                />
              )}
              {tab === 'evidence' && (
                <EvidenceContent
                  projectId={projectId}
                  opportunitiesV3={opportunities.v3?.content}
                  opportunitiesV2={opportunities.v2?.content}
                  profiles={profiles?.snapshots ? { snapshots: profiles.snapshots } : null}
                  strategicBets={strategicBets?.content}
                  jtbd={jtbd?.content}
                  bundle={evidenceBundle}
                />
              )}
            </>
          ) : showAppendix ? (
            // Show all appendix content
            <AppendixContent
              projectId={projectId}
              normalized={{ profiles, synthesis: null, jtbd }}
            />
          ) : null}
        </PageShell>
      </ResultsPageClient>
    </PageGuidanceWrapper>
    )
  } catch (error) {
    // Log any unexpected errors
    logProjectError({
      route,
      projectId,
      queryName: 'ResultsPage',
      error,
    })
    
    // Convert to AppError and show error state
    const appError = toAppError(error, { projectId, route })
    logAppError('project.results', appError, { projectId, route })
    return <ProjectErrorState error={appError} projectId={projectId} />
  }
}
