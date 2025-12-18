import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { LoginForm } from './login-form'

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <main className="panel flex w-full max-w-md flex-col gap-6 px-6 py-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Sign in to StratOSphere</h1>
          <p className="text-sm text-muted-foreground">
            A quiet workspace for serious strategy work.
          </p>
        </header>
        <LoginForm />
      </main>
    </div>
  )
}

