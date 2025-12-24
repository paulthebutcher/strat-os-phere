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
      // Handle different error kinds
      if (projectResult.kind === 'not_found' || projectResult.kind === 'unauthorized') {
        notFound()
      }
      
      // For query failures (including schema drift), show error state
      return <ProjectErrorState projectId={projectId} isMissingColumn={projectResult.isMissingColumn} />
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
    
    // Show error state instead of crashing
    return <ProjectErrorState projectId={projectId} />
  }
}

