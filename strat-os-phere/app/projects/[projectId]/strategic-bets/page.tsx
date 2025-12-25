import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'

interface StrategicBetsPageProps {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata(props: StrategicBetsPageProps): Promise<Metadata> {
  const params = await props.params
  return createPageMetadata({
    title: "Strategic Bets",
    description:
      "Strategic bets synthesizing analysis into commitment-ready decisions with falsifiable experiments.",
    path: `/projects/${params.projectId}/strategic-bets`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

/**
 * DEPRECATED: Legacy strategic-bets route
 * 
 * Redirects to the canonical results route.
 * Strategic bets are now shown as part of the main results view.
 * 
 * Canonical route: /projects/[projectId]/results
 */
export default async function StrategicBetsPage(props: StrategicBetsPageProps) {
  const params = await props.params
  const projectId = params.projectId
  
  // Redirect to canonical results route
  redirect(`/projects/${projectId}/results`)
}

