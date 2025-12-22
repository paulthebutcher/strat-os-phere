import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { getProjectById } from '@/lib/data/projects'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'
import { AppendixContent } from '@/components/results/AppendixContent'

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
}

