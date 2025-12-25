import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface SectionCardProps {
  children: ReactNode
  className?: string
  /**
   * If true, adds subtle shadow for depth
   */
  elevated?: boolean
}

/**
 * Presentational card component for content sections
 * Provides consistent styling, spacing, and visual hierarchy
 * Uses CardShell styling for premium opportunity cards
 */
export function SectionCard({
  children,
  className,
  elevated = false,
}: SectionCardProps) {
  return (
    <article
      className={cn(
        'rounded-lg border bg-card',
        'border-border-subtle',
        'shadow-sm',
        'p-6',
        'transition-all duration-[175ms] ease-out',
        elevated && 'shadow-md',
        className
      )}
    >
      {children}
    </article>
  )
}

