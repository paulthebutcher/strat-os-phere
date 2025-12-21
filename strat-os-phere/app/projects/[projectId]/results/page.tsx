import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { CopySectionButton } from '@/components/results/CopySectionButton'
import { createPageMetadata } from '@/lib/seo/metadata'
import { RegenerateButton } from '@/components/results/RegenerateButton'
import { GenerateResultsV2Button } from '@/components/results/GenerateResultsV2Button'
import { AnalysisRunExperience } from '@/components/results/AnalysisRunExperience'
import { CompetitorScoreBarChart } from '@/components/results/CompetitorScoreBarChart'
import { ArtifactsDebugPanel } from '@/components/results/ArtifactsDebugPanel'
import { PostGenerationHighlight } from '@/components/results/PostGenerationHighlight'
import { ProgressiveReveal } from '@/components/results/ProgressiveReveal'
import { ResultsFrameToggle } from '@/components/results/ResultsFrameToggle'
import { ContrastSummary } from '@/components/results/ContrastSummary'
import { LineageLink } from '@/components/results/LineageLink'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { getProjectById } from '@/lib/data/projects'
import type { JtbdArtifactContent } from '@/lib/schemas/jtbd'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import type { ScoringMatrixArtifactContent } from '@/lib/schemas/scoring'
import type { StrategicBetsArtifactContent } from '@/lib/schemas/strategicBet'
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
  formatStrategicBetsToMarkdown,
  type NormalizedProfilesArtifact,
  type NormalizedSynthesisArtifact,
  type NormalizedJtbdArtifact,
  type NormalizedOpportunitiesV2Artifact,
  type NormalizedScoringMatrixArtifact,
  type NormalizedStrategicBetsArtifact,
} from '@/lib/results/normalizeArtifacts'
import {
  getJtbdLineage,
  getOpportunityLineage,
  getStruggleLineage,
} from '@/lib/results/lineageHelpers'
import {
  selectByJobs,
  selectByDifferentiationThemes,
  selectByCustomerStruggles,
  selectByStrategicBets,
  type ResultsFrame,
} from '@/lib/results/selectors'
import {
  computeContrastSummary,
  type ContrastSummary as ContrastSummaryType,
} from '@/lib/results/diffHelpers'
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
  | 'strategic_bets'

const TABS: { id: TabId; label: string }[] = [
  { id: 'strategic_bets', label: 'Strategic Bets' },
  { id: 'opportunities_v2', label: 'Opportunities' },
  { id: 'scorecard', label: 'Scorecard' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'themes', label: 'Themes' },
  { id: 'positioning', label: 'Positioning' },
  { id: 'profiles', label: 'Profiles' },
  { id: 'opportunities', label: 'Opportunities (Legacy)' },
  { id: 'angles', label: 'Angles' },
]

/**
 * Get artifacts from the previous run (second most recent)
 */
function getPreviousRunArtifacts(
  artifacts: Awaited<ReturnType<typeof listArtifacts>>,
  currentRunId: string | null
) {
  // Group artifacts by type and get the second one (previous run)
  const jtbdList = artifacts
    .filter((a) => (a.type as string) === 'jtbd')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  
  const opportunitiesList = artifacts
    .filter((a) => (a.type as string) === 'opportunities_v2')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  
  const scoringList = artifacts
    .filter((a) => (a.type as string) === 'scoring_matrix')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Get second artifact if it exists and has different run_id
  const previousJtbd = jtbdList.length > 1 && jtbdList[1] ? (() => {
    const normalized = normalizeResultsArtifacts([jtbdList[1]])
    return normalized.jtbd
  })() : null

  const previousOpportunities = opportunitiesList.length > 1 && opportunitiesList[1] ? (() => {
    const normalized = normalizeResultsArtifacts([opportunitiesList[1]])
    return normalized.opportunitiesV2
  })() : null

  const previousScoring = scoringList.length > 1 && scoringList[1] ? (() => {
    const normalized = normalizeResultsArtifacts([scoringList[1]])
    return normalized.scoringMatrix
  })() : null

  return {
    jtbd: previousJtbd,
    opportunities: previousOpportunities,
    scorecard: previousScoring,
  }
}

