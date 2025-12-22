import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { getProjectById } from '@/lib/data/projects'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'
import { ScorecardContent } from '@/components/results/ScorecardContent'

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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const project = await getProjectById(supabase, projectId)

  if (!project || project.user_id !== user.id) {
    notFound()
  }

  const artifacts = await listArtifacts(supabase, { projectId })
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
}

