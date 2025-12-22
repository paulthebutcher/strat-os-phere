'use client'

import { PageGuidanceWrapper } from '@/components/guidance/PageGuidanceWrapper'

interface DashboardPageClientProps {
  children: React.ReactNode
}

export function DashboardPageClient({ children }: DashboardPageClientProps) {
  return (
    <PageGuidanceWrapper pageId="dashboard">
      {children}
    </PageGuidanceWrapper>
  )
}

