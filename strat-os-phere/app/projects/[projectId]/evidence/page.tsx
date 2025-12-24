import { notFound } from 'next/navigation'
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

interface EvidencePageProps {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata(props: EvidencePageProps): Promise<Metadata> {
  const params = await props.params
  return createPageMetadata({
    title: "Evidence — Plinth",
    description:
      "Evidence and citations supporting the competitive analysis.",
    path: `/projects/${params.projectId}/evidence`,
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

  try {
    const supabase = await createClient()
    
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

    // Load related data with error handling - default to empty arrays on failure
    let artifacts: Awaited<ReturnType<typeof listArtifacts>> = []
    let evidenceBundle: Awaited<ReturnType<typeof readLatestEvidenceBundle>> = null

    try {
      const [artifactsResult, evidenceBundleResult] = await Promise.all([
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
      ])
      
      artifacts = artifactsResult ?? []
      evidenceBundle = evidenceBundleResult ?? null
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

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
      <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
        <EvidenceContent
          projectId={projectId}
          opportunitiesV3={opportunitiesV3?.content}
          opportunitiesV2={opportunitiesV2?.content}
          profiles={profiles?.snapshots ? { snapshots: profiles.snapshots } : null}
          strategicBets={strategicBets?.content}
          jtbd={jtbd?.content}
          bundle={evidenceBundle}
        />
      </main>
    </div>
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

