import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { ProjectOverview } from '@/components/projects/ProjectOverview'
import { ReadinessChecklist } from '@/components/projects/ReadinessChecklist'
import { WorkflowTimeline } from '@/components/projects/WorkflowTimeline'
import { ProjectActionsPanel } from '@/components/projects/ProjectActionsPanel'
import { AnalysisRunExperience } from '@/components/results/AnalysisRunExperience'
import { getProjectReadiness } from '@/lib/ui/readiness'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { getProjectById } from '@/lib/data/projects'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'
import { createPageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { GenerateAnalysisButton } from '@/components/projects/GenerateAnalysisButton'
import Link from 'next/link'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'
import type { SearchParams } from '@/lib/routing/searchParams'
import { getParam } from '@/lib/routing/searchParams'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/layout/Section'

interface OverviewPageProps {
  params: Promise<{
    projectId: string
  }>
  searchParams?: SearchParams
}

export async function generateMetadata(props: OverviewPageProps): Promise<Metadata> {
  const params = await props.params
  return createPageMetadata({
    title: "Overview — Plinth",
    description:
      "View project status, readiness checklist, and next actions for your competitive analysis project.",
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
  const params = await props.params
  const projectId = params.projectId
  const isGenerating = getParam(props.searchParams, 'generating') === 'true'
  const viewResults = getParam(props.searchParams, 'view') === 'results'

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

  // Compute readiness
  const readiness = getProjectReadiness(project, competitors)

  // Determine primary CTA action based on readiness
  const primaryCTA = readiness.nextAction

  // Show AnalysisRunExperience if generating and not explicitly viewing results
  if (isGenerating && !viewResults) {
    return <AnalysisRunExperience projectId={projectId} />
  }

  // Build primary action for header
  const primaryAction = primaryCTA.type === 'generate_analysis' && readiness.allComplete ? (
    <GenerateAnalysisButton
      projectId={projectId}
      label={primaryCTA.label}
      canGenerate={readiness.allComplete}
      missingReasons={
        readiness.allComplete
          ? []
          : readiness.items
              .filter((item) => item.status === 'incomplete')
              .map((item) => item.label)
      }
    />
  ) : (
    <Button asChild variant={primaryCTA.type === 'edit_project' ? 'outline' : 'default'}>
      <Link
        href={
          primaryCTA.href === '/competitors'
            ? `/projects/${projectId}/competitors`
            : primaryCTA.href === '/projects'
            ? `/dashboard`
            : primaryCTA.href === '/overview'
            ? `/projects/${projectId}/overview`
            : primaryCTA.href.startsWith('/')
            ? `/projects/${projectId}${primaryCTA.href}`
            : primaryCTA.href
        }
      >
        {primaryCTA.label}
      </Link>
    </Button>
  )

  return (
    <PageShell>
      <PageHeader
        title="Project Overview"
        subtitle="Review project status, readiness, and next actions"
        primaryAction={primaryAction}
      />

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
        {/* Left column: Main content */}
        <div className="space-y-6">
          {/* Project Summary & Recent Outputs */}
          <Section>
            <ProjectOverview
              project={project}
              projectId={projectId}
              hasArtifacts={hasAnyArtifacts}
              generatedAt={generatedAt}
              opportunitiesV3={opportunitiesV3?.content}
              opportunitiesV2={opportunitiesV2?.content}
            />
          </Section>

          {/* Readiness Checklist */}
          <Section>
            <ReadinessChecklist
              items={readiness.items}
              projectId={projectId}
            />
          </Section>

          {/* Workflow Timeline */}
          <Section>
            <WorkflowTimeline readinessItems={readiness.items} />
          </Section>
        </div>

        {/* Right column: Actions panel (desktop only) */}
        <ProjectActionsPanel
          projectId={projectId}
          readiness={readiness}
          competitorCount={competitorCount}
          effectiveCompetitorCount={effectiveCompetitorCount}
          hasArtifacts={hasAnyArtifacts}
        />
      </div>
    </PageShell>
  )
}

