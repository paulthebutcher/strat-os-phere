import * as React from "react"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/**
 * EmptyState - Consistent empty state pattern
 * 
 * Provides standardized empty state UI:
 * - Title (required)
 * - Description (optional, muted)
 * - Action (optional, CTA button)
 * 
 * Use for "no data" states, empty lists, etc.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-20 text-center animate-fade-in",
      className
    )}>
      <h2 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-base text-muted-foreground mb-8 max-w-md leading-normal">
          {description}
        </p>
      )}
      {action && (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {action}
        </div>
      )}
    </div>
  )
}

