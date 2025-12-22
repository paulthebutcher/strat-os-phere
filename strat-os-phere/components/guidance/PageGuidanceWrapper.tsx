'use client'

import { useState, createContext, useContext } from 'react'
import { PageWalkthrough } from './PageWalkthrough'
import type { PageId } from '@/lib/guidance/content'

interface PageGuidanceContextValue {
  openWalkthrough: () => void
}

const PageGuidanceContext = createContext<PageGuidanceContextValue | null>(null)

export function usePageGuidance() {
  const context = useContext(PageGuidanceContext)
  if (!context) {
    throw new Error('usePageGuidance must be used within PageGuidanceWrapper')
  }
  return context
}

interface PageGuidanceWrapperProps {
  pageId: PageId
  children: React.ReactNode
}

/**
 * Wrapper component that adds walkthrough functionality to a page.
 * Provides context for opening the walkthrough from anywhere in the page.
 */
export function PageGuidanceWrapper({
  pageId,
  children,
}: PageGuidanceWrapperProps) {
  const [walkthroughOpen, setWalkthroughOpen] = useState(false)

  return (
    <PageGuidanceContext.Provider
      value={{ openWalkthrough: () => setWalkthroughOpen(true) }}
    >
      {children}
      <PageWalkthrough
        pageId={pageId}
        open={walkthroughOpen}
        onOpenChange={setWalkthroughOpen}
      />
    </PageGuidanceContext.Provider>
  )
}

