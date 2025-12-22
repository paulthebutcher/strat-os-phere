import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { createPageMetadata } from '@/lib/seo/metadata'
import { projectRoutes } from '@/lib/routing/projectRoutes'

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

export default async function ResultsPage(props: ResultsPageProps) {
  const params = await props.params
  const searchParams = await (props.searchParams ?? Promise.resolve({}))
  const projectId = params.projectId
  const tabParam = (searchParams as { tab?: string }).tab

  // Map legacy tab parameters to canonical routes
  // opportunities_* → /projects/[id]/opportunities
  // competitors → /projects/[id]/competitors
  // scorecard → /projects/[id]/scorecard
  // jobs/themes/profiles/positioning → /projects/[id]/appendix
  // default → /projects/[id]/opportunities

  if (!tabParam) {
    // No tab param - redirect to opportunities (primary screen)
    redirect(projectRoutes.opportunities(projectId))
  }

  const tab = tabParam.toLowerCase()

  // Map opportunities variants to opportunities route
  if (tab.startsWith('opportunities') || tab === 'opps' || tab === 'opp') {
    redirect(projectRoutes.opportunities(projectId))
  }

  // Map other tabs to their canonical routes
  if (tab === 'competitors') {
    redirect(projectRoutes.competitors(projectId))
  }

  if (tab === 'scorecard') {
    redirect(projectRoutes.scorecard(projectId))
  }

  if (tab === 'evidence') {
    redirect(projectRoutes.evidence(projectId))
  }

  // Map appendix-related tabs to appendix route
  if (tab === 'jobs' || tab === 'themes' || tab === 'profiles' || tab === 'positioning' || tab === 'strategic_bets') {
    redirect(projectRoutes.appendix(projectId))
  }

  // Default fallback to opportunities
  redirect(projectRoutes.opportunities(projectId))
}
