import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { EvidenceReportClient } from './EvidenceReportClient'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Evidence Report — Dev Tools',
    description: 'Dev-only evidence bundle health report',
    robots: {
      index: false,
      follow: false,
    },
  }
}

/**
 * Dev-only Evidence Report page
 * Gated behind NODE_ENV !== 'production' or ENABLE_DEV_TOOLS === 'true'
 */
export default async function EvidenceReportPage() {
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

  return <EvidenceReportClient />
}

