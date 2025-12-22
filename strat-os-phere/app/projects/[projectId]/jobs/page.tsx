import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'

interface JobsPageProps {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata(props: JobsPageProps): Promise<Metadata> {
  const params = await props.params
  return createPageMetadata({
    title: "Jobs — Plinth",
    description:
      "Jobs To Be Done analysis showing customer tasks, outcomes, and opportunity scores.",
    path: `/projects/${params.projectId}/jobs`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

export default async function JobsPage(props: JobsPageProps) {
  const params = await props.params
  const projectId = params.projectId
  
  // Temporary redirect to results page with tab parameter
  // TODO: Extract section components and render properly
  redirect(`/projects/${projectId}/results?tab=jobs`)
}

