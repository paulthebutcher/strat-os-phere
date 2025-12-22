import { notFound, redirect } from 'next/navigation'
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
import { ConfidenceEcho } from '@/components/shared/ConfidenceEcho'
import { AssumptionBadge } from '@/components/shared/AssumptionBadge'
import { ExpertNote } from '@/components/shared/ExpertNote'
import { normalizeLabel } from '@/lib/utils/terminology'
import { ResultsPageShell } from '@/components/results/ResultsPageShell'
import { ResultsHeader } from '@/components/results/ResultsHeader'
import { SectionCard } from '@/components/results/SectionCard'
import { ProgressiveRevealWrapper } from '@/components/results/ProgressiveRevealWrapper'
import { DecisionConfidenceSummary } from '@/components/results/DecisionConfidenceSummary'
import { DecisionConfidencePanel } from '@/components/results/DecisionConfidencePanel'
import { HardToCopyCallout } from '@/components/results/HardToCopyCallout'
import {
  getOpportunityScore,
  getWhyNowSignals,
  getDecisionFrame,
} from '@/lib/results/opportunityUx'
import {
  computeDecisionConfidence,
  computeAggregateConfidence,
} from '@/lib/ui/decisionConfidence'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { getProjectById } from '@/lib/data/projects'
import type { Project } from '@/lib/supabase/types'
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
import Link from 'next/link'
import type { ReactNode } from 'react'
import { RunRecapPanel } from '@/components/results/RunRecapPanel'
import { FreshnessBadge } from '@/components/shared/FreshnessBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  type TabId,
  resolveResultsTab,
  type TabAvailability,
  TAB_IDS,
} from '@/lib/ui/resultsTab'
import { logger } from '@/lib/logger'

/**
 * Safely narrows a string value to a valid TabId
 * Returns undefined if the value is not a valid tab ID
 */
function asTabId(value: string | null | undefined): TabId | undefined {
  if (!value) return undefined
  return TAB_IDS.includes(value as TabId) ? (value as TabId) : undefined
}

