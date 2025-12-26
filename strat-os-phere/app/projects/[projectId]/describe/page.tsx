import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createClient } from '@/lib/supabase/server'
import { getProjectSafe } from '@/lib/data/projectsContract'
import { createPageMetadata } from '@/lib/seo/metadata'
import { DescribePageClient } from './DescribePageClient'
import { loadProject } from '@/lib/projects/loadProject'

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
 * Shows a form for users to describe their analysis context.
 * After submission, infers competitor names (not URLs) and navigates to Step 2.
 */
export default async function DescribePage(props: DescribePageProps) {
  const params = await props.params
  const projectId = params.projectId

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Verify project exists and belongs to user
  const projectResult = await loadProject(supabase, projectId, user.id)
  if (!projectResult.ok) {
    notFound()
  }

  const project = projectResult.project

  // Load existing project inputs if any
  let existingInputs: Record<string, any> = {}
  try {
    const { getLatestProjectInput } = await import('@/lib/data/projectInputs')
    const inputResult = await getLatestProjectInput(supabase, projectId)
    if (inputResult.ok && inputResult.data && inputResult.data.input_json) {
      existingInputs = inputResult.data.input_json as Record<string, any>
    }
  } catch (error) {
    // Ignore errors loading inputs - we'll start fresh
  }

  return (
    <DescribePageClient
      projectId={projectId}
      projectName={project.name}
      existingInputs={existingInputs}
    />
  )
}
