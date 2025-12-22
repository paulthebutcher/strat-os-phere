import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'

interface OpportunitiesPageProps {
  params: Promise<{
    projectId: string
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

/**
 * DEPRECATED: Legacy opportunities route
 * 
 * Redirects to the canonical results route.
 * This page is kept for backwards compatibility with existing links.
 * 
 * Canonical route: /projects/[projectId]/results
 */
export default async function OpportunitiesPage(props: OpportunitiesPageProps) {
  const params = await props.params
  const projectId = params.projectId
  
  // Redirect to canonical results route
  redirect(`/projects/${projectId}/results`)
}

