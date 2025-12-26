import * as React from "react"
import { cn } from "@/lib/utils"
import { DotGrid } from "@/components/graphics/SignalMotifs"

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
 * - Subtle signal motif background
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
      "relative flex flex-col items-center justify-center py-20 text-center animate-fade-in",
      className
    )}>
      {/* Subtle background motif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <DotGrid className="w-full h-full text-foreground" opacity={0.04} />
      </div>
      <div className="relative z-10">
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
    </div>
  )
}

