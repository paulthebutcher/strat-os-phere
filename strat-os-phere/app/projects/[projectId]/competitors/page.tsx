import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { CompetitorsPageClient } from '@/components/competitors/CompetitorsPageClient'
import { EvidencePreviewPanel } from '@/components/competitors/EvidencePreviewPanel'
import { loadProject } from '@/lib/projects/loadProject'
import {
  MAX_COMPETITORS_PER_PROJECT,
  MIN_COMPETITORS_FOR_ANALYSIS,
} from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { DataRecencyNote } from '@/components/shared/DataRecencyNote'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import { AddCompetitorsButton } from '@/components/competitors/AddCompetitorsButton'
import { PAGE_IDS } from '@/lib/guidance/content'
import { TourLink } from '@/components/guidance/TourLink'
import { PageShell } from '@/components/layout/PageShell'
import { logProjectError } from '@/lib/projects/logProjectError'
import { SuggestedCompetitorsPanel } from '@/components/competitors/SuggestedCompetitorsPanel'
import { getProjectStepState } from '@/lib/projects/stepState'
import { getCompetitorsPageModel } from '@/lib/competitors/getCompetitorsPageModel'
import { Button } from '@/components/ui/button'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { FindCompetitorsCard } from '@/components/competitors/FindCompetitorsCard'
import { CompetitorsDebugPanel } from '@/components/competitors/CompetitorsDebugPanel'
import { getLatestProjectInput } from '@/lib/data/projectInputs'

interface CompetitorsPageProps {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata(props: CompetitorsPageProps): Promise<Metadata> {
  const params = await props.params
  const projectId = params.projectId
  
  // Load project name for title
  let projectName = "this project"
  try {
    const supabase = await createClient()
    const projectResult = await loadProject(supabase, projectId)
    if (projectResult.ok) {
      projectName = projectResult.project.name
    }
  } catch (error) {
    // Fallback to generic title if project load fails
  }
  
