import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { getProjectById } from '@/lib/data/projects'
import { createClient } from '@/lib/supabase/server'

interface ResultsPageProps {
  params: Promise<{
    projectId: string
  }>
  searchParams?: Promise<{
    tab?: string
  }>
}

export async function generateMetadata(props: ResultsPageProps): Promise<Metadata> {
  const params = await props.params
  return createPageMetadata({
    title: "Results — Plinth",
    description: "Competitive analysis results and insights.",
    path: `/projects/${params.projectId}/results`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

/**
 * Legacy results route with tab support
 * 
 * Handles legacy /results?tab=xyz URLs and redirects to canonical routes.
 * If no tab is specified, redirects to opportunities (canonical results view).
 */
export default async function ResultsPage(props: ResultsPageProps) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams ?? Promise.resolve({}),
  ])
  const projectId = params.projectId
  const searchParamsObj = (await searchParams) as { tab?: string } | undefined
  const tab = searchParamsObj?.tab

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

  // Map legacy tab values to canonical routes
  const tabToRoute: Record<string, string> = {
    overview: `/projects/${projectId}/overview`,
    opportunities: `/projects/${projectId}/opportunities`,
    strategic_bets: `/projects/${projectId}/opportunities`, // Strategic bets are shown in opportunities
    jobs: `/projects/${projectId}/opportunities`, // Jobs are shown in opportunities
    scorecard: `/projects/${projectId}/scorecard`,
    competitors: `/projects/${projectId}/competitors`,
    evidence: `/projects/${projectId}/evidence`,
    settings: `/projects/${projectId}/settings`,
  }

  // If a tab is specified, redirect to the canonical route
  if (tab && tabToRoute[tab]) {
    redirect(tabToRoute[tab])
  }

  // Default: redirect to opportunities (canonical results view)
  redirect(`/projects/${projectId}/opportunities`)
}
