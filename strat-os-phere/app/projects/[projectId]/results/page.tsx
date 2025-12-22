import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { createClient } from '@/lib/supabase/server'
import { getProjectResults } from '@/lib/results/getProjectResults'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeResults'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { OpportunitiesContent } from '@/components/results/OpportunitiesContent'
import { ResultsReadout } from '@/components/results/ResultsReadout'
import { ShareButton } from '@/components/results/ShareButton'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import { TourLink } from '@/components/guidance/TourLink'
import { RerunAnalysisButton } from '@/components/results/RerunAnalysisButton'
import { RunHistoryDrawer } from '@/components/results/RunHistoryDrawer'
import { InProgressBanner } from '@/components/results/InProgressBanner'
import { ResultsPageClient } from '@/components/results/ResultsPageClient'
import { SectionSkeleton } from '@/components/results/SectionSkeleton'
import { listArtifacts } from '@/lib/data/artifacts'

interface ResultsPageProps {
  params: Promise<{
    projectId: string
  }>
  searchParams?: Promise<{
    tab?: string
    runId?: string
  }>
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
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams ?? Promise.resolve({}),
  ])
  const projectId = params.projectId
  const searchParamsObj = (await searchParams) as { tab?: string; runId?: string } | undefined
  const tab = searchParamsObj?.tab
  const runId = searchParamsObj?.runId

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Handle legacy tab redirects
  if (tab) {
    const tabToRoute: Record<string, string> = {
      overview: `/projects/${projectId}/overview`,
      opportunities: `/projects/${projectId}/results`,
      strategic_bets: `/projects/${projectId}/results`,
      jobs: `/projects/${projectId}/results`,
      scorecard: `/projects/${projectId}/scorecard`,
      competitors: `/projects/${projectId}/competitors`,
      evidence: `/projects/${projectId}/evidence`,
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

  // Load competitors and all artifacts (for run history)
  const [competitors, allArtifacts] = await Promise.all([
    listCompetitorsForProject(supabase, projectId),
    listArtifacts(supabase, { projectId }),
  ])

  // Normalize artifacts (may be partial if run is still running)
  const normalized = normalizeResultsArtifacts(results.artifacts, projectId)
  const { opportunities, strategicBets, profiles, jtbd } = normalized

  // Check if we have any artifacts to show
  const hasArtifacts = results.artifacts.length > 0
  
  // Check if run is in progress
  const isRunning = results.activeRun?.status === 'running' || results.activeRun?.status === 'queued'

  return (
    <PageGuidanceWrapper pageId="results">
      <ResultsPageClient
        projectId={projectId}
        initialRun={results.activeRun}
        initialArtifacts={results.artifacts}
      >
        <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
          <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
          <div className="flex items-center justify-between">
            <TourLink />
            <div className="flex items-center gap-2">
              {hasArtifacts && (
                <>
                  <RerunAnalysisButton projectId={projectId} />
                  <RunHistoryDrawer projectId={projectId} artifacts={allArtifacts} />
                </>
              )}
              <ShareButton projectId={projectId} />
            </div>
          </div>

          {/* In-progress banner */}
          {isRunning && results.activeRun && (
            <InProgressBanner run={results.activeRun} projectId={projectId} />
          )}

          {!hasArtifacts ? (
            // Empty state: no successful run
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <h2 className="text-2xl font-semibold mb-2">No results yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Run an analysis to generate competitive insights and strategic opportunities.
              </p>
              <RerunAnalysisButton projectId={projectId} />
            </div>
          ) : (
            <>
              {/* Executive Readout, Assumptions Map, and Assumptions Ledger */}
              {(opportunities.best || !isRunning) && (
                <ResultsReadout
                  projectId={projectId}
                  opportunitiesV3={opportunities.best?.type === 'opportunities_v3' ? opportunities.best.content : null}
                  opportunitiesV2={opportunities.best?.type === 'opportunities_v2' ? opportunities.best.content : null}
                  generatedAt={normalized.meta.lastGeneratedAt || undefined}
                  projectName={results.project?.name || undefined}
                />
              )}

              {/* Opportunities Content - primary view */}
              {opportunities.v3?.content || opportunities.v2?.content ? (
                <OpportunitiesContent
                  projectId={projectId}
                  opportunitiesV3={opportunities.v3?.content}
                  opportunitiesV2={opportunities.v2?.content}
                  profiles={profiles?.snapshots ? { snapshots: profiles.snapshots } : null}
                  strategicBets={strategicBets?.content}
                  jtbd={jtbd?.content}
                />
              ) : isRunning ? (
                <SectionSkeleton
                  title="Opportunities"
                  description="Strategic opportunities ranked by score with actionable experiments and proof points."
                />
              ) : null}
            </>
          )}
          </main>
        </div>
      </ResultsPageClient>
    </PageGuidanceWrapper>
  )
}
