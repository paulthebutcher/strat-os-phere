'use client'

import { PageWalkthroughTrigger } from './PageWalkthrough'
import { usePageGuidance } from './PageGuidanceWrapper'

/**
 * Simple component that renders a "Need a quick tour?" link.
 * Must be used within a PageGuidanceWrapper.
 */
export function TourLink({ className }: { className?: string }) {
  const { openWalkthrough } = usePageGuidance()
  return <PageWalkthroughTrigger onOpen={openWalkthrough} className={className} />
}

