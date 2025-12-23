import { redirect } from 'next/navigation'

import { AnalysisWizard } from '@/components/onboarding/AnalysisWizard'
import { createClient } from '@/lib/supabase/server'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import type { SearchParams } from '@/lib/routing/searchParams'
import { isParamTruthy } from '@/lib/routing/searchParams'

/**
 * New Project Page
 * 
 * Guided Mode:
 * To trigger guided onboarding mode, add ?onboarding=1 to the URL:
 * /projects/new?onboarding=1
 * 
 * Guided mode provides:
 * - Quality meter showing input quality score
 * - Inline tips that disappear when conditions are met
 * - Example fill button with realistic sample data
 * - First win checklist that follows across key pages
 */
type PageProps = {
  searchParams?: SearchParams
}

export default async function NewProjectPage(props: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const isGuidedMode = isParamTruthy(props.searchParams, 'onboarding')

  return (
    <PageGuidanceWrapper pageId="new_project">
      <AnalysisWizard isGuidedMode={isGuidedMode} />
    </PageGuidanceWrapper>
  )
}


