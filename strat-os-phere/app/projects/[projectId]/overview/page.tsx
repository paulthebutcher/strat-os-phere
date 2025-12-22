import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { AppShell } from '@/components/layout/AppShell'
import { ExecutiveSummary } from '@/components/results/ExecutiveSummary'
import { AnalysisRunExperience } from '@/components/results/AnalysisRunExperience'
import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { getProjectById } from '@/lib/data/projects'
import {
  normalizeResultsArtifacts,
  type NormalizedOpportunitiesV2Artifact,
  type NormalizedOpportunitiesV3Artifact,
} from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'

interface OverviewPageProps {
  params: Promise<{
    projectId: string
  }>
  searchParams?: Promise<{
    generating?: string
    view?: string
  }>
}

export async function generateMetadata(props: OverviewPageProps): Promise<Metadata> {
  const params = await props.params
  return createPageMetadata({
    title: "Overview — Plinth",
    description:
      "Executive summary of your competitive analysis with top opportunities and strategic insights.",
    path: `/projects/${params.projectId}/overview`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

export default async function OverviewPage(props: OverviewPageProps) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams ?? Promise.resolve({}),
  ])
  const projectId = params.projectId
  const searchParamsObj = searchParams as {
    generating?: string
    view?: string
  }
  const isGenerating = searchParamsObj.generating === 'true'
  const viewResults = searchParamsObj.view === 'results'

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

  const competitorCount = competitors.length
  const normalized = normalizeResultsArtifacts(artifacts)
  const {
    opportunitiesV2,
    opportunitiesV3,
    runId,
    generatedAt,
  } = normalized

  const hasAnyArtifacts = Boolean(
    normalized.profiles ||
    normalized.synthesis ||
    normalized.jtbd ||
    opportunitiesV2 ||
    opportunitiesV3 ||
    normalized.scoringMatrix ||
    normalized.strategicBets
  )
  const effectiveCompetitorCount = normalized.competitorCount ?? competitorCount

  // Show AnalysisRunExperience if generating and not explicitly viewing results
  if (isGenerating && !viewResults) {
    return <AnalysisRunExperience projectId={projectId} />
  }

  return (
    <AppShell
      projectId={projectId}
      projectName={project.name}
      projectMarket={project.market}
      hasArtifacts={hasAnyArtifacts}
      competitorCount={competitorCount}
      effectiveCompetitorCount={effectiveCompetitorCount}
    >
      <ExecutiveSummary
        projectId={projectId}
        opportunitiesV3={opportunitiesV3?.content}
        opportunitiesV2={opportunitiesV2?.content}
        hasArtifacts={hasAnyArtifacts}
        competitorCount={competitorCount}
        effectiveCompetitorCount={effectiveCompetitorCount}
        generatedAt={generatedAt}
      />
    </AppShell>
  )
}

