import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { listArtifacts } from '@/lib/data/artifacts'
import { getProjectById } from '@/lib/data/projects'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import { createClient } from '@/lib/supabase/server'
import { EvidenceContent } from '@/components/results/EvidenceContent'

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
  const { opportunitiesV3, opportunitiesV2, profiles, strategicBets, jtbd } = normalized

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
      <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
        <EvidenceContent
          opportunitiesV3={opportunitiesV3?.content}
          opportunitiesV2={opportunitiesV2?.content}
          profiles={profiles?.snapshots ? { snapshots: profiles.snapshots } : null}
          strategicBets={strategicBets?.content}
          jtbd={jtbd?.content}
        />
      </main>
    </div>
  )
}

