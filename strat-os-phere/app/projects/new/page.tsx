import { redirect } from 'next/navigation'

import { AnalysisWizard } from '@/components/onboarding/AnalysisWizard'
import { createClient } from '@/lib/supabase/server'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'

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
interface NewProjectPageProps {
  searchParams?: Promise<{
    onboarding?: string
  }>
}

export default async function NewProjectPage(props: NewProjectPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const searchParams = await (props.searchParams ?? Promise.resolve({}))
  const isGuidedMode = searchParams.onboarding === '1'

  return (
    <PageGuidanceWrapper pageId="new_project">
      <div className="min-h-[calc(100vh-57px)]">
        <main className="w-full py-8">
          <AnalysisWizard isGuidedMode={isGuidedMode} />
        </main>
      </div>
    </PageGuidanceWrapper>
  )
}


