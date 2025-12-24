import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { getProjectById } from '@/lib/data/projects'
import { createClient } from '@/lib/supabase/server'
import { SectionCard } from '@/components/results/SectionCard'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { logProjectError } from '@/lib/projects/logProjectError'
import { isMissingColumnError } from '@/lib/db/safeDb'

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
    
    // Get user with error handling
    let user
    try {
      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        logProjectError({
          route,
          projectId,
          queryName: 'auth.getUser',
          error: userError,
        })
        notFound()
      }

      user = authUser
    } catch (error) {
      logProjectError({
        route,
        projectId,
        queryName: 'auth.getUser',
        error,
      })
      notFound()
    }

    if (!user) {
      notFound()
    }

    // Get project with error handling
    let project
    try {
      project = await getProjectById(supabase, projectId)
    } catch (error) {
      logProjectError({
        route,
        projectId,
        queryName: 'getProjectById',
        error,
      })
      
      // If it's a schema drift error, show error state instead of crashing
      if (isMissingColumnError(error)) {
        return <ProjectErrorState projectId={projectId} />
      }
      
      // Re-throw other errors to trigger error boundary
      throw error
    }

    if (!project || project.user_id !== user.id) {
      notFound()
    }

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
    
    // Show error state instead of crashing
    return <ProjectErrorState projectId={projectId} />
  }
}

