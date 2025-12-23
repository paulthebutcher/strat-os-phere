import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { createClient } from '@/lib/supabase/server'
import { createPageMetadata } from '@/lib/seo/metadata'
import { TryContinueClient } from './TryContinueClient'

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Continue — Plinth",
    description: "Continue your analysis setup.",
    path: "/try/continue",
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  })
}

export default async function TryContinuePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/try/continue')
  }

  return <TryContinueClient />
}

