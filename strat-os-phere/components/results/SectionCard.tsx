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
 */
export function SectionCard({
  children,
  className,
  elevated = false,
}: SectionCardProps) {
  return (
    <article
      className={cn(
        'rounded-lg border border-border bg-card p-6',
        elevated && 'shadow-sm',
        className
      )}
    >
      {children}
    </article>
  )
}

