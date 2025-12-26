import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { loadProject } from '@/lib/projects/loadProject'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'
import { EvidenceContent } from '@/components/results/EvidenceContent'
import { readLatestEvidenceBundle } from '@/lib/evidence/readBundle'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { logProjectError } from '@/lib/projects/logProjectError'
import { toAppError, SchemaMismatchError, NotFoundError, UnauthorizedError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'
import { getDecisionRunState } from '@/lib/decisionRun/getDecisionRunState'
import { DecisionRunStatusBanner } from '@/components/decisionRun/DecisionRunStatusBanner'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageSection } from '@/components/layout/Section'
import { resolveActiveRunId } from '@/lib/runs/activeRun'
import { getEvidenceSourcesForRun } from '@/lib/data/evidenceSources'
import { getParam } from '@/lib/routing/searchParams'
import type { SearchParams } from '@/lib/routing/searchParams'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { getLatestProjectInput } from '@/lib/data/projectInputs'
import { logger } from '@/lib/logger'

interface EvidencePageProps {
  params: Promise<{
    projectId: string
  }>
  searchParams?: SearchParams
}

export async function generateMetadata(props: EvidencePageProps): Promise<Metadata> {
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
    title: `Supporting evidence for ${projectName}`,
    description:
      "Evidence and citations supporting the competitive analysis.",
    path: `/projects/${projectId}/evidence`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

export default async function EvidencePage(props: EvidencePageProps) {
  const params = await props.params
  const projectId = params.projectId
  const route = `/projects/${projectId}/evidence`
  const runIdParam = getParam(props.searchParams, 'runId')

  try {
    const supabase = await createClient()
    
    // Resolve active run ID (prefer query param, else latest, don't create)
    const runResolution = await resolveActiveRunId(supabase, projectId, {
      runIdOverride: runIdParam ?? null,
      allowCreate: false,
    })

    const activeRunId = runResolution.runId
    
    // Use unified project loader with structured error handling
    // (loadProject handles user authentication internally)
    const projectResult = await loadProject(supabase, projectId, undefined, route)

    if (!projectResult.ok) {
      // Convert to AppError
      let appError: ReturnType<typeof toAppError>
      
      if (projectResult.kind === 'not_found') {
        appError = new NotFoundError(
          projectResult.message || 'Project not found',
          {
            action: { label: 'Back to Projects', href: '/dashboard' },
            details: { projectId, route },
          }
        )
      } else if (projectResult.kind === 'unauthorized') {
        appError = new UnauthorizedError(
          projectResult.message || 'You do not have access to this project',
          {
            action: { label: 'Sign in', href: '/login' },
            details: { projectId, route },
          }
        )
      } else {
        // query_failed - map to SchemaMismatchError if appropriate
        if (projectResult.isMissingColumn) {
          appError = new SchemaMismatchError(
            projectResult.message || 'Schema mismatch detected',
            {
              details: { projectId, route, isMissingColumn: true },
            }
          )
        } else {
          appError = toAppError(
            new Error(projectResult.message || 'Failed to load project'),
            { projectId, route, kind: projectResult.kind }
          )
        }
      }
      
      logAppError('project.evidence', appError, { projectId, route, kind: projectResult.kind })
      
      // For not_found and unauthorized, use Next.js notFound()
      if (projectResult.kind === 'not_found' || projectResult.kind === 'unauthorized') {
        notFound()
      }
      
      // For query failures, show error state
      return <ProjectErrorState error={appError} projectId={projectId} />
    }

    const { project } = projectResult

    // HARD GATE: Step 3 requires competitor confirmation
    // Check if competitors are confirmed before allowing access to evidence page
    let competitors: Awaited<ReturnType<typeof listCompetitorsForProject>> = []
    let competitorsConfirmed = false
    
    try {
      // Load competitors and project inputs to check confirmation status
      const [competitorsResult, inputResult] = await Promise.all([
        listCompetitorsForProject(supabase, projectId).catch((error) => {
          logProjectError({
            route,
            projectId,
            queryName: 'listCompetitorsForProject (gate check)',
            error,
          })
          return []
        }),
        getLatestProjectInput(supabase, projectId).catch(() => ({ ok: false as const, error: { code: 'UNKNOWN', message: 'Failed to load inputs' } })),
      ])
      
      competitors = competitorsResult ?? []
      
      // Check for confirmation timestamp or boolean flag
      if (inputResult.ok && inputResult.data?.input_json) {
        const inputs = inputResult.data.input_json as Record<string, any>
        competitorsConfirmed = 
          Boolean(inputs.competitorsConfirmedAt) || 
          inputs.competitorsConfirmed === true
      }
      
      // Dev-only logging
      if (process.env.NODE_ENV !== 'production') {
        logger.info('[flow] step3 gate check', {
          projectId,
          confirmed: competitorsConfirmed,
          competitorCount: competitors.length,
          hasConfirmedAt: Boolean(inputResult.ok && inputResult.data?.input_json && (inputResult.data.input_json as Record<string, any>).competitorsConfirmedAt),
        })
      }
      
      // Hard gate: redirect to Step 2 if competitors not confirmed or no competitors exist
      if (!competitorsConfirmed || competitors.length === 0) {
        if (process.env.NODE_ENV !== 'production') {
          logger.info('[flow] step3 gate redirect', {
            projectId,
            confirmed: competitorsConfirmed,
            competitorCount: competitors.length,
          })
        }
        redirect(`/projects/${projectId}/competitors`)
      }
    } catch (error) {
      // If we can't verify confirmation, redirect to be safe
      logProjectError({
        route,
        projectId,
        queryName: 'step3 gate check',
        error,
      })
      if (process.env.NODE_ENV !== 'production') {
        logger.info('[flow] step3 gate redirect (error)', { projectId, error: error instanceof Error ? error.message : 'unknown' })
      }
      redirect(`/projects/${projectId}/competitors`)
    }

    // Load related data with error handling - default to empty arrays on failure
    let artifacts: Awaited<ReturnType<typeof listArtifacts>> = []
    let evidenceBundle: Awaited<ReturnType<typeof readLatestEvidenceBundle>> = null
    let decisionRunState: Awaited<ReturnType<typeof getDecisionRunState>> | null = null
    let evidenceSourcesForRun: Awaited<ReturnType<typeof getEvidenceSourcesForRun>> = []

    try {
      const loadPromises: Promise<unknown>[] = [
        listArtifacts(supabase, { projectId }).catch((error) => {
          logProjectError({
            route,
            projectId,
            queryName: 'listArtifacts',
            error,
          })
          return []
        }),
        readLatestEvidenceBundle(supabase, projectId).catch((error) => {
          logProjectError({
            route,
            projectId,
            queryName: 'readLatestEvidenceBundle',
            error,
          })
          return null
        }),
        getDecisionRunState(supabase, projectId).catch((error) => {
          logProjectError({
            route,
            projectId,
            queryName: 'getDecisionRunState',
            error,
          })
          return null
        }),
      ]

      // Only query evidence sources if we have an active run
      if (activeRunId) {
        loadPromises.push(
          getEvidenceSourcesForRun(supabase, activeRunId).catch((error) => {
            logProjectError({
              route,
              projectId,
              queryName: 'getEvidenceSourcesForRun',
              error,
            })
            return []
          })
        )
      }

      const results = await Promise.all(loadPromises)
      
      artifacts = (results[0] ?? []) as typeof artifacts
      evidenceBundle = (results[1] ?? null) as typeof evidenceBundle
      decisionRunState = (results[2] ?? null) as Awaited<ReturnType<typeof getDecisionRunState>> | null
      if (activeRunId && results[3]) {
        evidenceSourcesForRun = results[3] as typeof evidenceSourcesForRun
      }
    } catch (error) {
      // Log but continue - we'll show empty states
      logProjectError({
        route,
        projectId,
        queryName: 'loadRelatedData',
        error,
      })
    }
    
    const normalized = normalizeResultsArtifacts(artifacts)
    const { opportunitiesV3, opportunitiesV2, profiles, strategicBets, jtbd } = normalized

    // Show empty state if no run exists
    if (!activeRunId) {
      return (
        <PageShell size="wide">
          <PageHeader
            title="Evidence"
            subtitle="Supporting evidence and citations for the competitive analysis."
          />
          <PageSection>
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No analysis run yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate an analysis to start collecting evidence.
              </p>
              <div className="text-xs text-muted-foreground mt-4">
                Run: none • Source: {runResolution.source}
              </div>
            </div>
          </PageSection>
        </PageShell>
      )
    }

    // Check if evidence exists for this run
    const hasEvidenceForRun = evidenceSourcesForRun.length > 0

    return (
      <PageShell size="wide">
        <PageHeader
          title="Evidence"
          subtitle="Supporting evidence and citations for the competitive analysis."
        />

        {/* DecisionRun Status Banner - persistent run/evidence status */}
        {decisionRunState && (
          <PageSection>
            <DecisionRunStatusBanner state={decisionRunState} />
          </PageSection>
        )}

        <PageSection>
          <EvidenceContent
            projectId={projectId}
            opportunitiesV3={opportunitiesV3?.content}
            opportunitiesV2={opportunitiesV2?.content}
            profiles={profiles?.snapshots ? { snapshots: profiles.snapshots } : null}
            strategicBets={strategicBets?.content}
            jtbd={jtbd?.content}
            bundle={hasEvidenceForRun ? evidenceBundle : null}
            evidenceStatus={decisionRunState?.evidenceStatus ?? undefined}
            hasRun={!!activeRunId && !hasEvidenceForRun}
          />
          {/* Show debug info in dev mode */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-muted-foreground mt-4">
              Run: {activeRunId} • Source: {runResolution.source} • Evidence sources: {evidenceSourcesForRun.length}
            </div>
          )}
        </PageSection>
      </PageShell>
    )
  } catch (error) {
    // Log any unexpected errors
    logProjectError({
      route,
      projectId,
      queryName: 'EvidencePage',
      error,
    })
    
    // Convert to AppError and show error state
    const appError = toAppError(error, { projectId, route })
    logAppError('project.evidence', appError, { projectId, route })
    return <ProjectErrorState error={appError} projectId={projectId} />
  }
}

