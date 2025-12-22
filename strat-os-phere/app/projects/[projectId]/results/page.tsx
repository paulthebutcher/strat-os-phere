import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { getProjectById } from '@/lib/data/projects'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeResults'
import { createClient } from '@/lib/supabase/server'
import { OpportunitiesContent } from '@/components/results/OpportunitiesContent'
import { ResultsReadout } from '@/components/results/ResultsReadout'
import { ShareButton } from '@/components/results/ShareButton'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import { TourLink } from '@/components/guidance/TourLink'

interface ResultsPageProps {
  params: Promise<{
    projectId: string
  }>
  searchParams?: Promise<{
    tab?: string
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
 * Canonical Results entry point
 * 
 * This is the single canonical route for viewing project results.
 * It loads artifacts, normalizes them once, and renders the opportunities-first view.
 * 
 * Legacy URLs (like /opportunities, /results?tab=...) redirect here.
 */
export default async function ResultsPage(props: ResultsPageProps) {
  const params = await props.params
  const projectId = params.projectId

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const project = await getProjectById(supabase, projectId)

  if (!project || project.user_id !== user.id) {
    notFound()
  }

  const [competitors, artifacts] = await Promise.all([
    listCompetitorsForProject(supabase, projectId),
    listArtifacts(supabase, { projectId }),
  ])

  // Normalize artifacts once using the canonical normalization function
  const normalized = normalizeResultsArtifacts(artifacts, projectId)
  const { opportunities, strategicBets, profiles, jtbd } = normalized

  return (
    <PageGuidanceWrapper pageId="results">
      <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
        <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
          <div className="flex items-center justify-between">
            <TourLink />
            <ShareButton projectId={projectId} />
          </div>
          
          {/* Executive Readout, Assumptions Map, and Assumptions Ledger */}
          <ResultsReadout
            projectId={projectId}
            opportunitiesV3={opportunities.best?.type === 'opportunities_v3' ? opportunities.best.content : null}
            opportunitiesV2={opportunities.best?.type === 'opportunities_v2' ? opportunities.best.content : null}
            generatedAt={normalized.meta.lastGeneratedAt || undefined}
            projectName={project?.name || undefined}
          />

          {/* Opportunities Content - primary view */}
          <OpportunitiesContent
            projectId={projectId}
            opportunitiesV3={opportunities.v3?.content}
            opportunitiesV2={opportunities.v2?.content}
            profiles={profiles?.snapshots ? { snapshots: profiles.snapshots } : null}
            strategicBets={strategicBets?.content}
            jtbd={jtbd?.content}
          />
        </main>
      </div>
    </PageGuidanceWrapper>
  )
}
