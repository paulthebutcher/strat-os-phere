import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'

interface OpportunitiesPageProps {
  params: Promise<{
    projectId: string
  }>
  searchParams?: Promise<{
    frame?: string
  }>
}

export async function generateMetadata(props: OpportunitiesPageProps): Promise<Metadata> {
  const params = await props.params
  return createPageMetadata({
    title: "Opportunities — Plinth",
    description:
      "Strategic opportunities ranked by score with actionable experiments and proof points.",
    path: `/projects/${params.projectId}/opportunities`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

export default async function OpportunitiesPage(props: OpportunitiesPageProps) {
  const params = await props.params
  const projectId = params.projectId
  
  // Temporary redirect to results page with tab parameter
  // TODO: Extract section components and render properly
  redirect(`/projects/${projectId}/results?tab=opportunities_v3`)
}

