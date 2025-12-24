import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { loadProject } from '@/lib/projects/loadProject'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'
import { ScorecardContent } from '@/components/results/ScorecardContent'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { logProjectError } from '@/lib/projects/logProjectError'
import { toAppError, SchemaMismatchError, NotFoundError, UnauthorizedError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'

interface ScorecardPageProps {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata(props: ScorecardPageProps): Promise<Metadata> {
  const params = await props.params
  return createPageMetadata({
    title: "Scorecard — Plinth",
    description:
      "Competitive scorecard evaluating competitors on key criteria weighted by importance.",
    path: `/projects/${params.projectId}/scorecard`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

export default async function ScorecardPage(props: ScorecardPageProps) {
  const params = await props.params
  const projectId = params.projectId
  const route = `/projects/${projectId}/scorecard`

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
      
      logAppError('project.scorecard', appError, { projectId, route, kind: projectResult.kind })
      
      // For not_found and unauthorized, use Next.js notFound()
      if (projectResult.kind === 'not_found' || projectResult.kind === 'unauthorized') {
        notFound()
      }
      
      // For query failures, show error state
      return <ProjectErrorState error={appError} projectId={projectId} />
    }

    const { project } = projectResult

    // Load artifacts with error handling - default to empty array on failure
    let artifacts: Awaited<ReturnType<typeof listArtifacts>> = []
    try {
      artifacts = await listArtifacts(supabase, { projectId }).catch((error) => {
        logProjectError({
          route,
          projectId,
          queryName: 'listArtifacts',
          error,
        })
        return []
      })
      artifacts = artifacts ?? []
    } catch (error) {
      // Log but continue - we'll show empty state
      logProjectError({
        route,
        projectId,
        queryName: 'loadArtifacts',
        error,
      })
    }
    
    const normalized = normalizeResultsArtifacts(artifacts)
  const { scoringMatrix } = normalized

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
      <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
        <ScorecardContent
          projectId={projectId}
          scoring={scoringMatrix?.content}
        />
      </main>
    </div>
    )
  } catch (error) {
    // Log any unexpected errors
    logProjectError({
      route,
      projectId,
      queryName: 'ScorecardPage',
      error,
    })
    
    // Convert to AppError and show error state
    const appError = toAppError(error, { projectId, route })
    logAppError('project.scorecard', appError, { projectId, route })
    return <ProjectErrorState error={appError} projectId={projectId} />
  }
}

