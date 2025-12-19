import { notFound } from 'next/navigation'

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

interface CompetitorsPageProps {
  params: Promise<{
    projectId: string
  }>
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

  const competitors = await listCompetitorsForProject(supabase, projectId)
  const competitorCount = competitors.length
  const hasCompetitors = competitorCount > 0
  const readyForAnalysis = competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS
  const remainingToReady = Math.max(
    0,
    MIN_COMPETITORS_FOR_ANALYSIS - competitorCount
  )

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
      <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
        <header className="flex flex-col gap-4 border-b border-border-subtle pb-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-text-muted">
              Step 2 · Competitors
            </p>
            <h1>{project.name}</h1>
            <p className="text-sm text-text-secondary">
              Add real alternatives so StratOSphere can generate a sharp,
              exec-ready landscape summary.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 text-left md:items-end md:text-right">
              <div className="text-xs text-text-secondary">
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
          <section className="panel flex flex-col gap-4 p-6">
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">Add competitors to map the landscape</h2>
              <p className="text-sm text-text-secondary">
                Add a handful of real alternatives so the analysis has something concrete to compare against.
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
                <li>Add 3–7 competitors</li>
                <li>Paste public website text (homepage/pricing/trust)</li>
                <li>Generate exec-ready insights</li>
              </ul>
            </div>
            <CompetitorForm
              projectId={projectId}
              existingCount={competitorCount}
            />
          </section>
        ) : competitorCount >= MAX_COMPETITORS_PER_PROJECT ? (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
            <div className="panel px-6 py-5">
              <p className="text-sm text-text-secondary">
                Max {MAX_COMPETITORS_PER_PROJECT} competitors for this analysis.
              </p>
            </div>
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-text-secondary">
                  Current competitors
                </h2>
              </div>
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
                  <p className="text-sm text-text-secondary">
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
  )
}

