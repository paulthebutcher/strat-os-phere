import { redirect } from 'next/navigation'
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
import { Collapsible } from '@/components/ui/collapsible'
import { WhyNowChip } from '@/components/results/WhyNowChip'
import {
  getOpportunityScore,
  getWhyNowSignals,
  getDecisionFrame,
} from '@/lib/results/opportunityUx'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { getProjectById } from '@/lib/data/projects'
import type { JtbdArtifactContent } from '@/lib/schemas/jtbd'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
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
  formatOpportunitiesV3ToMarkdown,
  formatScoringMatrixToMarkdown,
  formatStrategicBetsToMarkdown,
  type NormalizedProfilesArtifact,
  type NormalizedSynthesisArtifact,
  type NormalizedJtbdArtifact,
  type NormalizedOpportunitiesV2Artifact,
  type NormalizedOpportunitiesV3Artifact,
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
  | 'opportunities_v3'
  | 'strategic_bets'

const TABS: { id: TabId; label: string }[] = [
  { id: 'opportunities_v3', label: 'Opportunities' },
  { id: 'strategic_bets', label: 'Strategic Bets' },
  { id: 'opportunities_v2', label: 'Opportunities (v2)' },
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
  
  // Backward compatibility: redirect to overview or appropriate route
  // If there's a tab parameter, redirect to the appropriate route
  const tabParam = searchParamsObj.tab
  if (tabParam === 'opportunities_v3' || tabParam === 'opportunities' || tabParam === 'opportunities_v2') {
    redirect(`/projects/${projectId}/opportunities${searchParamsObj.frame ? `?frame=${searchParamsObj.frame}` : ''}`)
  } else if (tabParam === 'jobs') {
    redirect(`/projects/${projectId}/jobs${searchParamsObj.frame ? `?frame=${searchParamsObj.frame}` : ''}`)
  } else if (tabParam === 'scorecard') {
    redirect(`/projects/${projectId}/scorecard`)
  } else if (tabParam === 'strategic_bets') {
    redirect(`/projects/${projectId}/strategic-bets`)
  } else if (tabParam === 'profiles') {
    redirect(`/projects/${projectId}/competitors`)
  } else {
    // Default: redirect to overview
    const queryParams = new URLSearchParams()
    if (searchParamsObj.generating === 'true') queryParams.set('generating', 'true')
    if (searchParamsObj.view === 'results') queryParams.set('view', 'results')
    if (searchParamsObj.new === 'true') queryParams.set('new', 'true')
    const queryString = queryParams.toString()
    redirect(`/projects/${projectId}/overview${queryString ? `?${queryString}` : ''}`)
  }
}

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
    opportunitiesV3,
    scoringMatrix,
    strategicBets,
    runId,
    generatedAt,
  } = normalized

  // Prefer opportunities_v3 if available, otherwise default to strategic_bets
  const defaultTab: TabId = opportunitiesV3 ? 'opportunities_v3' : 'strategic_bets'
  const activeTab: TabId =
    (TABS.find((tab) => tab.id === tabParam)?.id as TabId | undefined) ??
    defaultTab

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
    profiles || synthesis || jtbd || opportunitiesV2 || opportunitiesV3 || scoringMatrix || strategicBets
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
      : activeTab === 'opportunities_v3'
      ? formatOpportunitiesV3ToMarkdown(opportunitiesV3?.content)
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
              Insights derived from publicly available information from the past 90 days, including marketing materials, reviews, pricing, changelogs, and documentation. Signals updated recently are weighted higher in confidence scores.
            </p>
            <p className="text-xs text-muted-foreground">
              <Link href="/help#results" className="text-primary underline hover:text-primary/80">
                Need help?
              </Link>
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
                Ready to generate your analysis
              </h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                {competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS ? (
                  <>
                    <p>
                      ✓ You have {competitorCount} competitor{competitorCount !== 1 ? 's' : ''} configured
                    </p>
                    <p>
                      <span className="font-medium text-foreground">What's next:</span> Generate your first analysis to view competitive insights, jobs to be done, and strategic opportunities.
                    </p>
                    <p className="text-xs italic">
                      Why this matters: Analysis helps identify defensible opportunities and pressure-test your competitive positioning.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <span className="font-medium text-foreground">What's needed:</span> Add at least {MIN_COMPETITORS_FOR_ANALYSIS} competitors to begin analysis.
                    </p>
                    <p className="text-xs italic">
                      Why this matters: Competitive analysis requires multiple perspectives to identify patterns and gaps.
                    </p>
                  </>
                )}
              </div>
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
            {activeTab === 'opportunities_v3' ? (
              <ProgressiveReveal order={0} enabled={Boolean(opportunitiesV3)}>
                <OpportunitiesV3Section
                  opportunities={opportunitiesV3?.content}
                  projectId={project.id}
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
        <div className="w-full max-w-md space-y-3 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">What's needed:</span> Competitor profiles will appear here after analysis is generated.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Profiles summarize what each competitor offers today, helping identify vulnerabilities and gaps.
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
        <div className="w-full max-w-md space-y-3 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">What's needed:</span> Market themes will appear here after analysis is generated.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Themes identify patterns across competitors and market shifts that create opportunities.
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
        <div className="w-full max-w-md space-y-3 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">What's needed:</span> Positioning analysis will appear here after analysis is generated.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Positioning maps show how competitors cluster and where differentiation opportunities exist.
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
        <div className="w-full max-w-md space-y-3 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">What's needed:</span> Opportunities will appear here after analysis is generated.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Opportunities identify defensible ways to win that force competitors to react.
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
        <div className="w-full max-w-md space-y-3 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">What's needed:</span> Differentiation angles will appear here after analysis is generated.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Differentiation angles show how to position your offering to stand apart from competitors.
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
            <span className="font-medium text-foreground">What's needed:</span> Jobs To Be Done will appear here after analysis is generated.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Jobs help identify what customers are trying to accomplish and where current solutions fall short.
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
        <h3 className="text-sm font-semibold text-foreground mb-1">Jobs To Be Done</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The specific tasks customers need to accomplish. Each job includes measurable outcomes and an opportunity score based on importance and current satisfaction.
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
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="primary">
                          {job.opportunity_score}/100
                        </Badge>
                        <span className="text-xs text-muted-foreground">Confidence-weighted</span>
                      </div>
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
            <span className="font-medium text-foreground">What's needed:</span> Opportunities will appear here after analysis is generated.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Opportunities identify defensible ways to win that force competitors to react.
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
        <h3 className="text-sm font-semibold text-foreground mb-1">Opportunities</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          A defensible way to win that forces competitors to react. Ranked by score (impact, effort, confidence, and linked job importance). Each opportunity includes first experiments—concrete tests you can run in 1–2 weeks to validate before committing to a full build.
        </p>
        <p className="text-xs text-muted-foreground italic">
          Score: Confidence-weighted likelihood of advantage over 12–18 months
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
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="primary">
                            {opp.score}/100
                          </Badge>
                          <span className="text-xs text-muted-foreground">Based on multiple sources</span>
                        </div>
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
            <span className="font-medium text-foreground">What's needed:</span> Competitive scorecard will appear here after analysis is generated.
          </p>
          <p className="text-xs text-muted-foreground italic">
            The scorecard evaluates competitors on key criteria that matter to buyers, weighted by importance.
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
        <h3 className="text-sm font-semibold text-foreground mb-1">Scorecard</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Evaluates each competitor on key criteria that matter to buyers. Scores are weighted by importance (1–5), with total scores out of 100.
        </p>
        <p className="text-xs text-muted-foreground italic mt-2">
          Signals: Live evidence from pricing, product, hiring, and positioning
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

interface OpportunitiesV3SectionProps {
  opportunities: OpportunityV3ArtifactContent | null | undefined
  projectId: string
}

function OpportunitiesV3Section({ opportunities, projectId }: OpportunitiesV3SectionProps) {
  if (!opportunities || !opportunities.opportunities?.length) {
    return (
      <section className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">What's needed:</span> No opportunities yet — generate results to see your first strategic bet.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Opportunities identify defensible ways to win that force competitors to react, ranked by impact and defensibility.
          </p>
          <GenerateResultsV2Button
            projectId={projectId}
            label="Generate Analysis"
          />
        </div>
      </section>
    )
  }

  // Sort by score descending
  const sortedOpportunities = [...opportunities.opportunities].sort((a, b) => {
    const scoreA = getOpportunityScore(a) ?? 0
    const scoreB = getOpportunityScore(b) ?? 0
    return scoreB - scoreA
  })

  // Get top opportunity for "If you did only one thing" panel
  const topOpportunity = sortedOpportunities[0]
  const topScore = getOpportunityScore(topOpportunity)

  // Build panel content for copy
  const panelContentLines = [
    '# If you did only one thing in the next 90 days',
    '',
    'A single bet that maximizes learning and leverage.',
    '',
    `## ${topOpportunity.title}`,
    '',
    topOpportunity.one_liner,
    '',
  ]

  // Add rationale (use one_liner or derive from description)
  const rationale = topOpportunity.one_liner || topOpportunity.proposed_move || ''
  if (rationale) {
    panelContentLines.push('**Rationale:**', rationale, '')
  }

  // Add first experiment
  if (topOpportunity.experiments && topOpportunity.experiments.length > 0) {
    panelContentLines.push('**First experiment:**', topOpportunity.experiments[0].hypothesis || topOpportunity.experiments[0].smallest_test || '')
  } else {
    panelContentLines.push('**First experiment:** Run a small validation test to confirm customer interest and feasibility.')
  }

  const panelContent = panelContentLines.join('\n')

  return (
    <section className="space-y-6">
      {/* "If you did only one thing" panel */}
      <article className="panel p-6 border-2 border-primary/20">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              If you did only one thing in the next 90 days
            </h2>
            <p className="text-sm text-muted-foreground">
              A single bet that maximizes learning and leverage.
            </p>
          </div>
          <CopySectionButton content={panelContent} label="Copy" />
        </div>
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              {topOpportunity.title}
            </h3>
            {topScore !== null && (
              <div className="flex flex-col items-start gap-1 mb-2">
                <Badge variant="primary">
                  Score: {topScore}/100
                </Badge>
                <span className="text-xs text-muted-foreground">Based on multiple sources</span>
              </div>
            )}
            <p className="text-sm text-foreground leading-relaxed mt-2">
              {rationale}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              First experiment
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {topOpportunity.experiments && topOpportunity.experiments.length > 0
                ? topOpportunity.experiments[0].hypothesis || topOpportunity.experiments[0].smallest_test || 'Run a small validation test to confirm customer interest and feasibility.'
                : 'Run a small validation test to confirm customer interest and feasibility.'}
            </p>
          </div>
        </div>
      </article>

      {/* Explainer */}
      <div className="rounded-lg bg-muted/50 border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">Opportunities</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          A defensible way to win that forces competitors to react. Ranked opportunities with citation-backed proof points, deterministic score breakdowns, and actionable experiments. Each opportunity includes what makes it defensible and why competitors won't follow.
        </p>
        <p className="text-xs text-muted-foreground italic">
          Score: Confidence-weighted likelihood of advantage over 12–18 months
        </p>
      </div>

      {sortedOpportunities.map((opp, index) => {
        const whyNowSignals = getWhyNowSignals(opp)
        const decisionFrame = getDecisionFrame(opp)
        
        return (
        <article key={opp.id || index} className="panel p-6 space-y-6">
          <header className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground leading-tight">{opp.title}</h2>
                <p className="mt-2 text-sm text-foreground leading-relaxed">{opp.one_liner}</p>
              </div>
              {getOpportunityScore(opp) !== null && (
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="primary" className="text-base px-3 py-1">
                    {getOpportunityScore(opp)}/100
                  </Badge>
                  <span className="text-xs text-muted-foreground">Based on multiple sources</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">Customer:</span> {opp.customer}
              </span>
            </div>
            
            {/* Why Now strip */}
            {whyNowSignals.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mr-1">
                  Why now:
                </span>
                {whyNowSignals.map((signal, signalIndex) => (
                  <WhyNowChip key={signalIndex} signal={signal} />
                ))}
              </div>
            )}
          </header>

          {/* Score Breakdown */}
          {'scoring' in opp && typeof opp.scoring === 'object' && opp.scoring !== null && 'breakdown' in opp.scoring && typeof opp.scoring.breakdown === 'object' && opp.scoring.breakdown !== null && (
            <div className="border-t border-b border-border py-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Score Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(opp.scoring.breakdown).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-xs text-muted-foreground mb-1">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(typeof value === 'number' ? value / 10 : 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground w-8 text-right">
                        {typeof value === 'number' ? value.toFixed(1) : '0.0'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="space-y-5 text-sm">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Problem Today
              </h3>
              <p className="text-foreground leading-relaxed">{opp.problem_today}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Proposed Move
              </h3>
              <p className="text-foreground leading-relaxed">{opp.proposed_move}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Why Now
              </h3>
              <p className="text-foreground leading-relaxed">{opp.why_now}</p>
            </div>

            {/* Proof Points */}
            {opp.proof_points?.length ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Proof Points
                </h3>
                <ul className="space-y-3">
                  {opp.proof_points.map((proof, proofIndex) => (
                    <li key={proofIndex} className="space-y-2">
                      <p className="text-foreground leading-relaxed">{proof.claim}</p>
                      {proof.citations?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {proof.citations.map((citation, citIndex) => (
                            <Badge
                              key={citIndex}
                              variant="secondary"
                              className="text-xs"
                              title={citation.url}
                            >
                              {citation.source_type} {citation.domain ? `(${citation.domain})` : ''}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Decision Frame - Collapsible */}
            <Collapsible
              title="Decision frame"
              description={decisionFrame.isDerived ? 'Draft (UI-derived)' : undefined}
              defaultOpen={false}
            >
              <div className="grid gap-4 md:grid-cols-3 border-t border-b border-border pt-4 pb-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    What we'd say no to
                  </h3>
                  <ul className="space-y-2">
                    {decisionFrame.noTo.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-foreground leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Capability we'd have to build
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {decisionFrame.capability}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Why competitors won't follow easily
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {decisionFrame.defensibility}
                  </p>
                </div>
              </div>
              {decisionFrame.isDerived && (
                <p className="text-xs text-muted-foreground italic mt-2">
                  Note: This decision frame is UI-derived from available opportunity data. It will be persisted in future schema updates.
                </p>
              )}
            </Collapsible>

            {/* Experiments */}
            {opp.experiments?.length ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  First Experiments
                </h3>
                <ul className="space-y-4">
                  {opp.experiments.map((exp, expIndex) => (
                    <li key={expIndex} className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{exp.hypothesis}</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><span className="font-medium">Test:</span> {exp.smallest_test}</p>
                        <p><span className="font-medium">Success:</span> {exp.success_metric}</p>
                        <p><span className="font-medium">Timeframe:</span> {exp.expected_timeframe}</p>
                        <p><span className="font-medium">Risk Reduced:</span> {exp.risk_reduced}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </article>
        )
      })}
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
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">What's needed:</span> Strategic bets are generated as part of the full analysis. Generate analysis to create strategic bets along with jobs, scorecard, and opportunities.
            </p>
            <p className="text-xs italic">
              Why this matters: Strategic bets convert opportunities into commitment-ready decisions with explicit tradeoffs and falsifiable experiments.
            </p>
          </div>
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
        <h3 className="text-sm font-semibold text-foreground mb-1">Strategic Bets</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          Concrete, commitment-ready decisions suitable for VP+ Product and UX leaders. Each bet forces explicit tradeoffs, requires specific capabilities, and includes a falsifiable experiment to validate or disconfirm.
        </p>
        <p className="text-xs text-muted-foreground italic">
          Confidence score: Weighted by evidence quality and competitive defensibility
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
                  <div className="flex flex-col items-end gap-1">
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
                    <span className="text-xs text-muted-foreground">
                      {bet.supporting_signals && bet.supporting_signals.length > 0
                        ? `Includes ${bet.supporting_signals.length} source${bet.supporting_signals.length !== 1 ? 's' : ''}`
                        : 'Evidence-weighted'}
                    </span>
                  </div>
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

