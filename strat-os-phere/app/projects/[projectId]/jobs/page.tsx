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
    title: "Jobs",
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

/**
 * DEPRECATED: Legacy jobs route
 * 
 * Redirects to the canonical results route.
 * Jobs to be done are now shown as part of the main results view.
 * 
 * Canonical route: /projects/[projectId]/results
 */
export default async function JobsPage(props: JobsPageProps) {
  const params = await props.params
  const projectId = params.projectId
  
  // Redirect to canonical results route
  redirect(`/projects/${projectId}/results`)
}

