import { redirect } from 'next/navigation'

import { AnalysisWizard } from '@/components/onboarding/AnalysisWizard'
import { createClient } from '@/lib/supabase/server'
import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'

export default async function NewProjectPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <PageGuidanceWrapper pageId="new_project">
      <div className="min-h-[calc(100vh-57px)]">
        <main className="w-full py-8">
          <AnalysisWizard />
        </main>
      </div>
    </PageGuidanceWrapper>
  )
}


