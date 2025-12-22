import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { AppShell } from '@/components/layout/AppShell'
import { CompetitorCard } from '@/components/competitors/CompetitorCard'
import { CompetitorForm } from '@/components/competitors/CompetitorForm'
import { GenerateAnalysisButton } from '@/components/competitors/GenerateAnalysisButton'
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
import { SkeletonTable } from '@/components/shared/Skeletons'
import { DataRecencyNote } from '@/components/shared/DataRecencyNote'
import { EmptyState } from '@/components/shared/EmptyState'
import Link from 'next/link'

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
    <AppShell
      projectId={projectId}
      projectName={project.name}
      projectMarket={project.market}
      hasArtifacts={hasAnyArtifacts}
      competitorCount={competitorCount}
      effectiveCompetitorCount={effectiveCompetitorCount}
    >
      <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
        <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
        <header className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Step 2 · Competitors
            </p>
            <h1>{project.name}</h1>
            <p className="text-sm text-text-secondary">
              Add real alternatives so Plinth can generate a sharp,
              exec-ready landscape summary.
            </p>
            <p className="text-xs text-muted-foreground">
              <Link href="/help#competitors" className="text-primary underline hover:text-primary/80">
                Need help?
              </Link>
            </p>
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

        {competitorCount === 0 ? (
          <section className="space-y-6">
            <EmptyState
              title="Add competitors to map the landscape"
              description="Add a handful of real alternatives so the analysis has something concrete to compare against."
              footer={
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground text-left" role="list">
                  <li>Add 3–7 competitors</li>
                  <li>Paste public website text (homepage/pricing/trust)</li>
                  <li>Generate exec-ready insights</li>
                </ul>
              }
            />
            <div className="panel p-6">
              <CompetitorForm
                projectId={projectId}
                existingCount={competitorCount}
              />
            </div>
          </section>
        ) : competitorCount >= MAX_COMPETITORS_PER_PROJECT ? (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
            <div className="panel px-6 py-5">
              <p className="text-sm text-muted-foreground">
                Max {MAX_COMPETITORS_PER_PROJECT} competitors for this analysis.
              </p>
            </div>
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-text-secondary">
                  Current competitors
                </h2>
              </div>
              {/* Note: Loading skeletons would be added here if competitors were loaded asynchronously */}
              <div className="panel divide-y divide-border-subtle">
                {competitors.map((competitor, index) => (
                  <CompetitorCard
                    key={competitor.id}
                    projectId={projectId}
                    competitor={competitor}
                    index={index}
                    total={competitorCount}
                  />
                ))}
              </div>
            </section>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
            <div className="space-y-6">
              {competitorCount > 0 && competitorCount < MIN_COMPETITORS_FOR_ANALYSIS && (
                <div className="panel px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Add {remainingToReady} more to generate
                  </p>
                </div>
              )}
              <CompetitorForm
                projectId={projectId}
                existingCount={competitorCount}
              />
            </div>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-text-secondary">
                  Current competitors
                </h2>
              </div>
              {/* Note: Loading skeletons would be added here if competitors were loaded asynchronously */}
              <div className="panel divide-y divide-border-subtle">
                {competitors.map((competitor, index) => (
                  <CompetitorCard
                    key={competitor.id}
                    projectId={projectId}
                    competitor={competitor}
                    index={index}
                    total={competitorCount}
                  />
                ))}
              </div>
            </section>
          </section>
        )}
      </main>
      </div>
    </AppShell>
  )
}

