import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  divider?: boolean
  className?: string
}

/**
 * Section - Consistent section wrapper
 * 
 * Provides:
 * - Optional title + description
 * - Consistent spacing above/below (24px gap)
 * - Optional divider (border-top)
 * 
 * Use for grouping related content with consistent rhythm.
 */
export function Section({
  title,
  description,
  children,
  divider = false,
  className,
}: SectionProps) {
  return (
    <section className={cn(
      "space-y-4",
      divider && "border-t border-border pt-6",
      className
    )}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground leading-normal">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

