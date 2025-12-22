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
    title: "Strategic Bets — Plinth",
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

export default async function StrategicBetsPage(props: StrategicBetsPageProps) {
  const params = await props.params
  const projectId = params.projectId
  
  // Temporary redirect to results page with tab parameter
  // TODO: Extract section components and render properly
  redirect(`/projects/${projectId}/results?tab=strategic_bets`)
}

