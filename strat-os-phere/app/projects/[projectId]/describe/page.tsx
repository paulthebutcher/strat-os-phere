import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createClient } from '@/lib/supabase/server'
import { getProjectSafe } from '@/lib/data/projectsContract'
import { createPageMetadata } from '@/lib/seo/metadata'

interface DescribePageProps {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata(props: DescribePageProps): Promise<Metadata> {
  const params = await props.params
  const projectId = params.projectId
  
  return createPageMetadata({
    title: "Describe your analysis",
    description: "Step 1: Describe the decision, market, and customer for your competitive analysis.",
    path: `/projects/${projectId}/describe`,
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

/**
 * Describe Page - Step 1 of new analysis flow
 * 
 * For now, redirects to competitors page (Step 2) since the project
 * has already been created. This route exists as the target for
 * "New Analysis" redirects to ensure deterministic behavior.
 * 
 * Future enhancement: Show Step 1 wizard form here for editing
 * project details before proceeding to competitors.
 */
export default async function DescribePage(props: DescribePageProps) {
  const params = await props.params
  const projectId = params.projectId

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify project exists and belongs to user
  const projectResult = await getProjectSafe(supabase, projectId)
  if (!projectResult.ok || !projectResult.data) {
    notFound()
  }

  const project = projectResult.data
  if (project.user_id !== user.id) {
    notFound()
  }

  // Redirect to competitors page (Step 2)
  // This ensures we always land in the project context after creating a new analysis
  redirect(`/projects/${projectId}/competitors`)
}