  return createPageMetadata({
    title: `Competitors for ${projectName}`,
    description:
      "Manage competitors for your competitive analysis. Add and configure competitors to build a comprehensive competitive landscape.",
    path: `/projects/${projectId}/competitors`,
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
  const route = `/projects/${projectId}/competitors`

  // Defensive: Always try to load, never throw
  let supabase
  try {
    supabase = await createClient()
  } catch (error) {
    logProjectError({ route, projectId, queryName: 'createClient', error })
    return (
      <PageGuidanceWrapper pageId={PAGE_IDS.competitors}>
        <div className="flex min-h-[calc(100vh-57px)] items-center justify-center p-4">
          <SurfaceCard className="w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h1 className="text-lg font-semibold">Unable to connect</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Failed to establish database connection. Please try again.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">Back to Projects</Link>
            </Button>
          </SurfaceCard>
        </div>
      </PageGuidanceWrapper>
    )
  }

  // Build view model (defensive - never throws)
  const model = await getCompetitorsPageModel(supabase, projectId)

  // Load debug information (always load, client component decides visibility)
  let debugInfo: {
    tavilyKeyConfigured: boolean
    suggestedNamesCount: number
    hasSuggestedNames: boolean
  } | null = null
  
  try {
    const inputResult = await getLatestProjectInput(supabase, projectId)
    const suggestedNames: string[] =
      inputResult.ok && inputResult.data?.input_json
        ? (inputResult.data.input_json as Record<string, any>).suggestedCompetitorNames || []
        : []
    
    debugInfo = {
      tavilyKeyConfigured: !!process.env.TAVILY_API_KEY,
      suggestedNamesCount: Array.isArray(suggestedNames) ? suggestedNames.length : 0,
      hasSuggestedNames: Array.isArray(suggestedNames) && suggestedNames.length > 0,
    }
  } catch {
    // Ignore errors in debug info gathering
    debugInfo = {
      tavilyKeyConfigured: !!process.env.TAVILY_API_KEY,
      suggestedNamesCount: 0,
      hasSuggestedNames: false,
    }
  }

  // Handle auth errors from model
  if (model.errors.decisionLoad?.includes('access') || model.errors.decisionLoad?.includes('not found')) {
    try {
      const projectResult = await loadProject(supabase, model.projectId)
      if (!projectResult.ok && (projectResult.kind === 'not_found' || projectResult.kind === 'unauthorized')) {
        notFound()
      }
    } catch {
      // Fall through to show error state
    }
  }

  // Load project name for header (defensive)
  let projectName = 'Project'
  try {
    const projectResult = await loadProject(supabase, projectId)
    if (projectResult.ok) {
      projectName = projectResult.project.name
    }
  } catch {
    // Use default name
  }

  // Get step state for counts (defensive)
  let competitorCount = model.existingCompetitors.length
  let readyForAnalysis = false
  let remainingToReady = MIN_COMPETITORS_FOR_ANALYSIS
  let hasAnyArtifacts = false

  try {
    const stepState = await getProjectStepState(supabase, projectId)
    competitorCount = stepState.competitorsCount
    readyForAnalysis = competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS
    remainingToReady = Math.max(0, MIN_COMPETITORS_FOR_ANALYSIS - competitorCount)

    // Load artifacts for preview (defensive)
    try {
      const artifacts = await listArtifacts(supabase, { projectId })
      const normalized = normalizeResultsArtifacts(artifacts || [])
      hasAnyArtifacts = Boolean(
        normalized.profiles ||
        normalized.synthesis ||
        normalized.jtbd ||
        normalized.opportunitiesV2 ||
        normalized.opportunitiesV3 ||
        normalized.scoringMatrix ||
        normalized.strategicBets
      )
    } catch {
      // Ignore - artifacts are optional
    }
  } catch {
    // Use model-based counts as fallback
  }

  // Convert model competitors to format expected by components
  const safeCompetitors = model.existingCompetitors.map((c) => ({
    id: c.id,
    name: c.name,
    url: c.url || null,
    evidence_text: null,
    evidence_citations: null,
    created_at: new Date().toISOString(),
    project_id: projectId,
  }))

  // Render based on model state
  return (
    <PageGuidanceWrapper pageId={PAGE_IDS.competitors}>
      <PageShell size="wide" noLeftPadding>
          <header className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Step 2 · Evidence Base
              </p>
              <div className="flex items-center gap-2">
                <h1>{projectName}</h1>
              </div>
              <p className="text-sm text-text-secondary">
                Plinth scans real competitor signals to ground recommendations before ranking anything.
              </p>
              <TourLink />
              <DataRecencyNote />
            </div>

            <div className="flex flex-col items-start gap-3 text-left md:items-end md:text-right">
              <div className="text-xs text-muted-foreground">
                <p className="font-medium">
                  Competitors: {competitorCount} / {MAX_COMPETITORS_PER_PROJECT}
                </p>
              </div>
              {competitorCount < MIN_COMPETITORS_FOR_ANALYSIS && (
                <>
                  <p className="text-sm text-text-secondary">
                    Add at least {MIN_COMPETITORS_FOR_ANALYSIS} competitors to continue.
                  </p>
                  <AddCompetitorsButton
                    competitorCount={competitorCount}
                    minCompetitors={MIN_COMPETITORS_FOR_ANALYSIS}
                  />
                </>
              )}
            </div>
          </header>

          {/* Error banners (non-blocking) */}
          {model.errors.decisionLoad && !model.errors.decisionLoad.includes('access') && (
            <SurfaceCard className="p-4 border-yellow-500/20 bg-yellow-500/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Decision context unavailable
                  </p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    {model.errors.decisionLoad}
                  </p>
                  {!model.state.hasDecisionContext && (
                    <Button asChild variant="outline" size="sm" className="mt-2">
                      <Link href={`/projects/${projectId}/describe`}>
                        Complete Step 1
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SurfaceCard>
          )}

          {model.errors.competitorsLoad && (
            <SurfaceCard className="p-4 border-yellow-500/20 bg-yellow-500/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    {model.errors.competitorsLoad}
                  </p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
                    You can still add competitors manually below.
                  </p>
                </div>
              </div>
            </SurfaceCard>
          )}

          {/* Load project for FirstWinChecklist (defensive) */}
          {(() => {
            try {
              // This will be handled by the component itself
              return null
            } catch {
              return null
            }
          })()}

          <div className="space-y-6">
            {/* Show suggested competitors panel when ready */}
            {model.suggestionsStatus.state === 'ready' && competitorCount === 0 && (
              <SuggestedCompetitorsPanel
                projectId={projectId}
                suggestedNames={model.suggestions.map((s) => s.name)}
              />
            )}

            {/* Show "Find competitors" card when empty (but can suggest) */}
            {model.suggestionsStatus.state === 'empty' && 
             model.suggestionsStatus.reason !== 'no_step1_context' && 
             competitorCount === 0 && (
              <FindCompetitorsCard projectId={projectId} />
            )}

            {/* Show compact callout when suggestions unavailable */}
            {model.suggestionsStatus.state === 'error' && competitorCount === 0 && (
              <SurfaceCard className="p-4 border-yellow-500/20 bg-yellow-500/10">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      Competitor suggestions unavailable
                    </p>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      {model.suggestionsStatus.message || 'You can still add competitors manually. If this persists, check configuration.'}
                    </p>
                  </div>
                </div>
              </SurfaceCard>
            )}

            {/* Show "Find competitors" card for retry when there's an error */}
            {model.suggestionsStatus.state === 'error' && competitorCount === 0 && (
              <FindCompetitorsCard projectId={projectId} />
            )}

            {/* Show empty state message for no_step1_context */}
            {model.suggestionsStatus.state === 'empty' && 
             model.suggestionsStatus.reason === 'no_step1_context' && 
             competitorCount === 0 && (
              <SurfaceCard className="p-6 space-y-4 border-t-4 border-t-yellow-500/20">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-foreground">
                    Add decision context to unlock suggested competitors
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Complete Step 1 (Decision) to enable automatic competitor suggestions based on your analysis context.
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/projects/${projectId}/describe`}>
                    Go to Decision step
                  </Link>
                </Button>
              </SurfaceCard>
            )}

            {/* Main competitors UI - always show, even if empty */}
            <CompetitorsPageClient
              projectId={projectId}
              competitors={safeCompetitors}
              competitorCount={competitorCount}
              readyForAnalysis={readyForAnalysis}
              remainingToReady={remainingToReady}
              suggestionsStatus={model.suggestionsStatus}
              suggestedNamesCount={model.suggestions.length}
            />
            
            {/* Evidence preview (only if we have competitors) */}
            {competitorCount > 0 && (
              <EvidencePreviewPanel
                projectId={projectId}
                competitorCount={competitorCount}
                competitors={safeCompetitors.map((c) => ({
                  id: c.id,
                  name: c.name,
                  url: c.url ?? null,
                }))}
              />
            )}

            {/* Debug panel (only visible with ?debug=1 or in dev mode) */}
            <CompetitorsDebugPanel
              projectId={projectId}
              competitorCount={competitorCount}
              suggestedNamesCount={model.suggestions.length}
              suggestionsStatus={model.suggestionsStatus}
              debugInfo={debugInfo}
            />
          </div>
      </PageShell>
    </PageGuidanceWrapper>
  )
}