interface ResultsPageProps {
  params: Promise<{
    projectId: string
  }>
  searchParams?: Promise<{
    tab?: string
    frame?: string
    generating?: string
    view?: string
  }>
}

export async function generateMetadata(props: ResultsPageProps): Promise<Metadata> {
  const params = await props.params;
  return createPageMetadata({
    title: "Results — Plinth",
    description:
      "View your competitive analysis results: jobs to be done, scorecard, opportunities, and strategic bets. Strategy-grade insights for confident decision-making.",
    path: `/projects/${params.projectId}/results`,
    ogVariant: "results",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  });
}

export default async function ResultsPage(props: ResultsPageProps) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams ?? Promise.resolve({}),
  ])

  const projectId = params.projectId
  const searchParamsObj = searchParams as {
    tab?: string
    frame?: string
    generating?: string
    view?: string
    new?: string
  }
  const tabParam = searchParamsObj.tab ?? undefined
  const frameParam = searchParamsObj.frame ?? undefined
  const isGenerating = searchParamsObj.generating === 'true'
  const viewResults = searchParamsObj.view === 'results'
  const showNewBadge = searchParamsObj.new === 'true'

  const activeTab: TabId =
    (TABS.find((tab) => tab.id === tabParam)?.id as TabId | undefined) ??
    'strategic_bets' // Default to Strategic Bets - the primary decision output
  
  const activeFrame: ResultsFrame =
    (frameParam as ResultsFrame | undefined) ?? 'jobs'

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
    strategicBets,
    runId,
    generatedAt,
  } = normalized

  // Get previous run artifacts for contrast
  const previousNormalized = getPreviousRunArtifacts(artifacts, runId)
  const contrastSummary = computeContrastSummary(
    {
      jtbd: normalized.jtbd,
      opportunities: normalized.opportunitiesV2,
      scorecard: normalized.scoringMatrix,
    },
    {
      jtbd: previousNormalized.jtbd,
      opportunities: previousNormalized.opportunities,
      scorecard: previousNormalized.scorecard,
    }
  )
  const hasAnyArtifacts = Boolean(
    profiles || synthesis || jtbd || opportunitiesV2 || scoringMatrix || strategicBets
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

  // Show AnalysisRunExperience if generating and not explicitly viewing results
  // This ensures the experience is shown during generation, but results are shown
  // after the user clicks "View analysis" (which sets view=results)
  if (isGenerating && !viewResults) {
    return <AnalysisRunExperience projectId={projectId} />
  }

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
  const strategicBetsMarkdown = formatStrategicBetsToMarkdown(strategicBets?.content)

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
      : activeTab === 'strategic_bets'
      ? strategicBetsMarkdown
      : scoringMarkdown

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
      <main className="flex w-full max-w-5xl flex-col gap-8 py-12">
        <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:pb-8 border-b border-border">
          <div className="space-y-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">{project.name}</h1>
              <p className="text-sm text-muted-foreground">
                Competitive landscape analysis and strategic insights
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">{effectiveCompetitorCount}</span> competitors analyzed
              </span>
              {formattedGeneratedAt ? (
                <span>
                  Generated <span className="font-medium text-foreground">{formattedGeneratedAt}</span>
                </span>
              ) : null}
              {showNewBadge && (
                <Badge variant="default" className="text-xs">
                  New insights generated
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Insights derived from publicly available information from the past 90 days, including marketing materials, reviews, pricing, changelogs, and documentation.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 text-left md:items-end md:text-right">
            <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground" aria-label="Project navigation">
              <Link
                href="/dashboard"
                className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Dashboard
              </Link>
              <span aria-hidden="true" className="text-border">·</span>
              <Link
                href={`/projects/${project.id}`}
                className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Overview
              </Link>
              <span aria-hidden="true" className="text-border">·</span>
              <Link
                href={`/projects/${project.id}/competitors`}
                className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Competitors
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              {hasAnyArtifacts && competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS ? (
                <RegenerateButton
                  projectId={project.id}
                  competitorCount={effectiveCompetitorCount}
                  label="Regenerate"
                />
              ) : null}
              {!hasAnyArtifacts && competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS ? (
                <GenerateResultsV2Button projectId={project.id} label="Generate Analysis" />
              ) : null}
            </div>
            <ArtifactsDebugPanel projectId={project.id} />
          </div>
        </header>

        {!hasAnyArtifacts ? (
          <section className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-full max-w-md space-y-4 text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Analysis not yet generated
              </h2>
              <p className="text-sm text-muted-foreground">
                {competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS
                  ? 'Generate your first analysis to view competitive insights, jobs to be done, and strategic opportunities.'
                  : `Add at least ${MIN_COMPETITORS_FOR_ANALYSIS} competitors to begin analysis.`}
              </p>
              <div className="pt-2">
                {competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS ? (
                  <GenerateResultsV2Button
                    projectId={project.id}
                    label="Generate Analysis"
                  />
                ) : (
                  <Button asChild type="button" size="default">
                    <Link href={`/projects/${project.id}/competitors`}>
                      Add Competitors
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="flex flex-col gap-4">
            {/* Post-generation highlight */}
            {(jtbd || opportunitiesV2 || scoringMatrix) && (
              <PostGenerationHighlight
                opportunities={opportunitiesV2?.content}
                scoring={scoringMatrix?.content}
              />
            )}

            {/* Contrast Summary */}
            {contrastSummary.hasChanges && (
              <ContrastSummary
                summary={contrastSummary}
                latestRunDate={generatedAt}
                previousRunDate={
                  previousNormalized.jtbd?.generatedAt ??
                  previousNormalized.opportunities?.generatedAt ??
                  previousNormalized.scorecard?.generatedAt ??
                  null
                }
              />
            )}

            {/* Recommended Next Steps Panel */}
            {opportunitiesV2?.content?.opportunities &&
            opportunitiesV2.content.opportunities.length > 0 ? (
              <RecommendedNextStepsPanel
                opportunities={opportunitiesV2.content}
                projectId={project.id}
              />
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
              <nav
                className="tabs-list"
                aria-label="Analysis sections"
              >
                {TABS.map((tab) => (
                  <Link
                    key={tab.id}
                    href={`/projects/${project.id}/results?tab=${tab.id}${frameParam ? `&frame=${frameParam}` : ''}`}
                    className="tabs-trigger"
                    data-state={activeTab === tab.id ? 'active' : 'inactive'}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                  >
                    {tab.label}
                  </Link>
                ))}
              </nav>
              <CopySectionButton content={copyContent} label="Copy section" />
            </div>

            {/* Frame Toggle - only show for v2 tabs */}
            {(activeTab === 'jobs' || activeTab === 'opportunities_v2') && (
              <ResultsFrameToggle
                currentFrame={activeFrame}
                projectId={project.id}
              />
            )}

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
              <ProgressiveReveal order={0} enabled={Boolean(jtbd)}>
                <JtbdSection
                  jtbd={jtbd?.content}
                  projectId={project.id}
                  frame={activeFrame}
                />
              </ProgressiveReveal>
            ) : null}
            {activeTab === 'scorecard' ? (
              <ProgressiveReveal order={1} enabled={Boolean(scoringMatrix)}>
                <ScoringSection scoring={scoringMatrix?.content} projectId={project.id} />
              </ProgressiveReveal>
            ) : null}
            {activeTab === 'opportunities_v2' ? (
              <ProgressiveReveal order={2} enabled={Boolean(opportunitiesV2)}>
                <OpportunitiesV2Section
                  opportunities={opportunitiesV2?.content}
                  projectId={project.id}
                  frame={activeFrame}
                />
              </ProgressiveReveal>
            ) : null}
            {activeTab === 'strategic_bets' ? (
              <ProgressiveReveal order={3} enabled={Boolean(strategicBets)}>
                <StrategicBetsSection
                  strategicBets={strategicBets?.content}
                  projectId={project.id}
                />
              </ProgressiveReveal>
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
      <section className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-md space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            Competitor profiles will appear here after analysis is generated.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      {profiles.snapshots.map((snapshot, index) => (
        <article key={`${snapshot.competitor_name}-${index}`} className="panel p-6">
          <header className="mb-6 space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              {snapshot.competitor_name}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {snapshot.positioning_one_liner}
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-5">
              <SnapshotList
                title="Value propositions"
                items={snapshot.key_value_props}
              />
              <SnapshotList
                title="Capabilities"
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
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Customer struggles
                  </h3>
                  <ul className="space-y-2">
                    {snapshot.customer_struggles.map((struggle, index) => {
                      const lineage = getStruggleLineage(struggle, snapshot, profiles ? { signals: {} } : undefined)
                      return (
                        <li key={index} className="flex items-start justify-between gap-3 text-sm">
                          <span className="text-foreground">{struggle}</span>
                          <LineageLink lineage={lineage} title={struggle} />
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="space-y-5">
              {snapshot.proof_points?.length ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Evidence
                  </h3>
                  <ul className="space-y-4">
                    {snapshot.proof_points.map((proof, proofIndex) => (
                      <li key={proofIndex} className="space-y-2">
                        <p className="text-sm font-medium text-foreground">{proof.claim}</p>
                        <p className="text-sm italic text-muted-foreground leading-relaxed">
                          "{proof.evidence_quote}"
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Confidence: <span className="font-medium">{proof.confidence}</span>
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
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-foreground leading-relaxed">{item}</li>
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
      <section className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-md space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            Market themes will appear here after analysis is generated.
          </p>
        </div>
      </section>
    )
  }

  const { market_summary, themes } = value

  return (
    <section className="space-y-6">
      <article className="panel p-6">
        <h2 className="text-lg font-semibold text-foreground mb-5">
          {market_summary.headline}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Market shifts
            </h3>
            <ul className="space-y-2">
              {market_summary.what_is_changing.map((item, index) => (
                <li key={index} className="text-sm text-foreground leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Buyer priorities
            </h3>
            <ul className="space-y-2">
              {market_summary.what_buyers_care_about.map((item, index) => (
                <li key={index} className="text-sm text-foreground leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </article>

      {themes?.length ? (
        <div>
          <h2 className="text-base font-semibold text-foreground mb-4">Differentiation themes</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {themes.map((theme, index) => (
              <article key={index} className="panel p-5">
                <h3 className="text-sm font-semibold text-foreground mb-2">{theme.theme}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {theme.description}
                </p>
                {theme.competitors_supporting?.length ? (
                  <p className="text-xs text-muted-foreground">
                    Supported by:{' '}
                    <span className="font-medium text-foreground">
                      {theme.competitors_supporting.join(', ')}
                    </span>
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function PositioningSection({ synthesis }: SynthesisSectionProps) {
  const value = synthesis?.synthesis

  if (!value) {
    return (
      <section className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-md space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            Positioning analysis will appear here after analysis is generated.
          </p>
        </div>
      </section>
    )
  }

  const { positioning_map_text, clusters } = value

  return (
    <section className="space-y-6">
      <article className="panel p-6">
        <h2 className="text-lg font-semibold text-foreground mb-5">Positioning map</h2>
        <div className="mb-5">
          <p className="text-sm text-muted-foreground">
            Axes:{' '}
            <span className="font-medium text-foreground">
              {positioning_map_text.axis_x} (x) · {positioning_map_text.axis_y} (y)
            </span>
          </p>
        </div>
        {positioning_map_text.quadrants?.length ? (
          <div className="space-y-3">
            {positioning_map_text.quadrants.map((quadrant, index) => (
              <div key={index} className="rounded-md bg-surface-muted px-4 py-3 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
                  {quadrant.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Competitors:{' '}
                  <span className="font-medium text-foreground">
                    {quadrant.competitors.join(', ')}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {quadrant.notes}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </article>

      {clusters?.length ? (
        <article className="panel p-6">
          <h2 className="text-lg font-semibold text-foreground mb-5">Competitor clusters</h2>
          <div className="space-y-3">
            {clusters.map((cluster, index) => (
              <div key={index} className="rounded-md bg-surface-muted px-4 py-3 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
                  {cluster.cluster_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Members:{' '}
                  <span className="font-medium text-foreground">
                    {cluster.who_is_in_it.join(', ')}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cluster.cluster_logic}
                </p>
              </div>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  )
}

function OpportunitiesSection({ synthesis }: SynthesisSectionProps) {
  const value = synthesis?.synthesis

  if (!value || !value.opportunities?.length) {
    return (
      <section className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-md space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            Opportunities will appear here after analysis is generated.
          </p>
        </div>
      </section>
    )
  }

  const opportunities = [...value.opportunities].sort(
    (a, b) => a.priority - b.priority
  )

  return (
    <section className="space-y-5">
      {opportunities.map((opportunity, index) => (
        <article key={index} className="panel p-6">
          <header className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {opportunity.opportunity}
            </h2>
            <Badge variant="secondary">
              Priority {opportunity.priority}
            </Badge>
          </header>
          <div className="space-y-4 text-sm">
            <div>
              <span className="font-medium text-foreground">Who it serves:</span>{' '}
              <span className="text-muted-foreground">{opportunity.who_it_serves}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">Why now:</span>{' '}
              <span className="text-muted-foreground">{opportunity.why_now}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">Why competitors miss it:</span>{' '}
              <span className="text-muted-foreground">{opportunity.why_competitors_miss_it}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">Suggested angle:</span>{' '}
              <span className="text-muted-foreground">{opportunity.suggested_angle}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">Risk or assumption:</span>{' '}
              <span className="text-muted-foreground">{opportunity.risk_or_assumption}</span>
            </div>
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
      <section className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-md space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            Differentiation angles will appear here after analysis is generated.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-5">
      {value.recommended_differentiation_angles.map((angle, index) => (
        <article key={index} className="panel p-6">
          <h2 className="text-base font-semibold text-foreground mb-3">{angle.angle}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {angle.what_to_claim}
          </p>

          <div className="space-y-4">
            {angle.how_to_prove?.length ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  How to prove
                </h3>
                <ul className="space-y-2">
                  {angle.how_to_prove.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-foreground leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {angle.watch_out_for?.length ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Considerations
                </h3>
                <ul className="space-y-2">
                  {angle.watch_out_for.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-foreground leading-relaxed">{item}</li>
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
    <article className="panel p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">Recommended next steps</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Highest-scoring opportunities to prioritize
          </p>
        </div>
        <CopySectionButton content={panelContent} label="Copy" />
      </div>
      <div className="space-y-5">
        {topOpportunities.map((opp, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">{opp.title}</h3>
              <Badge variant="primary" className="shrink-0">{opp.score}/100</Badge>
            </div>
            {opp.first_experiments && opp.first_experiments.length > 0 ? (
              <ul className="space-y-2">
                {opp.first_experiments.slice(0, 3).map((exp, expIndex) => (
                  <li key={expIndex} className="text-sm text-muted-foreground leading-relaxed">{exp}</li>
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
  frame: ResultsFrame
}

function JtbdSection({ jtbd, projectId, frame }: JtbdSectionProps) {
  if (!jtbd || !jtbd.jobs?.length) {
    return (
      <section className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Jobs To Be Done will appear here after analysis is generated.
          </p>
          <GenerateResultsV2Button
            projectId={projectId}
            label="Generate Analysis"
          />
        </div>
      </section>
    )
  }

  // Apply frame-based reorganization
  const frameGroups =
    frame === 'jobs'
      ? selectByJobs(jtbd)
      : frame === 'customer_struggles'
      ? [] // Struggles frame not applicable to JTBD
      : selectByJobs(jtbd) // Default to jobs frame

  return (
    <section className="space-y-6">
      {/* Explainer */}
      <div className="rounded-lg bg-muted/50 border border-border p-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Jobs To Be Done describe the specific tasks customers need to accomplish. Each job includes measurable outcomes and an opportunity score based on importance and current satisfaction.
        </p>
      </div>
      {frameGroups.map((group) =>
        group.items
          .filter((item): item is { type: 'jtbd'; job: import('@/lib/schemas/jtbd').JtbdItem } => item.type === 'jtbd')
          .map((item, index) => {
            const job = item.job
            const lineage = getJtbdLineage(job, jtbd)
            return (
              <article key={`${group.id}-${index}`} className="panel p-6">
                <header className="mb-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold text-foreground leading-snug">{job.job_statement}</h2>
                    <div className="flex items-center gap-2 shrink-0">
                      <LineageLink lineage={lineage} title={job.job_statement} />
                      <Badge variant="primary">
                        {job.opportunity_score}/100
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>
                      <span className="font-medium text-foreground">Who:</span> {job.who}
                    </span>
                    <span>
                      <span className="font-medium text-foreground">Frequency:</span> {job.frequency}
                    </span>
                    <span>
                      <span className="font-medium text-foreground">Importance:</span> {job.importance_score}/5
                    </span>
                    <span>
                      <span className="font-medium text-foreground">Satisfaction:</span> {job.satisfaction_score}/5
                    </span>
                  </div>
                </header>

                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Context
                    </h3>
                    <p className="text-sm text-foreground leading-relaxed">{job.context}</p>
                  </div>

                  {job.desired_outcomes?.length ? (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Desired outcomes
                      </h3>
                      <ul className="space-y-2">
                        {job.desired_outcomes.map((outcome, outcomeIndex) => (
                          <li key={outcomeIndex} className="text-sm text-foreground leading-relaxed">{outcome}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {job.constraints?.length ? (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Constraints
                      </h3>
                      <ul className="space-y-2">
                        {job.constraints.map((constraint, constraintIndex) => (
                          <li key={constraintIndex} className="text-sm text-foreground leading-relaxed">{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {job.current_workarounds?.length ? (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Current workarounds
                      </h3>
                      <ul className="space-y-2">
                        {job.current_workarounds.map((workaround, workaroundIndex) => (
                          <li key={workaroundIndex} className="text-sm text-foreground leading-relaxed">{workaround}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {job.non_negotiables?.length ? (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Non-negotiables
                      </h3>
                      <ul className="space-y-2">
                        {job.non_negotiables.map((nonNegotiable, nonNegotiableIndex) => (
                          <li key={nonNegotiableIndex} className="text-sm text-foreground leading-relaxed">{nonNegotiable}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {job.evidence?.length ? (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Evidence
                      </h3>
                      <ul className="space-y-3">
                        {job.evidence.map((ev, evIndex) => (
                          <li key={evIndex} className="space-y-1">
                            {ev.competitor && (
                              <span className="text-sm font-medium text-foreground">{ev.competitor}</span>
                            )}
                            {ev.citation && (
                              <span className="ml-2 text-sm text-muted-foreground">
                                (<a
                                  href={ev.citation}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                                >
                                  source
                                </a>)
                              </span>
                            )}
                            {ev.quote && (
                              <p className="text-sm italic text-muted-foreground leading-relaxed">
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
            )
          })
      )}
    </section>
  )
}

interface OpportunitiesV2SectionProps {
  opportunities: OpportunitiesArtifactContent | null | undefined
  projectId: string
  frame: ResultsFrame
}

function OpportunitiesV2Section({
  opportunities,
  projectId,
  frame,
}: OpportunitiesV2SectionProps) {
  if (!opportunities || !opportunities.opportunities?.length) {
    return (
      <section className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Opportunities will appear here after analysis is generated.
          </p>
          <GenerateResultsV2Button
            projectId={projectId}
            label="Generate Analysis"
          />
        </div>
      </section>
    )
  }

  // Apply frame-based reorganization
  const frameGroups =
    frame === 'differentiation_themes'
      ? selectByDifferentiationThemes(opportunities)
      : frame === 'strategic_bets'
      ? selectByStrategicBets(opportunities)
      : frame === 'customer_struggles'
      ? [] // Struggles frame handled separately
      : selectByDifferentiationThemes(opportunities) // Default

  return (
    <section className="space-y-6">
      {/* Explainer */}
      <div className="rounded-lg bg-muted/50 border border-border p-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ranked by score (impact, effort, confidence, and linked job importance). Each opportunity includes first experiments—concrete tests you can run in 1–2 weeks to validate before committing to a full build.
        </p>
      </div>
      {frameGroups.map((group) => (
        <div key={group.id} className="space-y-5">
          {group.label !== 'All Jobs' && (
            <h2 className="text-base font-semibold text-foreground pb-2">
              {group.label}
            </h2>
          )}
          {group.items
            .filter(
              (item): item is { type: 'opportunity'; opportunity: import('@/lib/schemas/opportunities').OpportunityItem } =>
                item.type === 'opportunity'
            )
            .map((item, index) => {
              const opp = item.opportunity
              const lineage = getOpportunityLineage(opp, opportunities)
              return (
                <article key={`${group.id}-${index}`} className="panel p-6">
                  <header className="mb-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base font-semibold text-foreground leading-snug">{opp.title}</h2>
                      <div className="flex items-center gap-2 shrink-0">
                        <LineageLink lineage={lineage} title={opp.title} />
                        <Badge variant="primary">
                          {opp.score}/100
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{opp.type.replace('_', ' ')}</Badge>
                      <Badge variant={opp.impact === 'high' ? 'success' : opp.impact === 'med' ? 'warning' : 'default'} className="text-xs">
                        Impact: {opp.impact}
                      </Badge>
                      <Badge variant={opp.effort === 'S' ? 'success' : opp.effort === 'M' ? 'warning' : 'default'} className="text-xs">
                        Effort: {opp.effort}
                      </Badge>
                      <Badge variant={opp.confidence === 'high' ? 'success' : opp.confidence === 'med' ? 'warning' : 'default'} className="text-xs">
                        Confidence: {opp.confidence}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Who it serves:</span> {opp.who_it_serves}
                    </p>
                  </header>

                  <div className="space-y-5 text-sm">
                    {opp.why_now ? (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          Why now
                        </h3>
                        <p className="text-foreground leading-relaxed">{opp.why_now}</p>
                      </div>
                    ) : null}

                    {opp.how_to_win?.length ? (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          How to win
                        </h3>
                        <ul className="space-y-2">
                          {opp.how_to_win.map((tactic, tacticIndex) => (
                            <li key={tacticIndex} className="text-foreground leading-relaxed">{tactic}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {opp.what_competitors_do_today ? (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          Current competitive landscape
                        </h3>
                        <p className="text-foreground leading-relaxed">{opp.what_competitors_do_today}</p>
                      </div>
                    ) : null}

                    {opp.why_they_cant_easily_copy ? (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          Competitive moat
                        </h3>
                        <p className="text-foreground leading-relaxed">{opp.why_they_cant_easily_copy}</p>
                      </div>
                    ) : null}

                    {opp.risks?.length ? (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          Risks
                        </h3>
                        <ul className="space-y-2">
                          {opp.risks.map((risk, riskIndex) => (
                            <li key={riskIndex} className="text-foreground leading-relaxed">{risk}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {opp.first_experiments?.length ? (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          First experiments (1–2 weeks)
                        </h3>
                        <ul className="space-y-2">
                          {opp.first_experiments.map((exp, expIndex) => (
                            <li key={expIndex} className="text-foreground leading-relaxed">{exp}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </article>
              )
            })}
        </div>
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
      <section className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Competitive scorecard will appear here after analysis is generated.
          </p>
          <GenerateResultsV2Button
            projectId={projectId}
            label="Generate Analysis"
          />
        </div>
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
    <section className="space-y-6">
      {/* Explainer */}
      <div className="rounded-lg bg-muted/50 border border-border p-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Evaluates each competitor on key criteria that matter to buyers. Scores are weighted by importance (1–5), with total scores out of 100.
        </p>
      </div>

      {/* Bar Chart */}
      {sortedSummary.length > 0 ? (
        <article className="panel p-6">
          <h2 className="text-base font-semibold text-foreground mb-5">Score overview</h2>
          <CompetitorScoreBarChart data={sortedSummary} />
        </article>
      ) : null}
      {scoring.criteria?.length ? (
        <article className="panel p-6">
          <h2 className="text-base font-semibold text-foreground mb-5">Evaluation criteria</h2>
          <div className="space-y-4">
            {scoring.criteria.map((criterion) => (
              <div key={criterion.id} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">{criterion.name}</h3>
                  <Badge variant="secondary" className="shrink-0">Weight: {criterion.weight}/5</Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{criterion.description}</p>
                <p className="text-sm text-muted-foreground italic">
                  <span className="font-medium">Scoring method:</span> {criterion.how_to_score}
                </p>
              </div>
            ))}
          </div>
        </article>
      ) : null}

      {sortedSummary.length ? (
        <article className="panel p-6">
          <h2 className="text-base font-semibold text-foreground mb-5">Competitor breakdown</h2>
          <div className="space-y-6">
            {sortedSummary.map((summary, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-foreground">{summary.competitor_name}</h3>
                  <Badge variant="primary">
                    {summary.total_weighted_score.toFixed(1)}/100
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {summary.strengths?.length ? (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {summary.strengths.map((strength, strengthIndex) => (
                          <li key={strengthIndex} className="text-sm text-foreground leading-relaxed">{strength}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {summary.weaknesses?.length ? (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Weaknesses
                      </h4>
                      <ul className="space-y-2">
                        {summary.weaknesses.map((weakness, weaknessIndex) => (
                          <li key={weaknessIndex} className="text-sm text-foreground leading-relaxed">{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </article>
      ) : null}

      {scoring.notes ? (
        <article className="panel p-6">
          <h2 className="text-base font-semibold text-foreground mb-3">Notes</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{scoring.notes}</p>
        </article>
      ) : null}
    </section>
  )
}

interface StrategicBetsSectionProps {
  strategicBets: StrategicBetsArtifactContent | null | undefined
  projectId: string
}

function StrategicBetsSection({ strategicBets, projectId }: StrategicBetsSectionProps) {
  if (!strategicBets || !strategicBets.bets?.length) {
    return (
      <section className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Strategic Bets not yet generated
          </h2>
          <p className="text-sm text-muted-foreground">
            Strategic bets are generated as part of the full analysis. Generate analysis to create strategic bets along with jobs, scorecard, and opportunities.
          </p>
          <GenerateResultsV2Button
            projectId={projectId}
            label="Generate Analysis"
          />
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      {/* Explainer */}
      <div className="rounded-lg bg-muted/50 border border-border p-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Strategic bets synthesize your analysis into concrete, commitment-ready decisions suitable for VP+ Product and UX leaders. Each bet forces explicit tradeoffs, requires specific capabilities, and includes a falsifiable experiment to validate or disconfirm.
        </p>
      </div>

      {strategicBets.bets.map((bet, index) => {
        const betMarkdown = formatStrategicBetsToMarkdown({
          meta: strategicBets.meta,
          bets: [bet],
        })

        return (
          <article key={bet.id || index} className="panel p-6 space-y-6">
            <header className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-foreground leading-tight">{bet.title}</h2>
                <div className="flex items-center gap-2 shrink-0">
                  <CopySectionButton content={betMarkdown} label="Copy bet" />
                  <Badge
                    variant={
                      bet.confidence_score >= 70
                        ? 'success'
                        : bet.confidence_score >= 50
                        ? 'warning'
                        : 'default'
                    }
                    className="text-xs"
                  >
                    {bet.confidence_score}/100
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{bet.summary}</p>
            </header>

            {/* Three-column emphasis row */}
            <div className="grid gap-4 md:grid-cols-3 border-t border-b border-border py-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  What we say no to
                </h3>
                <ul className="space-y-2">
                  {bet.what_we_say_no_to.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-foreground leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Capabilities this forces
                </h3>
                <ul className="space-y-2">
                  {bet.forced_capabilities.map((capability, capabilityIndex) => (
                    <li key={capabilityIndex} className="text-sm text-foreground leading-relaxed">
                      {capability}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Why competitors won't follow
                </h3>
                <p className="text-sm text-foreground leading-relaxed">
                  {bet.why_competitors_wont_follow}
                </p>
              </div>
            </div>

            {/* Proof & Risk */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  First real-world proof ({bet.first_real_world_proof.timeframe_weeks} weeks)
                </h3>
                <p className="text-sm text-foreground leading-relaxed mb-2">
                  {bet.first_real_world_proof.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Success signal:</span>{' '}
                  {bet.first_real_world_proof.success_signal}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  What would invalidate this bet
                </h3>
                <ul className="space-y-2">
                  {bet.invalidation_signals.map((signal, signalIndex) => (
                    <li key={signalIndex} className="text-sm text-foreground leading-relaxed">
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Supporting evidence */}
            {bet.supporting_signals && bet.supporting_signals.length > 0 ? (
              <div className="border-t border-border pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Supporting evidence
                </h3>
                <div className="flex flex-wrap gap-2">
                  {bet.supporting_signals.map((signal, signalIndex) => (
                    <Badge key={signalIndex} variant="secondary" className="text-xs">
                      {signal.source_type} ({signal.citation_count})
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Opportunity sources */}
            {bet.opportunity_source_ids && bet.opportunity_source_ids.length > 0 ? (
              <div className="border-t border-border pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Based on
                </h3>
                <p className="text-sm text-muted-foreground">
                  {bet.opportunity_source_ids.join(', ')}
                </p>
              </div>
            ) : null}
          </article>
        )
      })}
    </section>
  )
}

