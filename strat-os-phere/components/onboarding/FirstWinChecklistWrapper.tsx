'use client'

import { Suspense } from 'react'
import { FirstWinChecklist } from './FirstWinChecklist'
import { useGuidedMode } from '@/lib/onboarding/useGuidedMode'
import type { Project } from '@/lib/supabase/types'

interface FirstWinChecklistWrapperProps {
  projectId?: string
  project?: Project | null
  competitorCount?: number
  hasResults?: boolean
}

/**
 * Inner component that uses the hook (must be in Suspense boundary).
 */
function FirstWinChecklistInner({
  projectId,
  project,
  competitorCount = 0,
  hasResults = false,
}: FirstWinChecklistWrapperProps) {
  const isGuided = useGuidedMode()

  if (!isGuided) {
    return null
  }

  return (
    <FirstWinChecklist
      mode="guided"
      projectId={projectId}
      inputs={{
        name: project?.name,
        market: project?.market,
        customer: project?.target_customer,
        goal: project?.business_goal ?? undefined,
        product: project?.your_product ?? undefined,
      }}
      competitorCount={competitorCount}
      hasResults={hasResults}
    />
  )
}

/**
 * Client wrapper that detects guided mode and renders the checklist.
 * Wraps in Suspense for useSearchParams compatibility.
 */
export function FirstWinChecklistWrapper(props: FirstWinChecklistWrapperProps) {
  return (
    <Suspense fallback={null}>
      <FirstWinChecklistInner {...props} />
    </Suspense>
  )
}

