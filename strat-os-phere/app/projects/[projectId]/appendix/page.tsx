import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { getProjectById } from '@/lib/data/projects'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'
import { AppendixContent } from '@/components/results/AppendixContent'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { logProjectError } from '@/lib/projects/logProjectError'
import { isMissingColumnError } from '@/lib/db/safeDb'

interface AppendixPageProps {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata(props: AppendixPageProps): Promise<Metadata> {
  const params = await props.params
  return createPageMetadata({
    title: "Appendix — Plinth",
    description:
      "Additional analysis artifacts including jobs, themes, profiles, and positioning.",
    path: `/projects/${params.projectId}/appendix`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

export default async function AppendixPage(props: AppendixPageProps) {
  const params = await props.params
  const projectId = params.projectId
  const route = `/projects/${projectId}/appendix`

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

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
      <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
        <AppendixContent
          projectId={projectId}
          normalized={normalized}
        />
      </main>
    </div>
    )
  } catch (error) {
    // Log any unexpected errors
    logProjectError({
      route,
      projectId,
      queryName: 'AppendixPage',
      error,
    })
    
    // Show error state instead of crashing
    return <ProjectErrorState projectId={projectId} />
  }
}

