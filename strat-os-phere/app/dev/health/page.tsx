import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SchemaHealthClient } from './SchemaHealthClient'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Schema Health — Dev Tools',
    description: 'Dev-only schema health report',
    robots: {
      index: false,
      follow: false,
    },
  }
}

/**
 * Dev-only Schema Health page
 * Gated behind NODE_ENV !== 'production' or ENABLE_DEV_TOOLS === 'true'
 */
export default async function SchemaHealthPage() {
  // Check if dev tools are enabled
  const isProduction = process.env.NODE_ENV === 'production'
  const devToolsEnabled = process.env.ENABLE_DEV_TOOLS === 'true'

  if (isProduction && !devToolsEnabled) {
    notFound()
  }

  // Verify user is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  return <SchemaHealthClient />
}

