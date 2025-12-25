import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { createClient } from '@/lib/supabase/server'
import { LoginForm } from './login-form'
import { createPageMetadata } from '@/lib/seo/metadata'
import type { SearchParams } from '@/lib/routing/searchParams'
import { getParam } from '@/lib/routing/searchParams'

interface LoginPageProps {
  searchParams?: SearchParams
}

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Sign in",
    description: "Sign in to your Plinth workspace. A quiet workspace for serious strategy work.",
    path: "/login",
    ogVariant: "default",
    robots: {
      index: false,
      follow: true,
    },
    canonical: false,
  });
}

export default async function LoginPage(props: LoginPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // If there's a next parameter, redirect there; otherwise dashboard
    const next = getParam(props.searchParams, 'next')
    if (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('http')) {
      redirect(next)
    }
    redirect('/dashboard')
  }

  const next = getParam(props.searchParams, 'next')

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-background px-4">
      <main className="panel flex w-full max-w-md flex-col gap-6 px-6 py-8">
        <header className="space-y-1">
          <h1>Sign in to Plinth</h1>
          <p className="text-sm text-text-secondary">
            A quiet workspace for serious strategy work.
          </p>
        </header>
        <LoginForm next={next || undefined} />
      </main>
    </div>
  )
}

