import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { loadProject } from '@/lib/projects/loadProject'
import { createClient } from '@/lib/supabase/server'
import { SectionCard } from '@/components/results/SectionCard'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { logProjectError } from '@/lib/projects/logProjectError'
import { toAppError, SchemaMismatchError, NotFoundError, UnauthorizedError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'

interface SettingsPageProps {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata(props: SettingsPageProps): Promise<Metadata> {
  const params = await props.params
  return createPageMetadata({
    title: "Settings — Plinth",
    description:
      "Project settings and configuration.",
    path: `/projects/${params.projectId}/settings`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

export default async function SettingsPage(props: SettingsPageProps) {
  const params = await props.params
  const projectId = params.projectId
  const route = `/projects/${projectId}/settings`

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
      
      logAppError('project.settings', appError, { projectId, route, kind: projectResult.kind })
      
      // For not_found and unauthorized, use Next.js notFound()
      if (projectResult.kind === 'not_found' || projectResult.kind === 'unauthorized') {
        notFound()
      }
      
      // For query failures, show error state
      return <ProjectErrorState error={appError} projectId={projectId} />
    }

    const { project } = projectResult

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
      <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
        <section className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Project settings and configuration.
            </p>
          </div>

          <SectionCard>
            <h2 className="text-lg font-semibold text-foreground mb-4">Project Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Project Name
                </label>
                <p className="text-sm text-foreground mt-1">{project.name || 'Untitled Project'}</p>
              </div>
              {project.market && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Market
                  </label>
                  <p className="text-sm text-foreground mt-1">{project.market}</p>
                </div>
              )}
            </div>
          </SectionCard>
        </section>
      </main>
    </div>
    )
  } catch (error) {
    // Log any unexpected errors
    logProjectError({
      route,
      projectId,
      queryName: 'SettingsPage',
      error,
    })
    
    // Convert to AppError and show error state
    const appError = toAppError(error, { projectId, route })
    logAppError('project.settings', appError, { projectId, route })
    return <ProjectErrorState error={appError} projectId={projectId} />
  }
}

