import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'

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
  
  // Temporary redirect to results page with tab parameter
  // TODO: Extract section components and render properly
  redirect(`/projects/${projectId}/results?tab=scorecard`)
}

