'use client'

import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'
import { PAGE_IDS } from '@/lib/guidance/content'

interface DashboardPageClientProps {
  children: React.ReactNode
}

export function DashboardPageClient({ children }: DashboardPageClientProps) {
  return (
    <PageGuidanceWrapper pageId={PAGE_IDS.dashboard}>
      {children}
    </PageGuidanceWrapper>
  )
}

