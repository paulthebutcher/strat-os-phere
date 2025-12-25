import type { Metadata } from 'next'

import { AnalysisWizard } from '@/components/onboarding/AnalysisWizard'
import { createClient } from '@/lib/supabase/server'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import { createPageMetadata } from '@/lib/seo/metadata'
import type { SearchParams } from '@/lib/routing/searchParams'
import { isParamTruthy, getParam } from '@/lib/routing/searchParams'
import { NewAnalysisPageClient } from './NewAnalysisPageClient'

/**
 * New Analysis Page
 * 
 * Canonical entry point for creating a new analysis.
 * Works for both logged-in and logged-out users.
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

  const isGuidedMode = isParamTruthy(props.searchParams, 'onboarding')
  const isAuthenticated = !!user
  
  // Get example parameter for pre-filling
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

