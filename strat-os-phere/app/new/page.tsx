import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AnalysisWizard } from '@/components/onboarding/AnalysisWizard'
import { createClient } from '@/lib/supabase/server'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import { createPageMetadata } from '@/lib/seo/metadata'
import type { SearchParams } from '@/lib/routing/searchParams'
import { isParamTruthy, getParam } from '@/lib/routing/searchParams'
import { NewAnalysisPageClient } from './NewAnalysisPageClient'
import { createNewAnalysis } from '@/app/projects/actions'

/**
 * New Analysis Page
 * 
 * Canonical entry point for creating a new analysis.
 * 
 * For authenticated users: Always creates a fresh project and redirects to describe step.
 * For logged-out users: Shows wizard (will create project after login).
 * 
 * Guided Mode:
 * To trigger guided onboarding mode, add ?onboarding=1 to the URL:
 * /new?onboarding=1
 */
type PageProps = {
  searchParams?: SearchParams
}

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Create a new analysis",
    description: "Start a new competitive analysis. Tell us what to analyze and we'll discover sources, recommend competitors, and generate strategic opportunities.",
    path: "/new",
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

export default async function NewAnalysisPage(props: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthenticated = !!user
  
  // If authenticated, always create a fresh project and redirect to describe step
  // This ensures "New Analysis" always means a brand-new analysis
  if (isAuthenticated) {
    const result = await createNewAnalysis()
    if (result.success && result.projectId) {
      redirect(`/projects/${result.projectId}/describe`)
    }
    // If creation failed, fall through to show error/wizard
  }

  const isGuidedMode = isParamTruthy(props.searchParams, 'onboarding')
  
  // Get example parameter for pre-filling (only used for logged-out users)
  const example = getParam(props.searchParams, 'example')

  return (
    <PageGuidanceWrapper pageId="new_project">
      <NewAnalysisPageClient 
        isGuidedMode={isGuidedMode}
        isAuthenticated={isAuthenticated}
        example={example}
      />
    </PageGuidanceWrapper>
  )
}

