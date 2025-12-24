import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { getProjectById } from '@/lib/data/projects'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'
import { EvidenceContent } from '@/components/results/EvidenceContent'
import { readLatestEvidenceBundle } from '@/lib/evidence/readBundle'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { logProjectError } from '@/lib/projects/logProjectError'
import { isMissingColumnError } from '@/lib/db/safeDb'

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
    
    // Show error state instead of crashing
    return <ProjectErrorState projectId={projectId} />
  }
}

