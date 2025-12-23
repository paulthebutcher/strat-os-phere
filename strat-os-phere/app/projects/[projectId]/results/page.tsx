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
  const tab = getParam(props.searchParams, 'tab')
  const runId = getParam(props.searchParams, 'runId')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Handle legacy tab redirects (only for routes that need to redirect away)
  if (tab) {
    const tabToRoute: Record<string, string> = {
      overview: `/projects/${projectId}/overview`,
      competitors: `/projects/${projectId}/competitors`,
      settings: `/projects/${projectId}/settings`,
    }
    if (tabToRoute[tab]) {
      redirect(tabToRoute[tab])
    }
  }

  // Load project results
  const results = await getProjectResults(supabase, projectId, runId)

  if (results.project.user_id !== user.id) {
    notFound()
  }

  // Load competitors, all artifacts (for run history), and evidence bundle
  const [competitors, allArtifacts, evidenceBundle] = await Promise.all([
    listCompetitorsForProject(supabase, projectId),
    listArtifacts(supabase, { projectId }),
    readLatestEvidenceBundle(supabase, projectId),
  ])

  // Normalize artifacts (may be partial if run is still running)
  const normalized = normalizeResultsArtifacts(results.artifacts, projectId)
  const { opportunities, strategicBets, profiles, jtbd } = normalized
  
  // Get scoring matrix from normalized artifacts
  const normalizedArtifacts = normalizeArtifactsInternal(results.artifacts)
  const scoringMatrix = normalizedArtifacts.scoringMatrix?.content || null

  // Select readout data for the new executive readout view
  const readoutData = selectReadoutData(normalized)

  // Check if we have any artifacts to show
  const hasArtifacts = results.artifacts.length > 0
  
  // Check if run is in progress
  const isRunning = results.activeRun?.status === 'running' || results.activeRun?.status === 'queued'

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
        <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
          <main className="flex w-full max-w-6xl flex-col gap-8 py-8 md:py-10 animate-fade-in">
          {/* First Win Checklist in Guided Mode */}
          <FirstWinChecklistWrapper
            projectId={projectId}
            project={results.project}
            competitorCount={competitors.length}
            hasResults={hasArtifacts}
          />


          {/* In-progress banner */}
          {isRunning && results.activeRun && (
            <InProgressBanner run={results.activeRun} projectId={projectId} />
          )}

          {!hasArtifacts ? (
            // Empty state: no successful run
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <h2 className="text-3xl font-semibold mb-3 tracking-tight">No results yet</h2>
              <p className="text-base text-muted-foreground mb-8 max-w-md leading-relaxed">
                Run an analysis to generate competitive insights and strategic opportunities.
              </p>
              <RerunAnalysisButton projectId={projectId} />
            </div>
          ) : showReadout ? (
            // Default: Show executive readout view
            (opportunities.best || !isRunning) && (
              <ResultsReadoutView
                projectId={projectId}
                projectName={results.project?.name || 'Results'}
                readoutData={readoutData}
                normalized={normalized}
              />
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
                />
              )}
              {tab === 'evidence' && (
                <EvidenceContent
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
          </main>
        </div>
      </ResultsPageClient>
    </PageGuidanceWrapper>
  )
}
