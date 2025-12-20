import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CopySectionButton } from '@/components/results/CopySectionButton'
import { RegenerateButton } from '@/components/results/RegenerateButton'
import { GenerateResultsV2Button } from '@/components/results/GenerateResultsV2Button'
import { CompetitorScoreBarChart } from '@/components/results/CompetitorScoreBarChart'
import { ArtifactsDebugPanel } from '@/components/results/ArtifactsDebugPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { getProjectById } from '@/lib/data/projects'
import type { JtbdArtifactContent } from '@/lib/schemas/jtbd'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import type { ScoringMatrixArtifactContent } from '@/lib/schemas/scoring'
import {
  normalizeResultsArtifacts,
  formatProfilesToMarkdown,
  formatThemesToMarkdown,
  formatPositioningToMarkdown,
  formatOpportunitiesToMarkdown,
  formatAnglesToMarkdown,
  formatJtbdToMarkdown,
  formatOpportunitiesV2ToMarkdown,
  formatScoringMatrixToMarkdown,
  type NormalizedProfilesArtifact,
  type NormalizedSynthesisArtifact,
} from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'

type TabId =
  | 'profiles'
  | 'themes'
  | 'positioning'
  | 'opportunities'
  | 'angles'
  | 'jobs'
  | 'scorecard'
  | 'opportunities_v2'

