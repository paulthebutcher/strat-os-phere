import { redirect } from 'next/navigation'

import { ProjectForm } from '@/components/project-form'
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
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8 py-10">
        <ProjectForm />
      </main>
    </div>
  )
}


