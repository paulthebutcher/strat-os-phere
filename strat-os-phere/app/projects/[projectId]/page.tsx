import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { AppShell } from '@/components/layout/AppShell'
import { ProjectOverview } from '@/components/projects/ProjectOverview'
import { ReadinessChecklist } from '@/components/projects/ReadinessChecklist'
import { WorkflowTimeline } from '@/components/projects/WorkflowTimeline'
import { ProjectActionsPanel } from '@/components/projects/ProjectActionsPanel'
import { getProjectReadiness } from '@/lib/ui/readiness'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { getProjectById } from '@/lib/data/projects'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'
import { createPageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { GenerateResultsV2Button } from '@/components/results/GenerateResultsV2Button'
import Link from 'next/link'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'

interface ProjectPageProps {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata(props: ProjectPageProps): Promise<Metadata> {
  const params = await props.params
  return createPageMetadata({
    title: "Project Overview — Plinth",
    description:
      "View project status, readiness checklist, and next actions for your competitive analysis project.",
    path: `/projects/${params.projectId}`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

export default async function ProjectPage(props: ProjectPageProps) {
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

  if (!project) {
    notFound()
  }

  if (project.user_id !== user.id) {
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

  return (
    <AppShell
      projectId={projectId}
      projectName={project.name}
      projectMarket={project.market}
      hasArtifacts={hasAnyArtifacts}
      competitorCount={competitorCount}
      effectiveCompetitorCount={effectiveCompetitorCount}
    >
      <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
        <main className="flex w-full max-w-7xl flex-col gap-8 py-10">
          {/* Header */}
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Project Overview
            </h1>
            <p className="text-sm text-muted-foreground">
              Review project status, readiness, and next actions
            </p>
          </header>

          {/* Main content grid */}
          <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
            {/* Left column: Main content */}
            <div className="space-y-6">
              {/* Project Summary & Recent Outputs */}
              <ProjectOverview
                project={project}
                projectId={projectId}
                hasArtifacts={hasAnyArtifacts}
                generatedAt={generatedAt}
                opportunitiesV3={opportunitiesV3?.content}
                opportunitiesV2={opportunitiesV2?.content}
              />

              {/* Readiness Checklist */}
              <ReadinessChecklist
                items={readiness.items}
                projectId={projectId}
              />

              {/* Workflow Timeline */}
              <WorkflowTimeline readinessItems={readiness.items} />

              {/* Primary Next Action CTA */}
              <div className="panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      {primaryCTA.type === 'add_competitors' && 'Ready to add competitors'}
                      {primaryCTA.type === 'generate_evidence' && 'Ready to add evidence'}
                      {primaryCTA.type === 'generate_analysis' && 'Ready to generate analysis'}
                      {primaryCTA.type === 'edit_project' && 'Complete project setup'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {primaryCTA.type === 'add_competitors' && 
                        `Add at least ${MIN_COMPETITORS_FOR_ANALYSIS} competitors to begin analysis.`}
                      {primaryCTA.type === 'generate_evidence' &&
                        'Add evidence to competitors to improve analysis quality.'}
                      {primaryCTA.type === 'generate_analysis' &&
                        'All requirements met. Generate your competitive analysis.'}
                      {primaryCTA.type === 'edit_project' &&
                        'Complete project basics to get started.'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {primaryCTA.type === 'generate_analysis' && readiness.allComplete ? (
                      <GenerateResultsV2Button
                        projectId={projectId}
                        label={primaryCTA.label}
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
                    )}
                  </div>
                </div>
              </div>
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
        </main>
      </div>
    </AppShell>
  )
}

