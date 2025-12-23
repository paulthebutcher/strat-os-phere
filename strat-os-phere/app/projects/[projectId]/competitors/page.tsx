import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { GenerateAnalysisButton } from '@/components/competitors/GenerateAnalysisButton'
import { CompetitorsPageClient } from '@/components/competitors/CompetitorsPageClient'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { getProjectById } from '@/lib/data/projects'
import {
  MAX_COMPETITORS_PER_PROJECT,
  MIN_COMPETITORS_FOR_ANALYSIS,
} from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { DataRecencyNote } from '@/components/shared/DataRecencyNote'
import Link from 'next/link'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import { TourLink } from '@/components/guidance/TourLink'
import { FirstWinChecklistWrapper } from '@/components/onboarding/FirstWinChecklistWrapper'

interface CompetitorsPageProps {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata(props: CompetitorsPageProps): Promise<Metadata> {
  const params = await props.params;
  return createPageMetadata({
    title: "Competitors — Plinth",
    description:
      "Manage competitors for your competitive analysis. Add and configure competitors to build a comprehensive competitive landscape.",
    path: `/projects/${params.projectId}/competitors`,
    ogVariant: "competitors",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  });
}

export default async function CompetitorsPage(props: CompetitorsPageProps) {
  const params = await props.params
  const projectId = params.projectId

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // When unauthenticated, simply render not found instead of leaking
    // whether the project exists.
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
  const competitorCount = competitors.length
  const hasCompetitors = competitorCount > 0
  const readyForAnalysis = competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS
  const remainingToReady = Math.max(
    0,
    MIN_COMPETITORS_FOR_ANALYSIS - competitorCount
  )

  const normalized = normalizeResultsArtifacts(artifacts)
  const hasAnyArtifacts = Boolean(
    normalized.profiles ||
    normalized.synthesis ||
    normalized.jtbd ||
    normalized.opportunitiesV2 ||
    normalized.opportunitiesV3 ||
    normalized.scoringMatrix ||
    normalized.strategicBets
  )
  const effectiveCompetitorCount = normalized.competitorCount ?? competitorCount

  return (
    <PageGuidanceWrapper pageId="competitors">
      <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
        <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
          <header className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Step 2 · Competitors
              </p>
              <div className="flex items-center gap-2">
                <h1>{project.name}</h1>
              </div>
              <p className="text-sm text-text-secondary">
                Add real alternatives so Plinth can generate a sharp,
                exec-ready landscape summary.
              </p>
              <TourLink />
              <DataRecencyNote />
            </div>

          <div className="flex flex-col items-start gap-2 text-left md:items-end md:text-right">
              <div className="text-xs text-muted-foreground">
                <p>
                  Competitors: {competitorCount} / {MAX_COMPETITORS_PER_PROJECT}
                </p>
                <p>
                  {readyForAnalysis
                    ? 'Ready to generate'
                    : `Add ${remainingToReady} more to generate`}
                </p>
              </div>
              <GenerateAnalysisButton
                projectId={project.id}
                disabled={!readyForAnalysis}
                competitorCount={competitorCount}
              />
            </div>
        </header>

        <FirstWinChecklistWrapper
          projectId={projectId}
          project={project}
          competitorCount={competitorCount}
          hasResults={hasAnyArtifacts}
        />

        <CompetitorsPageClient
          projectId={projectId}
          competitors={competitors}
          competitorCount={competitorCount}
          readyForAnalysis={readyForAnalysis}
          remainingToReady={remainingToReady}
        />
      </main>
    </div>
    </PageGuidanceWrapper>
  )
}

