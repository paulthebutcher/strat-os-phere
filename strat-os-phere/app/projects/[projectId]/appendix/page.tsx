import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { loadProject } from '@/lib/projects/loadProject'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'
import { AppendixContent } from '@/components/results/AppendixContent'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { logProjectError } from '@/lib/projects/logProjectError'

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

