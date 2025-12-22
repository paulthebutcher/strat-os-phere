import { redirect } from 'next/navigation'

import { NewAnalysisForm } from '@/components/projects/NewAnalysisForm'
import { createClient } from '@/lib/supabase/server'

export default async function NewProjectPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-[calc(100vh-57px)]">
      <main className="w-full py-8">
        <NewAnalysisForm />
      </main>
    </div>
  )
}


