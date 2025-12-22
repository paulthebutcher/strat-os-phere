import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { getProjectById } from '@/lib/data/projects'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'
import { OpportunitiesContent } from '@/components/results/OpportunitiesContent'
import { ResultsReadout } from '@/components/results/ResultsReadout'
import { ShareButton } from '@/components/results/ShareButton'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import { TourLink } from '@/components/guidance/TourLink'

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

export default async function OpportunitiesPage(props: OpportunitiesPageProps) {
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

  const normalized = normalizeResultsArtifacts(artifacts)
  const { opportunitiesV3, opportunitiesV2, profiles, strategicBets, jtbd, generatedAt } = normalized

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
            opportunitiesV3={opportunitiesV3?.content}
            opportunitiesV2={opportunitiesV2?.content}
            generatedAt={generatedAt}
            projectName={project?.name || undefined}
          />

          {/* Existing Opportunities Content */}
          <OpportunitiesContent
            projectId={projectId}
            opportunitiesV3={opportunitiesV3?.content}
            opportunitiesV2={opportunitiesV2?.content}
            profiles={profiles?.snapshots ? { snapshots: profiles.snapshots } : null}
            strategicBets={strategicBets?.content}
            jtbd={jtbd?.content}
          />
        </main>
      </div>
    </PageGuidanceWrapper>
  )
}