const TABS: { id: TabId; label: string }[] = [
  { id: 'profiles', label: 'Profiles' },
  { id: 'themes', label: 'Themes' },
  { id: 'positioning', label: 'Positioning' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'angles', label: 'Angles' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'scorecard', label: 'Scorecard' },
  { id: 'opportunities_v2', label: 'Opportunities' },
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
  const {
    profiles,
    synthesis,
    jtbd,
    opportunitiesV2,
    scoringMatrix,
    runId,
    generatedAt,
  } = normalized
  const hasAnyArtifacts = Boolean(
    profiles || synthesis || jtbd || opportunitiesV2 || scoringMatrix
  )
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
  const jtbdMarkdown = formatJtbdToMarkdown(jtbd?.content)
  const opportunitiesV2Markdown = formatOpportunitiesV2ToMarkdown(
    opportunitiesV2?.content
  )
  const scoringMarkdown = formatScoringMatrixToMarkdown(scoringMatrix?.content)

  const copyContent =
    activeTab === 'profiles'
      ? profilesMarkdown
      : activeTab === 'themes'
      ? themesMarkdown
      : activeTab === 'positioning'
      ? positioningMarkdown
      : activeTab === 'opportunities'
      ? opportunitiesMarkdown
      : activeTab === 'angles'
      ? anglesMarkdown
      : activeTab === 'jobs'
      ? jtbdMarkdown
      : activeTab === 'opportunities_v2'
      ? opportunitiesV2Markdown
      : scoringMarkdown

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
      <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
        <header className="flex flex-col gap-4 border-b border-border-subtle pb-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-text-muted">
              Module 1 · Competitive & landscape scan
            </p>
            <h1>{project.name}</h1>
            <p className="text-sm text-text-secondary">
              AI-generated analysis based on your curated competitors and pasted
              evidence.
            </p>
            <p className="text-xs text-text-muted italic">
              Insights are based on publicly available information from the last 90 days, including marketing sites, reviews, pricing pages, changelogs, and documentation.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
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
            <nav className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
              <Link
                href="/dashboard"
                className="underline-offset-4 hover:text-text-primary hover:underline transition-colors"
              >
                Dashboard
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                href={`/projects/${project.id}`}
                className="underline-offset-4 hover:text-text-primary hover:underline transition-colors"
              >
                Overview
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                href={`/projects/${project.id}/competitors`}
                className="underline-offset-4 hover:text-text-primary hover:underline transition-colors"
              >
                Competitors
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              {hasAnyArtifacts && competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS ? (
                <RegenerateButton
                  projectId={project.id}
                  competitorCount={effectiveCompetitorCount}
                  label="Regenerate Results"
                />
              ) : null}
              {!hasAnyArtifacts && competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS ? (
                <GenerateResultsV2Button projectId={project.id} label="Generate Results" />
              ) : null}
            </div>
            {jtbd || opportunitiesV2 || scoringMatrix ? (
              <p className="text-xs text-text-secondary">
                Results v2 last generated:{' '}
                <span className="font-medium">
                  {formattedGeneratedAt || 'Unknown'}
                </span>
              </p>
            ) : null}
            <ArtifactsDebugPanel projectId={project.id} />
          </div>
        </header>

        {!hasAnyArtifacts ? (
          <section className="panel flex flex-col gap-4 p-6">
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">
                No results yet
              </h2>
              <p className="text-sm text-text-secondary">
                {competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS
                  ? 'Run an analysis to see profiles, themes, and opportunities here.'
                  : `Add at least ${MIN_COMPETITORS_FOR_ANALYSIS} competitors to generate analysis.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS ? (
                <GenerateResultsV2Button
                  projectId={project.id}
                  label="Generate Results"
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
            {/* Recommended Next Steps Panel */}
            {opportunitiesV2?.content?.opportunities &&
            opportunitiesV2.content.opportunities.length > 0 ? (
              <RecommendedNextStepsPanel
                opportunities={opportunitiesV2.content}
                projectId={project.id}
              />
            ) : null}

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
            {activeTab === 'jobs' ? (
              <JtbdSection jtbd={jtbd?.content} projectId={project.id} />
            ) : null}
            {activeTab === 'scorecard' ? (
              <ScoringSection scoring={scoringMatrix?.content} projectId={project.id} />
            ) : null}
            {activeTab === 'opportunities_v2' ? (
              <OpportunitiesV2Section
                opportunities={opportunitiesV2?.content}
                projectId={project.id}
              />
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
      <section className="panel p-5 text-sm text-text-secondary">
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
            <p className="text-sm text-text-secondary">
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
              {snapshot.customer_struggles && snapshot.customer_struggles.length > 0 ? (
                <SnapshotList
                  title="What customers struggle with today"
                  items={snapshot.customer_struggles}
                />
              ) : null}
            </div>

            <div className="space-y-3 text-sm">
              {snapshot.proof_points?.length ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Proof points
                  </h3>
                  <ul className="mt-2 space-y-2 text-xs">
                    {snapshot.proof_points.map((proof, proofIndex) => (
                      <li key={proofIndex}>
                        <p className="font-medium">{proof.claim}</p>
            <p className="mt-1 italic text-text-secondary">
              "{proof.evidence_quote}"
            </p>
            <p className="mt-1 text-[11px] text-text-muted">
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
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
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
      <section className="panel p-5 text-sm text-text-secondary">
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
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              What is changing
            </h3>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
              {market_summary.what_is_changing.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
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
              <p className="mt-1 text-sm text-text-secondary">
                {theme.description}
              </p>
              {theme.competitors_supporting?.length ? (
                <p className="mt-2 text-xs text-text-secondary">
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
      <section className="panel p-5 text-sm text-text-secondary">
        <p>No positioning analysis is available yet for this project.</p>
      </section>
    )
  }

  const { positioning_map_text, clusters } = value

  return (
    <section className="space-y-4">
      <article className="panel p-4">
        <h2 className="text-sm font-semibold">Positioning map</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Axes:{' '}
          <span className="font-medium">
            {positioning_map_text.axis_x} (x) · {positioning_map_text.axis_y}{' '}
            (y)
          </span>
        </p>
        {positioning_map_text.quadrants?.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {positioning_map_text.quadrants.map((quadrant, index) => (
              <li key={index} className="rounded-md bg-surface-muted px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  {quadrant.name}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  Competitors:{' '}
                  <span className="font-medium">
                    {quadrant.competitors.join(', ')}
                  </span>
                </p>
                <p className="mt-1 text-xs text-text-secondary">
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
              <li key={index} className="rounded-md bg-surface-muted px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  {cluster.cluster_name}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  Who is in it:{' '}
                  <span className="font-medium">
                    {cluster.who_is_in_it.join(', ')}
                  </span>
                </p>
                <p className="mt-1 text-xs text-text-secondary">
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
      <section className="panel p-5 text-sm text-text-secondary">
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
            <span className="text-xs text-text-secondary">
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
      <section className="panel p-5 text-sm text-text-secondary">
        <p>No differentiation angles are available yet for this project.</p>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      {value.recommended_differentiation_angles.map((angle, index) => (
        <article key={index} className="panel p-4">
          <h2 className="text-sm font-semibold">{angle.angle}</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {angle.what_to_claim}
          </p>

          {angle.how_to_prove?.length ? (
            <div className="mt-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
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
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
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

interface RecommendedNextStepsPanelProps {
  opportunities: OpportunitiesArtifactContent
  projectId: string
}

function RecommendedNextStepsPanel({
  opportunities,
  projectId,
}: RecommendedNextStepsPanelProps) {
  // Get top 2 opportunities by score
  const topOpportunities = [...opportunities.opportunities]
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)

  if (topOpportunities.length === 0) return null

  const panelContent = [
    '# Recommended Next Steps',
    '',
    ...topOpportunities.map((opp, index) => {
      const lines = [
        `## ${opp.title} (Score: ${opp.score}/100)`,
        '',
      ]
      if (opp.first_experiments && opp.first_experiments.length > 0) {
        lines.push('First experiments:')
        opp.first_experiments.slice(0, 3).forEach((exp) => {
          lines.push(`- ${exp}`)
        })
      }
      return lines.join('\n')
    }),
  ].join('\n\n')

  return (
    <article className="panel p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold">Recommended next steps</h2>
          <p className="mt-1 text-xs text-text-secondary">
            Top opportunities to start working on now
          </p>
        </div>
        <CopySectionButton content={panelContent} label="Copy" />
      </div>
      <div className="space-y-4">
        {topOpportunities.map((opp, index) => (
          <div key={index} className="border-b border-border-subtle pb-4 last:border-b-0 last:pb-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold">{opp.title}</h3>
              <Badge variant="primary">{opp.score}/100</Badge>
            </div>
            {opp.first_experiments && opp.first_experiments.length > 0 ? (
              <ul className="list-disc space-y-1 pl-4 text-xs">
                {opp.first_experiments.slice(0, 3).map((exp, expIndex) => (
                  <li key={expIndex}>{exp}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  )
}

interface JtbdSectionProps {
  jtbd: JtbdArtifactContent | null | undefined
  projectId: string
}

function JtbdSection({ jtbd, projectId }: JtbdSectionProps) {
  if (!jtbd || !jtbd.jobs?.length) {
    return (
      <section className="panel p-5 space-y-3">
        <div className="text-sm text-text-secondary">
          <p>No Jobs To Be Done are available yet for this project.</p>
        </div>
        <GenerateResultsV2Button
          projectId={projectId}
          label="Generate Results v2"
        />
      </section>
    )
  }

  // Sort by opportunity_score descending
  const sorted = [...jtbd.jobs].sort(
    (a, b) => b.opportunity_score - a.opportunity_score
  )

  return (
    <section className="space-y-4">
      {/* Explainer */}
      <div className="panel p-3 bg-muted/50 border-border">
        <p className="text-xs text-text-secondary">
          <strong>Jobs To Be Done (JTBD)</strong> describe the specific tasks customers need to accomplish. Each job includes measurable outcomes and an opportunity score based on importance and current satisfaction. Use these to prioritize features and validate solutions.
        </p>
      </div>
      {sorted.map((job, index) => (
        <article key={index} className="panel p-4">
          <header className="mb-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-sm font-semibold">{job.job_statement}</h2>
              <Badge variant="primary" className="shrink-0">
                Score: {job.opportunity_score}/100
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
              <span>
                <span className="font-medium">Who:</span> {job.who}
              </span>
              <span>·</span>
              <span>
                <span className="font-medium">Frequency:</span> {job.frequency}
              </span>
              <span>·</span>
              <span>
                <span className="font-medium">Importance:</span> {job.importance_score}/5
              </span>
              <span>·</span>
              <span>
                <span className="font-medium">Satisfaction:</span> {job.satisfaction_score}/5
              </span>
            </div>
          </header>

          <div className="space-y-3 text-sm">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Context
              </h3>
              <p className="mt-1">{job.context}</p>
            </div>

            {job.desired_outcomes?.length ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Desired Outcomes
                </h3>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                  {job.desired_outcomes.map((outcome, outcomeIndex) => (
                    <li key={outcomeIndex}>{outcome}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {job.constraints?.length ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Constraints
                </h3>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                  {job.constraints.map((constraint, constraintIndex) => (
                    <li key={constraintIndex}>{constraint}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {job.current_workarounds?.length ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Current Workarounds
                </h3>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                  {job.current_workarounds.map((workaround, workaroundIndex) => (
                    <li key={workaroundIndex}>{workaround}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {job.non_negotiables?.length ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Non-negotiables
                </h3>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                  {job.non_negotiables.map((nonNegotiable, nonNegotiableIndex) => (
                    <li key={nonNegotiableIndex}>{nonNegotiable}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {job.evidence?.length ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Evidence
                </h3>
                <ul className="mt-1 space-y-1 text-xs">
                  {job.evidence.map((ev, evIndex) => (
                    <li key={evIndex}>
                      {ev.competitor && (
                        <span className="font-medium">{ev.competitor}</span>
                      )}
                      {ev.citation && (
                        <span className="ml-1 text-text-secondary">
                          {' '}
                          (<a
                            href={ev.citation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            source
                          </a>)
                        </span>
                      )}
                      {ev.quote && (
                        <p className="mt-1 italic text-text-secondary">
                          "{ev.quote}"
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  )
}

interface OpportunitiesV2SectionProps {
  opportunities: OpportunitiesArtifactContent | null | undefined
  projectId: string
}

function OpportunitiesV2Section({ opportunities, projectId }: OpportunitiesV2SectionProps) {
  if (!opportunities || !opportunities.opportunities?.length) {
    return (
      <section className="panel p-5 space-y-3">
        <div className="text-sm text-text-secondary">
          <p>No opportunities are available yet for this project.</p>
        </div>
        <GenerateResultsV2Button
          projectId={projectId}
          label="Generate Results v2"
        />
      </section>
    )
  }

  // Sort by score descending
  const sorted = [...opportunities.opportunities].sort(
    (a, b) => b.score - a.score
  )

  return (
    <section className="space-y-4">
      {/* Explainer */}
      <div className="panel p-3 bg-muted/50 border-border">
        <p className="text-xs text-text-secondary">
          <strong>Differentiation Opportunities</strong> are ranked by score (impact, effort, confidence, and linked job importance). Each opportunity includes first experiments—concrete tests you can run in 1–2 weeks to validate the idea before committing to a full build.
        </p>
      </div>
      {sorted.map((opp, index) => (
        <article key={index} className="panel p-4">
          <header className="mb-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-sm font-semibold">{opp.title}</h2>
              <Badge variant="primary" className="shrink-0">
                Score: {opp.score}/100
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
              <Badge variant="secondary">{opp.type.replace('_', ' ')}</Badge>
              <Badge variant={opp.impact === 'high' ? 'success' : opp.impact === 'med' ? 'warning' : 'default'}>
                Impact: {opp.impact}
              </Badge>
              <Badge variant={opp.effort === 'S' ? 'success' : opp.effort === 'M' ? 'warning' : 'default'}>
                Effort: {opp.effort}
              </Badge>
              <Badge variant={opp.confidence === 'high' ? 'success' : opp.confidence === 'med' ? 'warning' : 'default'}>
                Confidence: {opp.confidence}
              </Badge>
            </div>
            <p className="text-sm">
              <span className="font-medium">Who it serves:</span> {opp.who_it_serves}
            </p>
          </header>

          <div className="space-y-3 text-sm">
            {opp.why_now ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Why Now
                </h3>
                <p className="mt-1">{opp.why_now}</p>
              </div>
            ) : null}

            {opp.how_to_win?.length ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  How to Win
                </h3>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                  {opp.how_to_win.map((tactic, tacticIndex) => (
                    <li key={tacticIndex}>{tactic}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {opp.what_competitors_do_today ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  What Competitors Do Today
                </h3>
                <p className="mt-1">{opp.what_competitors_do_today}</p>
              </div>
            ) : null}

            {opp.why_they_cant_easily_copy ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Why They Can&apos;t Easily Copy
                </h3>
                <p className="mt-1">{opp.why_they_cant_easily_copy}</p>
              </div>
            ) : null}

            {opp.risks?.length ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Risks
                </h3>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                  {opp.risks.map((risk, riskIndex) => (
                    <li key={riskIndex}>{risk}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {opp.first_experiments?.length ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  First Experiments (1-2 weeks)
                </h3>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                  {opp.first_experiments.map((exp, expIndex) => (
                    <li key={expIndex}>{exp}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  )
}

interface ScoringSectionProps {
  scoring: ScoringMatrixArtifactContent | null | undefined
  projectId: string
}

function ScoringSection({ scoring, projectId }: ScoringSectionProps) {
  if (!scoring) {
    return (
      <section className="panel p-5 space-y-3">
        <div className="text-sm text-text-secondary">
          <p>No scoring matrix is available yet for this project.</p>
        </div>
        <GenerateResultsV2Button
          projectId={projectId}
          label="Generate Results v2"
        />
      </section>
    )
  }

  // Sort summary by total_weighted_score descending
  const sortedSummary = scoring.summary
    ? [...scoring.summary].sort(
        (a, b) => b.total_weighted_score - a.total_weighted_score
      )
    : []

  return (
    <section className="space-y-4">
      {/* Explainer */}
      <div className="panel p-3 bg-muted/50 border-border">
        <p className="text-xs text-text-secondary">
          <strong>Competitive Scorecard</strong> evaluates each competitor on key criteria that matter to buyers. Scores are weighted by importance (1–5), with total scores out of 100. Higher scores indicate stronger positioning on evaluation criteria.
        </p>
      </div>

      {/* Bar Chart */}
      {sortedSummary.length > 0 ? (
        <article className="panel p-4">
          <h2 className="text-sm font-semibold mb-3">Competitor score overview</h2>
          <CompetitorScoreBarChart data={sortedSummary} />
        </article>
      ) : null}
      {scoring.criteria?.length ? (
        <article className="panel p-4">
          <h2 className="text-sm font-semibold mb-3">Evaluation Criteria</h2>
          <div className="space-y-3">
            {scoring.criteria.map((criterion) => (
              <div key={criterion.id} className="border-b border-border-subtle pb-3 last:border-b-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-xs font-semibold">{criterion.name}</h3>
                  <Badge variant="secondary">Weight: {criterion.weight}/5</Badge>
                </div>
                <p className="text-xs text-text-secondary mb-1">{criterion.description}</p>
                <p className="text-xs text-text-muted italic">
                  <span className="font-medium">How to score:</span> {criterion.how_to_score}
                </p>
              </div>
            ))}
          </div>
        </article>
      ) : null}

      {sortedSummary.length ? (
        <article className="panel p-4">
          <h2 className="text-sm font-semibold mb-3">Competitor Scores</h2>
          <div className="space-y-4">
            {sortedSummary.map((summary, index) => (
              <div key={index} className="border-b border-border-subtle pb-4 last:border-b-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold">{summary.competitor_name}</h3>
                  <Badge variant="primary">
                    {summary.total_weighted_score.toFixed(1)}/100
                  </Badge>
                </div>

                {summary.strengths?.length ? (
                  <div className="mb-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1">
                      Strengths
                    </h4>
                    <ul className="list-disc space-y-1 pl-4 text-xs">
                      {summary.strengths.map((strength, strengthIndex) => (
                        <li key={strengthIndex}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {summary.weaknesses?.length ? (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1">
                      Weaknesses
                    </h4>
                    <ul className="list-disc space-y-1 pl-4 text-xs">
                      {summary.weaknesses.map((weakness, weaknessIndex) => (
                        <li key={weaknessIndex}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </article>
      ) : null}

      {scoring.notes ? (
        <article className="panel p-4">
          <h2 className="text-sm font-semibold mb-2">Notes</h2>
          <p className="text-sm text-text-secondary">{scoring.notes}</p>
        </article>
      ) : null}
    </section>
  )
}

