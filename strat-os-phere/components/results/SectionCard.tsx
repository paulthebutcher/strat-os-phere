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
        'rounded-[var(--plinth-radius-md)] border bg-white',
        'border-[color:rgba(var(--plinth-border))]',
        'shadow-[var(--plinth-shadow-1)]',
        'p-6',
        elevated && 'shadow-[var(--plinth-shadow-2)]',
        className
      )}
    >
      {children}
    </article>
  )
}

