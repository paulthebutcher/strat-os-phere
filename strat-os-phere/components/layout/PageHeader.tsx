import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  primaryAction?: React.ReactNode
  secondaryActions?: React.ReactNode
  className?: string
}

/**
 * PageHeader - Standard page header pattern
 * 
 * Provides consistent header structure:
 * - Eyebrow (optional, small muted text above title)
 * - Title (required, main heading)
 * - Subtitle (optional, 1-2 lines, muted)
 * - Primary action (optional, right-aligned on desktop)
 * - Secondary actions (optional, right-aligned on desktop)
 * 
 * Rules:
 * - One primary action max
 * - Subtitle is muted and concise
 * - No decorative icons by default
 * - Actions stack under title on mobile
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  primaryAction,
  secondaryActions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-2", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1 flex-1">
          {eyebrow && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {eyebrow}
            </p>
          )}
          <h1 className="text-heading-l font-semibold text-foreground tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground max-w-2xl leading-normal">
              {subtitle}
            </p>
          )}
        </div>
        {(primaryAction || secondaryActions) && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {secondaryActions}
            {primaryAction}
          </div>
        )}
      </div>
    </header>
  )
}