/**
 * Assert never helper for exhaustiveness checking
 */
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`)
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'opportunities_v3', label: 'Opportunities' },
  { id: 'opportunities_v2', label: 'Opportunities (v2)' },
  { id: 'strategic_bets', label: 'Strategic Bets' },
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
  
  const frameParam = searchParamsObj.frame
  const isGenerating = searchParamsObj.generating === 'true'
  const viewResults = searchParamsObj.view === 'results'
  const showNewBadge = searchParamsObj.new === 'true'

  const activeFrame: ResultsFrame =
    (frameParam as ResultsFrame | undefined) ?? 'jobs'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // TypeScript doesn't recognize that notFound() never returns, so we narrow explicitly
  // After the null check above, user is guaranteed to be non-null
  const authenticatedUser = user as NonNullable<typeof user>

  const project = await getProjectById(supabase, projectId)

  if (!project) {
    notFound()
  }
  
  // TypeScript doesn't recognize notFound() never returns, so we use non-null assertion
  // after the guard (safe because we've already checked for null)
  if (project!.user_id !== authenticatedUser.id) {
    notFound()
  }
  
  // After both checks, project is guaranteed to be non-null and owned by the user
  const verifiedProject = project!

  const [competitors, artifacts] = await Promise.all([
    listCompetitorsForProject(supabase, projectId),
    listArtifacts(supabase, { projectId }),
  ])

  // Move all derived values to the top after data loading
  // This prevents "used before declaration" errors
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

  // Compute all boolean flags upfront
  const snapshotsLength = profiles?.snapshots?.length ?? 0
  const hasProfiles = snapshotsLength > 0
  const hasSynthesis = Boolean(synthesis?.synthesis)
  const hasJtbd = Boolean(jtbd?.content?.jobs?.length)
  const hasOpportunitiesV2 = Boolean(opportunitiesV2?.content?.opportunities?.length)
  const hasOpportunitiesV3 = Boolean(opportunitiesV3?.content?.opportunities?.length)
  const hasScoringMatrix = Boolean(scoringMatrix?.content)
  const hasStrategicBets = Boolean(strategicBets?.content?.bets?.length)
  const hasAnyArtifacts = Boolean(
    profiles || synthesis || jtbd || opportunitiesV2 || opportunitiesV3 || scoringMatrix || strategicBets
  )

  const effectiveCompetitorCount = normalized.competitorCount ?? competitorCount

  // Derive safe, non-null locals for opportunitiesV2 to avoid TS nullability errors
  const opportunitiesV2Content = opportunitiesV2?.content ?? null
  const opportunitiesV2List = opportunitiesV2Content?.opportunities ?? []
  const shouldShowRecommendedNextSteps = opportunitiesV2List.length > 0
  
  // Type guard function to help TypeScript narrow the type
  function hasOpportunitiesContent(
    content: typeof opportunitiesV2Content
  ): content is NonNullable<typeof opportunitiesV2Content> {
    return content !== null && content.opportunities.length > 0
  }
  
  // Safe reference for Recommended Next Steps panel (only set when content is valid)
  const recommendedNextStepsContent = hasOpportunitiesContent(opportunitiesV2Content) 
    ? opportunitiesV2Content 
    : null

  /**
   * Opportunity artifact picker: chooses the best available artifact
   * Priority: opportunities_v3 > opportunities_v2 > null
   * Returns the selected artifact content, version label, and availability flag
   */
  const opportunitiesArtifact = opportunitiesV3?.content ?? opportunitiesV2?.content ?? null
  const artifactVersionLabel = opportunitiesV3?.content ? 'v3' : opportunitiesV2?.content ? 'v2' : null
  const hasOpportunities = Boolean(opportunitiesArtifact)

  // Resolve tab using shared helper (deterministic, loop-proof)
  const tabAvailability: TabAvailability = {
    hasOpportunitiesV3,
    hasStrategicBets,
    hasOpportunitiesV2,
    hasJobs: hasJtbd,
    hasScorecard: hasScoringMatrix,
    hasProfiles,
    hasSynthesis,
  }
  
  const tabResolution = resolveResultsTab(searchParamsObj.tab, tabAvailability)
  const activeTab = tabResolution.tab
  
  // Debug logging (dev only)
  if (process.env.NODE_ENV !== 'production') {
    logger.debug('Results page tab resolution', {
      projectId,
      tabParam: searchParamsObj.tab,
      resolvedTab: activeTab,
      isValid: tabResolution.isValid,
      needsRedirect: tabResolution.needsRedirect,
      availableTabs: Object.entries(tabAvailability)
        .filter(([_, available]) => available)
        .map(([key]) => key),
    })
  }
  
  // Canonical URL enforcement: redirect if tab is missing or invalid
  if (tabResolution.needsRedirect) {
    const canonicalParams = new URLSearchParams()
    canonicalParams.set('tab', activeTab)
    if (frameParam) canonicalParams.set('frame', frameParam)
    if (isGenerating) canonicalParams.set('generating', 'true')
    if (viewResults) canonicalParams.set('view', 'results')
    if (showNewBadge) canonicalParams.set('new', 'true')
    
    const canonicalUrl = `/projects/${projectId}/results?${canonicalParams.toString()}`
    
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Redirecting to canonical URL', {
        from: `/projects/${projectId}/results${searchParamsObj.tab ? `?tab=${searchParamsObj.tab}` : ''}`,
        to: canonicalUrl,
        reason: tabResolution.isValid ? 'missing tab' : 'invalid tab',
      })
    }
    
    redirect(canonicalUrl)
  }

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

  const formattedGeneratedAt = generatedAt
    ? new Date(generatedAt as string).toLocaleString(undefined, {
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

  // Format all markdown content upfront to avoid repeated formatting
  const profilesMarkdown = formatProfilesToMarkdown(profiles?.snapshots)
  const themesMarkdown = formatThemesToMarkdown(synthesis?.synthesis)
  const positioningMarkdown = formatPositioningToMarkdown(synthesis?.synthesis)
  const opportunitiesMarkdown = formatOpportunitiesToMarkdown(synthesis?.synthesis)
  const anglesMarkdown = formatAnglesToMarkdown(synthesis?.synthesis)
  const jtbdMarkdown = formatJtbdToMarkdown(jtbd?.content)
  const opportunitiesV2Markdown = formatOpportunitiesV2ToMarkdown(opportunitiesV2?.content)
  const scoringMarkdown = formatScoringMatrixToMarkdown(scoringMatrix?.content)
  const strategicBetsMarkdown = formatStrategicBetsToMarkdown(strategicBets?.content)
  const opportunitiesV3Markdown = formatOpportunitiesV3ToMarkdown(opportunitiesV3?.content)

  /**
   * Panel registry pattern: Each tab has a dedicated render function
   * This eliminates long ternary chains and prevents JSX delimiter errors
   * by ensuring each panel returns a complete, balanced subtree.
   * 
   * Benefits:
   * - Type-safe: TabId is strongly typed from TAB_IDS
   * - No nested ternaries: Each render() returns complete JSX
   * - Easy to maintain: Add/modify tabs in one place
   * - Prevents "used before declaration" errors: All values computed upfront
   */
  const PANELS: Record<TabId, { 
    label: string
    enabled: boolean
    copyContent: string
    render: () => ReactNode
  }> = {
    profiles: {
      label: 'Profiles',
      enabled: hasProfiles,
      copyContent: profilesMarkdown,
      render: () => <ProfilesSection profiles={profiles} />,
    },
    themes: {
      label: 'Themes',
      enabled: hasSynthesis,
      copyContent: themesMarkdown,
      render: () => <ThemesSection synthesis={synthesis} />,
    },
    positioning: {
      label: 'Positioning',
      enabled: hasSynthesis,
      copyContent: positioningMarkdown,
      render: () => <PositioningSection synthesis={synthesis} />,
    },
    opportunities: {
      label: 'Opportunities (Legacy)',
      enabled: hasSynthesis,
      copyContent: opportunitiesMarkdown,
      render: () => <OpportunitiesSection synthesis={synthesis} />,
    },
    angles: {
      label: 'Angles',
      enabled: hasSynthesis,
      copyContent: anglesMarkdown,
      render: () => <AnglesSection synthesis={synthesis} />,
    },
    jobs: {
      label: 'Jobs',
      enabled: hasJtbd,
      copyContent: jtbdMarkdown,
      render: () => (
        <ProgressiveReveal order={0} enabled={hasJtbd}>
          <JtbdSection
            jtbd={jtbd?.content}
            projectId={verifiedProject.id}
            frame={activeFrame}
          />
        </ProgressiveReveal>
      ),
    },
    scorecard: {
      label: 'Scorecard',
      enabled: hasScoringMatrix,
      copyContent: scoringMarkdown,
      render: () => (
        <ProgressiveReveal order={1} enabled={hasScoringMatrix}>
          <ScoringSection scoring={scoringMatrix?.content} projectId={verifiedProject.id} />
        </ProgressiveReveal>
      ),
    },
    opportunities_v2: {
      label: 'Opportunities (v2)',
      enabled: true, // Always enabled for opportunities-first approach (will show empty state if no content)
      copyContent: opportunitiesV2Markdown,
      render: () => (
        <ProgressiveReveal order={2} enabled={hasOpportunitiesV2}>
          <OpportunitiesV2Section
            opportunities={opportunitiesV2?.content}
            projectId={verifiedProject.id}
            frame={activeFrame}
          />
        </ProgressiveReveal>
      ),
    },
    opportunities_v3: {
      label: 'Opportunities',
      enabled: true, // Always enabled for opportunities-first approach (will show empty state if no content)
      copyContent: opportunitiesV3Markdown,
      render: () => (
        <ProgressiveReveal order={0} enabled={hasOpportunitiesV3}>
          <OpportunitiesV3Section
            opportunities={opportunitiesV3?.content}
            projectId={verifiedProject.id}
          />
        </ProgressiveReveal>
      ),
    },
    strategic_bets: {
      label: normalizeLabel('Strategic Bets'), // Apply terminology normalization
      enabled: hasStrategicBets,
      copyContent: strategicBetsMarkdown,
      render: () => (
        <ProgressiveReveal order={3} enabled={hasStrategicBets}>
          <StrategicBetsSection
            strategicBets={strategicBets?.content}
            projectId={verifiedProject.id}
          />
        </ProgressiveReveal>
      ),
    },
  }

  // Safety check: ensure activeTab exists in PANELS (should never happen, but defensive)
  // activeTab is guaranteed to be valid by resolveResultsTab, but we add a fallback for type safety
  const activePanel = PANELS[activeTab] ?? PANELS[TABS[0]?.id ?? 'opportunities_v3']
  const copyContent = activePanel.copyContent

  // Build metadata for header
  const headerMetadata = [
    {
      label: `${effectiveCompetitorCount} competitors analyzed`,
      value: '',
    },
    ...(formattedGeneratedAt
      ? [
          {
            label: 'Generated',
            value: formattedGeneratedAt,
          },
        ]
      : []),
  ]

  // Build header actions
  const headerActions = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {hasAnyArtifacts && competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS ? (
          <RegenerateButton
            projectId={verifiedProject.id}
            competitorCount={effectiveCompetitorCount}
            label="Regenerate"
          />
        ) : null}
        {!hasAnyArtifacts && competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS ? (
          <GenerateResultsV2Button projectId={verifiedProject.id} label="Generate Analysis" />
        ) : null}
      </div>
      <ArtifactsDebugPanel projectId={verifiedProject.id} />
    </div>
  )

  // Build header navigation
  const headerNavigation = (
    <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground" aria-label="Project navigation">
      <Link
        href="/dashboard"
        className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
      >
        Dashboard
      </Link>
      <span aria-hidden="true" className="text-border">·</span>
      <Link
        href={`/projects/${verifiedProject.id}`}
        className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
      >
        Overview
      </Link>
      <span aria-hidden="true" className="text-border">·</span>
      <Link
        href={`/projects/${verifiedProject.id}/competitors`}
        className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
      >
        Competitors
      </Link>
    </nav>
  )

  return (
    <ResultsPageShell>
      <ResultsHeader
        title="Results"
        subtitle={`${verifiedProject.name} · Competitive landscape analysis and strategic insights`}
        metadata={headerMetadata}
        statusBadge={
          showNewBadge
            ? {
                label: 'New insights generated',
                variant: 'default',
              }
            : undefined
        }
        description="Insights derived from publicly available information from the past 90 days, including marketing materials, reviews, pricing, changelogs, and documentation. Signals updated recently are weighted higher in confidence scores."
        helpLink="/help#results"
        actions={headerActions}
        navigation={headerNavigation}
      />

      {/* Confidence calibration echo - shows once at top of results */}
      {hasAnyArtifacts && (
        <div className="space-y-3">
          <ConfidenceEcho inputConfidence={verifiedProject.input_confidence} />
          <div className="flex justify-end">
            <AssumptionBadge
              level={
                verifiedProject.input_confidence === 'very_confident'
                  ? 'high_confidence'
                  : verifiedProject.input_confidence === 'some_assumptions'
                  ? 'some_assumptions'
                  : verifiedProject.input_confidence === 'exploratory'
                  ? 'exploratory'
                  : null
              }
              explanation={
                verifiedProject.input_confidence === 'some_assumptions'
                  ? 'Some inputs were inferred from available context'
                  : verifiedProject.input_confidence === 'exploratory'
                  ? 'Recommendations are based on early-stage hypotheses'
                  : undefined
              }
            />
          </div>
        </div>
      )}

      {!hasAnyArtifacts ? (
        <SectionCard className="py-16">
          <div className="w-full max-w-md space-y-6 text-center mx-auto">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                Ready to generate your analysis
              </h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                {competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS ? (
                  <>
                    <p>
                      ✓ You have {competitorCount} competitor{competitorCount !== 1 ? 's' : ''} configured
                    </p>
                    <p className="leading-relaxed">
                      <span className="font-medium text-foreground">What's next:</span> Generate your first analysis to view competitive insights, jobs to be done, and strategic opportunities.
                    </p>
                    <p className="text-xs italic">
                      Why this matters: Analysis helps identify defensible opportunities and pressure-test your competitive positioning.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="leading-relaxed">
                      <span className="font-medium text-foreground">What's needed:</span> Add at least {MIN_COMPETITORS_FOR_ANALYSIS} competitors to begin analysis.
                    </p>
                    <p className="text-xs italic">
                      Why this matters: Competitive analysis requires multiple perspectives to identify patterns and gaps.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS ? (
                <GenerateResultsV2Button
                  projectId={verifiedProject.id}
                  label="Generate Analysis"
                />
              ) : (
                <Button asChild type="button" size="default">
                  <Link href={`/projects/${verifiedProject.id}/competitors`}>
                    Add Competitors
                  </Link>
                </Button>
              )}
              {competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS && (
                <Button asChild variant="outline" type="button">
                  <Link href={`/projects/${verifiedProject.id}/competitors`}>
                    Review inputs
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </SectionCard>
      ) : (
        <section className="flex flex-col gap-6">
            {/* Run Recap Panel - shows what phases completed */}
            <RunRecapPanel
              projectId={verifiedProject.id}
              hasJobs={hasJtbd}
              hasScorecard={hasScoringMatrix}
              hasOpportunities={hasOpportunitiesV2 || hasOpportunitiesV3}
              hasStrategicBets={hasStrategicBets}
              generatedAt={generatedAt}
              defaultOpen={showNewBadge}
            />

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
            {recommendedNextStepsContent ? (
              <RecommendedNextStepsPanel
                opportunities={recommendedNextStepsContent!}
                projectId={verifiedProject.id}
              />
            ) : opportunitiesV2 === null ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                <p>Opportunities will appear here after analysis is generated.</p>
              </div>
            ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
            <nav
              className="tabs-list"
              aria-label="Analysis sections"
            >
              {TABS.map((tab) => (
                <Link
                  key={tab.id}
                  href={`/projects/${verifiedProject.id}/results?tab=${tab.id}${frameParam ? `&frame=${frameParam}` : ''}`}
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
                projectId={verifiedProject.id}
              />
            )}

          {/* Render active panel using registry - eliminates long ternary chains */}
          {activePanel.render()}
        </section>
      )}
    </ResultsPageShell>
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
        <article key={`${snapshot.competitor_name}-${index}`} className="panel p-6 transition-all duration-150 hover:shadow-sm">
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
                    {normalizeLabel('Evidence')}
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
          <h2 className="text-lg font-semibold text-foreground">
            Jobs To Be Done not yet generated
          </h2>
          <p className="text-sm text-muted-foreground">
            Once analysis is complete, Plinth will identify what customers are trying to accomplish and where current solutions fall short.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <GenerateResultsV2Button
              projectId={projectId}
              label="Generate Analysis"
            />
            <Button asChild variant="outline" type="button">
              <Link href={`/projects/${projectId}/competitors`}>
                Review inputs
              </Link>
            </Button>
          </div>
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
              <article key={`${group.id}-${index}`} className="panel p-6 transition-all duration-150 hover:shadow-sm">
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
          <h2 className="text-lg font-semibold text-foreground">
            Opportunities not yet generated
          </h2>
          <p className="text-sm text-muted-foreground">
            Once analysis is complete, Plinth will surface defensible opportunities ranked by impact, effort, and competitive moat strength.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <GenerateResultsV2Button
              projectId={projectId}
              label="Generate Analysis"
            />
            <Button asChild variant="outline" type="button">
              <Link href={`/projects/${projectId}/competitors`}>
                Review inputs
              </Link>
            </Button>
          </div>
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
                <article key={`${group.id}-${index}`} className="panel p-6 transition-all duration-150 hover:shadow-sm">
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
      <SectionCard className="py-16">
        <div className="w-full max-w-md space-y-6 text-center mx-auto">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Competitive scorecard not yet generated
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Once analysis is complete, Plinth will evaluate competitors on key criteria that matter to buyers, weighted by importance.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <GenerateResultsV2Button
              projectId={projectId}
              label="Generate Analysis"
            />
            <Button asChild variant="outline" type="button">
              <Link href={`/projects/${projectId}/competitors`}>
                Review inputs
              </Link>
            </Button>
          </div>
        </div>
      </SectionCard>
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
      <SectionCard>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Scorecard</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Evaluates each competitor on key criteria that matter to buyers. Scores are weighted by importance (1–5), with total scores out of 100.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Signals: Live evidence from pricing, product, hiring, and positioning
          </p>
        </div>
      </SectionCard>

      {/* Bar Chart */}
      {sortedSummary.length > 0 ? (
        <SectionCard>
          <h2 className="text-xl font-semibold text-foreground mb-6">Score overview</h2>
          <CompetitorScoreBarChart data={sortedSummary} />
        </SectionCard>
      ) : null}
      {scoring.criteria?.length ? (
        <SectionCard>
          <h2 className="text-xl font-semibold text-foreground mb-6">Evaluation criteria</h2>
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
        </SectionCard>
      ) : null}

      {sortedSummary.length ? (
        <SectionCard>
          <h2 className="text-xl font-semibold text-foreground mb-6">Competitor breakdown</h2>
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
        </SectionCard>
      ) : null}

      {scoring.notes ? (
        <SectionCard>
          <h2 className="text-xl font-semibold text-foreground mb-4">Notes</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">{scoring.notes}</p>
        </SectionCard>
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
      <SectionCard className="py-16">
        <div className="w-full max-w-md space-y-6 text-center mx-auto">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              No opportunities generated yet
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Once inputs are confirmed, Plinth will surface defensible opportunities ranked by impact and confidence.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <GenerateResultsV2Button
              projectId={projectId}
              label="Generate Analysis"
            />
            <Button asChild variant="outline" type="button">
              <Link href={`/projects/${projectId}/competitors`}>
                Review inputs
              </Link>
            </Button>
          </div>
        </div>
      </SectionCard>
    )
  }

  // Sort by score descending
  const sortedOpportunities = [...opportunities.opportunities].sort((a, b) => {
    const scoreA = getOpportunityScore(a) ?? 0
    const scoreB = getOpportunityScore(b) ?? 0
    return scoreB - scoreA
  })

  // Compute aggregate confidence for summary
  const aggregateConfidence = computeAggregateConfidence(sortedOpportunities)

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
      {/* Results header with progressive reveal message */}
      <ProgressiveRevealWrapper section="top" storageKey="opportunities-progressive-reveal">
        <div className="mb-4 rounded-lg bg-muted/30 border border-border p-4">
          <p className="text-sm text-foreground font-medium mb-1">Results are ready</p>
          <p className="text-sm text-muted-foreground">
            Start with the top opportunity. Everything else supports why it's worth betting on.
          </p>
        </div>
      </ProgressiveRevealWrapper>

      {/* "If you did only one thing" panel */}
      <ProgressiveRevealWrapper section="top" storageKey="opportunities-progressive-reveal">
        <SectionCard className="border-2 border-primary/20">
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
      </SectionCard>
      </ProgressiveRevealWrapper>

      {/* Explainer */}
      <SectionCard>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Opportunities</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            A defensible way to win that forces competitors to react. Ranked opportunities with citation-backed proof points, deterministic score breakdowns, and actionable experiments. Each opportunity includes what makes it defensible and why competitors won't follow.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Score: Confidence-weighted likelihood of advantage over 12–18 months
          </p>
        </div>
      </SectionCard>

      {/* Decision Confidence Summary */}
      <ProgressiveRevealWrapper section="top" storageKey="opportunities-progressive-reveal">
        <DecisionConfidenceSummary
          overallLevel={aggregateConfidence.overallLevel}
          totalEvidenceCount={aggregateConfidence.totalEvidenceCount}
          sourceTypes={aggregateConfidence.sourceTypes}
          averageRecency={aggregateConfidence.averageRecency}
        />
      </ProgressiveRevealWrapper>

      {/* Opportunities list */}
      <ProgressiveRevealWrapper section="list" storageKey="opportunities-progressive-reveal">
        <div className="space-y-6">
          {sortedOpportunities.map((opp, index) => {
        const whyNowSignals = getWhyNowSignals(opp)
        const decisionFrame = getDecisionFrame(opp)
        const confidence = computeDecisionConfidence(opp)
        
        return (
        <SectionCard key={opp.id || index} className="space-y-6 transition-all duration-150 hover:shadow-sm">
          <header className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-semibold text-foreground leading-tight mb-2">{opp.title}</h2>
                <p className="text-base text-foreground leading-relaxed">{opp.one_liner}</p>
              </div>
              {getOpportunityScore(opp) !== null && (
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="primary" className="text-base px-3 py-1.5">
                    {getOpportunityScore(opp)}/100
                  </Badge>
                  <span className="text-xs text-muted-foreground">Score</span>
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

          {/* Decision Confidence Panel */}
          <DecisionConfidencePanel confidence={confidence} />

          {/* Hard to copy because - prominent callout */}
          <HardToCopyCallout opportunity={opp} />

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
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Problem Today
              </h3>
              <p className="text-sm text-foreground leading-relaxed max-w-3xl">{opp.problem_today}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Proposed Move
              </h3>
              <p className="text-sm text-foreground leading-relaxed max-w-3xl">{opp.proposed_move}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Why Now
              </h3>
              <p className="text-sm text-foreground leading-relaxed max-w-3xl">{opp.why_now}</p>
            </div>

            {/* Proof Points */}
            {opp.proof_points?.length ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  {normalizeLabel('Proof Points')}
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
        </SectionCard>
          )
        })}
        </div>
      </ProgressiveRevealWrapper>
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
      <SectionCard className="py-16">
        <div className="w-full max-w-md space-y-6 text-center mx-auto">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              {normalizeLabel('Strategic Bets')} not yet generated
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Once analysis is complete, Plinth will generate {normalizeLabel('strategic bets').toLowerCase()} along with jobs, scorecard, and opportunities. These convert opportunities into commitment-ready decisions with explicit tradeoffs.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <GenerateResultsV2Button
              projectId={projectId}
              label="Generate Analysis"
            />
            <Button asChild variant="outline" type="button">
              <Link href={`/projects/${projectId}/competitors`}>
                Review inputs
              </Link>
            </Button>
          </div>
        </div>
      </SectionCard>
    )
  }

  return (
    <section className="space-y-6">
      {/* Explainer */}
      <div className="rounded-lg bg-muted/50 border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">{normalizeLabel('Strategic Bets')}</h3>
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
          <article key={bet.id || index} className="panel p-6 space-y-6 transition-all duration-150 hover:shadow-sm">
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

