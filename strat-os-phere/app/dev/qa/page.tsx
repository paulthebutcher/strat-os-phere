import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { QADashboardClient } from './QADashboardClient'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'QA Dashboard — Dev Tools',
    description: 'Dev-only QA harness for validating test PR changes',
    robots: {
      index: false,
      follow: false,
    },
  }
}

/**
 * Dev-only QA Dashboard
 * 
 * Gated behind NODE_ENV !== 'production' or ENABLE_DEV_TOOLS === 'true'
 * Never accessible in production builds.
 */
export default async function QAPage() {
  // Check if dev tools are enabled
  const isProduction = process.env.NODE_ENV === 'production'
  const devToolsEnabled = process.env.ENABLE_DEV_TOOLS === 'true'

  if (isProduction && !devToolsEnabled) {
    notFound()
  }

  return <QADashboardClient />
}

