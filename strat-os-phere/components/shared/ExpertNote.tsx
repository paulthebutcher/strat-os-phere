'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExpertNoteProps {
  /**
   * The expert guidance text to display when expanded
   */
  children: React.ReactNode
  /**
   * Optional custom className
   */
  className?: string
  /**
   * Whether to show the note inline or as a separate block
   * @default 'inline'
   */
  variant?: 'inline' | 'block'
}

/**
 * ExpertNote: Collapsible inline guidance for advanced concepts
 * 
 * Provides subtle, strategic language that helps senior users understand
 * why a field or concept matters without being instructional.
 * 
 * Defaults to collapsed to keep the interface uncluttered.
 */
export function ExpertNote({
  children,
  className,
  variant = 'inline',
}: ExpertNoteProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (variant === 'block') {
    return (
      <div className={cn('space-y-2', className)}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-start gap-2 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          aria-expanded={isOpen}
          aria-label="Show expert guidance"
        >
          <Info className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            Why this matters
          </span>
        </button>
        {isOpen && (
          <div className="ml-6 text-xs text-muted-foreground leading-relaxed">
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        aria-expanded={isOpen}
        aria-label="Show expert guidance"
      >
        <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors" />
      </button>
      {isOpen && (
        <span className="ml-1 text-xs text-muted-foreground italic max-w-xs">
          {children}
        </span>
      )}
    </span>
  )
}

