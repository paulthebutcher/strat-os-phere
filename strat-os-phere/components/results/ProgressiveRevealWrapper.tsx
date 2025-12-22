'use client'

import { cn } from '@/lib/utils'
import { useProgressiveReveal, type RevealSection } from '@/lib/ui/useProgressiveReveal'

interface ProgressiveRevealWrapperProps {
  section: RevealSection
  className?: string
  children: React.ReactNode
  enabled?: boolean
  delayMs?: number
  storageKey?: string
}

/**
 * Client component wrapper for progressive reveal
 * Wraps content with fade/slide animation based on section
 */
export function ProgressiveRevealWrapper({
  section,
  className,
  children,
  enabled = true,
  delayMs = 200,
  storageKey = 'results-progressive-reveal',
}: ProgressiveRevealWrapperProps) {
  const { visibleSections } = useProgressiveReveal({
    enabled,
    delayMs,
    storageKey,
  })

  const isVisible = visibleSections[section]

  return (
    <div
      className={cn(
        'transition-all duration-200 ease-out',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none',
        className
      )}
    >
      {children}
    </div>
  )
}

