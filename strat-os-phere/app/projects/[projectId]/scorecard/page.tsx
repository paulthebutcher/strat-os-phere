import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { getProjectById } from '@/lib/data/projects'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'
import { ScorecardContent } from '@/components/results/ScorecardContent'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { logProjectError } from '@/lib/projects/logProjectError'
import { isMissingColumnError } from '@/lib/db/safeDb'

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
    
    // Show error state instead of crashing
    return <ProjectErrorState projectId={projectId} />
  }
}

