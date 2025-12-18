import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CopySectionButton } from '@/components/results/CopySectionButton'
import { RegenerateButton } from '@/components/results/RegenerateButton'
import { Button } from '@/components/ui/button'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { getProjectById } from '@/lib/data/projects'
import {
  normalizeResultsArtifacts,
  formatProfilesToMarkdown,
  formatThemesToMarkdown,
  formatPositioningToMarkdown,
  formatOpportunitiesToMarkdown,
  formatAnglesToMarkdown,
  type NormalizedProfilesArtifact,
  type NormalizedSynthesisArtifact,
} from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'

type TabId = 'profiles' | 'themes' | 'positioning' | 'opportunities' | 'angles'

const TABS: { id: TabId; label: string }[] = [
  { id: 'profiles', label: 'Profiles' },
  { id: 'themes', label: 'Themes' },
  { id: 'positioning', label: 'Positioning' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'angles', label: 'Angles' },
]

interface ResultsPageProps {
  params: Promise<{
    projectId: string
  }>
  searchParams?: Promise<{
    tab?: string
  }>
}

export default async function ResultsPage(props: ResultsPageProps) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams ?? Promise.resolve({}),
  ])

  const projectId = params.projectId
  const tabParam =
    (searchParams as {
      tab?: string
    }).tab ?? undefined

  const activeTab: TabId =
    (TABS.find((tab) => tab.id === tabParam)?.id as TabId | undefined) ??
    'profiles'

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
  const { profiles, synthesis, runId, generatedAt } = normalized
  const hasAnyArtifacts = Boolean(profiles || synthesis)
  const effectiveCompetitorCount =
    normalized.competitorCount ?? competitorCount

  const formattedGeneratedAt = generatedAt
    ? new Date(generatedAt).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  const profilesMarkdown = formatProfilesToMarkdown(profiles?.snapshots)
  const themesMarkdown = formatThemesToMarkdown(synthesis?.synthesis)
  const positioningMarkdown = formatPositioningToMarkdown(synthesis?.synthesis)
  const opportunitiesMarkdown = formatOpportunitiesToMarkdown(
    synthesis?.synthesis
  )
  const anglesMarkdown = formatAnglesToMarkdown(synthesis?.synthesis)

  const copyContent =
    activeTab === 'profiles'
      ? profilesMarkdown
      : activeTab === 'themes'
      ? themesMarkdown
      : activeTab === 'positioning'
      ? positioningMarkdown
      : activeTab === 'opportunities'
      ? opportunitiesMarkdown
      : anglesMarkdown

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
        <header className="flex flex-col gap-4 border-b border-border pb-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Module 1 · Competitive & landscape scan
            </p>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">
              AI-generated analysis based on your curated competitors and pasted
              evidence.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>
                Competitors:{' '}
                <span className="font-medium">
                  {effectiveCompetitorCount.toString()}
                </span>
              </span>
              {formattedGeneratedAt ? (
                <span>
                  Last generated:{' '}
                  <span className="font-medium">{formattedGeneratedAt}</span>
                </span>
              ) : (
                <span>Not generated yet</span>
              )}
              {runId ? (
                <span className="hidden sm:inline">
                  Run ID:{' '}
                  <span className="font-mono text-[11px]">{runId}</span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 text-left md:items-end md:text-right">
            <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Link
                href="/dashboard"
                className="underline-offset-4 hover:underline"
              >
                Dashboard
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                href={`/projects/${project.id}`}
                className="underline-offset-4 hover:underline"
              >
                Overview
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                href={`/projects/${project.id}/competitors`}
                className="underline-offset-4 hover:underline"
              >
                Competitors
              </Link>
            </nav>

            {hasAnyArtifacts ? (
              <RegenerateButton
                projectId={project.id}
                competitorCount={effectiveCompetitorCount}
              />
            ) : null}
          </div>
        </header>

        {!hasAnyArtifacts ? (
          <section className="panel flex flex-col gap-4 p-6">
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                No results yet
              </h2>
              <p className="text-sm text-muted-foreground">
                {competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS
                  ? 'Run an analysis to see profiles, themes, and opportunities here.'
                  : `Add at least ${MIN_COMPETITORS_FOR_ANALYSIS} competitors to generate analysis.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS ? (
                <RegenerateButton
                  projectId={project.id}
                  label="Generate analysis"
                  competitorCount={effectiveCompetitorCount}
                />
              ) : (
                <Button asChild type="button" size="sm">
                  <Link href={`/projects/${project.id}/competitors`}>
                    Add competitors
                  </Link>
                </Button>
              )}
              <Button
                asChild
                type="button"
                size="sm"
                variant="ghost"
                className="px-2"
              >
                <Link href={`/projects/${project.id}/competitors`}>
                  {competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS
                    ? 'Back to competitors'
                    : 'Go to competitors'}
                </Link>
              </Button>
            </div>
          </section>
        ) : (
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <nav
                className="tabs-list"
                aria-label="Module 1 analysis sections"
              >
                {TABS.map((tab) => (
                  <Link
                    key={tab.id}
                    href={`/projects/${project.id}/results?tab=${tab.id}`}
                    className="tabs-trigger"
                    data-state={activeTab === tab.id ? 'active' : 'inactive'}
                  >
                    {tab.label}
                  </Link>
                ))}
              </nav>
              <CopySectionButton content={copyContent} label="Copy" />
            </div>

            {activeTab === 'profiles' ? (
              <ProfilesSection profiles={profiles} />
            ) : null}
            {activeTab === 'themes' ? (
              <ThemesSection synthesis={synthesis} />
            ) : null}
            {activeTab === 'positioning' ? (
              <PositioningSection synthesis={synthesis} />
            ) : null}
            {activeTab === 'opportunities' ? (
              <OpportunitiesSection synthesis={synthesis} />
            ) : null}
            {activeTab === 'angles' ? (
              <AnglesSection synthesis={synthesis} />
            ) : null}
          </section>
        )}
      </main>
    </div>
  )
}

interface ProfilesSectionProps {
  profiles: NormalizedProfilesArtifact | null
}

function ProfilesSection({ profiles }: ProfilesSectionProps) {
  if (!profiles || profiles.snapshots.length === 0) {
    return (
      <section className="panel p-5 text-sm text-muted-foreground">
        <p>No competitor profiles are available yet for this project.</p>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      {profiles.snapshots.map((snapshot, index) => (
        <article key={`${snapshot.competitor_name}-${index}`} className="panel p-4">
          <header className="mb-3 space-y-1">
            <h2 className="text-sm font-semibold">
              {snapshot.competitor_name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {snapshot.positioning_one_liner}
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 text-sm">
              <SnapshotList
                title="Key value props"
                items={snapshot.key_value_props}
              />
              <SnapshotList
                title="Notable capabilities"
                items={snapshot.notable_capabilities}
              />
              <SnapshotList
                title="Business model signals"
                items={snapshot.business_model_signals}
              />
              <SnapshotList
                title="Risks & unknowns"
                items={snapshot.risks_and_unknowns}
              />
            </div>

            <div className="space-y-3 text-sm">
              {snapshot.proof_points?.length ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Proof points
                  </h3>
                  <ul className="mt-2 space-y-2 text-xs">
                    {snapshot.proof_points.map((proof, proofIndex) => (
                      <li key={proofIndex}>
                        <p className="font-medium">{proof.claim}</p>
                        <p className="mt-1 italic text-muted-foreground">
                          “{proof.evidence_quote}”
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Confidence: {proof.confidence}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}

interface SnapshotListProps {
  title: string
  items: string[] | null | undefined
}

function SnapshotList({ title, items }: SnapshotListProps) {
  if (!items || items.length === 0) return null

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

interface SynthesisSectionProps {
  synthesis: NormalizedSynthesisArtifact | null
}

function ThemesSection({ synthesis }: SynthesisSectionProps) {
  const value = synthesis?.synthesis

  if (!value) {
    return (
      <section className="panel p-5 text-sm text-muted-foreground">
        <p>No themes are available yet for this project.</p>
      </section>
    )
  }

  const { market_summary, themes } = value

  return (
    <section className="space-y-4">
      <article className="panel p-4">
        <h2 className="text-sm font-semibold">
          {market_summary.headline}
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              What is changing
            </h3>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
              {market_summary.what_is_changing.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              What buyers care about
            </h3>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
              {market_summary.what_buyers_care_about.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </article>

      {themes?.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {themes.map((theme, index) => (
            <article key={index} className="panel p-4">
              <h3 className="text-sm font-semibold">{theme.theme}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {theme.description}
              </p>
              {theme.competitors_supporting?.length ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Competitors supporting:{' '}
                  <span className="font-medium">
                    {theme.competitors_supporting.join(', ')}
                  </span>
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function PositioningSection({ synthesis }: SynthesisSectionProps) {
  const value = synthesis?.synthesis

  if (!value) {
    return (
      <section className="panel p-5 text-sm text-muted-foreground">
        <p>No positioning analysis is available yet for this project.</p>
      </section>
    )
  }

  const { positioning_map_text, clusters } = value

  return (
    <section className="space-y-4">
      <article className="panel p-4">
        <h2 className="text-sm font-semibold">Positioning map</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Axes:{' '}
          <span className="font-medium">
            {positioning_map_text.axis_x} (x) · {positioning_map_text.axis_y}{' '}
            (y)
          </span>
        </p>
        {positioning_map_text.quadrants?.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {positioning_map_text.quadrants.map((quadrant, index) => (
              <li key={index} className="rounded-md bg-muted px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  {quadrant.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Competitors:{' '}
                  <span className="font-medium">
                    {quadrant.competitors.join(', ')}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {quadrant.notes}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </article>

      {clusters?.length ? (
        <article className="panel p-4">
          <h2 className="text-sm font-semibold">Clusters</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {clusters.map((cluster, index) => (
              <li key={index} className="rounded-md bg-muted px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  {cluster.cluster_name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Who is in it:{' '}
                  <span className="font-medium">
                    {cluster.who_is_in_it.join(', ')}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {cluster.cluster_logic}
                </p>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  )
}

function OpportunitiesSection({ synthesis }: SynthesisSectionProps) {
  const value = synthesis?.synthesis

  if (!value || !value.opportunities?.length) {
    return (
      <section className="panel p-5 text-sm text-muted-foreground">
        <p>No opportunities are available yet for this project.</p>
      </section>
    )
  }

  const opportunities = [...value.opportunities].sort(
    (a, b) => a.priority - b.priority
  )

  return (
    <section className="space-y-3">
      {opportunities.map((opportunity, index) => (
        <article key={index} className="panel p-4">
          <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">
              {opportunity.opportunity}
            </h2>
            <span className="text-xs text-muted-foreground">
              Priority {opportunity.priority}
            </span>
          </header>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Who it serves:</span>{' '}
              {opportunity.who_it_serves}
            </p>
            <p>
              <span className="font-medium">Why now:</span>{' '}
              {opportunity.why_now}
            </p>
            <p>
              <span className="font-medium">Why competitors miss it:</span>{' '}
              {opportunity.why_competitors_miss_it}
            </p>
            <p>
              <span className="font-medium">Suggested angle:</span>{' '}
              {opportunity.suggested_angle}
            </p>
            <p>
              <span className="font-medium">Risk or assumption:</span>{' '}
              {opportunity.risk_or_assumption}
            </p>
          </div>
        </article>
      ))}
    </section>
  )
}

function AnglesSection({ synthesis }: SynthesisSectionProps) {
  const value = synthesis?.synthesis

  if (
    !value ||
    !value.recommended_differentiation_angles?.length
  ) {
    return (
      <section className="panel p-5 text-sm text-muted-foreground">
        <p>No differentiation angles are available yet for this project.</p>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      {value.recommended_differentiation_angles.map((angle, index) => (
        <article key={index} className="panel p-4">
          <h2 className="text-sm font-semibold">{angle.angle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {angle.what_to_claim}
          </p>

          {angle.how_to_prove?.length ? (
            <div className="mt-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                How to prove
              </h3>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                {angle.how_to_prove.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {angle.watch_out_for?.length ? (
            <div className="mt-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Watch out for
              </h3>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                {angle.watch_out_for.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      ))}
    </section>
  )
}

