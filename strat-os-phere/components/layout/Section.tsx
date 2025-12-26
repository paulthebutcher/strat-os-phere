import * as React from "react"
import { cn } from "@/lib/utils"
import { ReceiptPerforation } from "@/components/graphics/SignalMotifs"

export interface SectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  divider?: boolean
  className?: string
  id?: string
}

/**
 * PageSection - Consistent section wrapper
 * 
 * Provides:
 * - Optional title + description
 * - Consistent spacing above/below (24px gap)
 * - Optional divider (border-top with signal motif)
 * 
 * Use for grouping related content with consistent rhythm.
 */
export function PageSection({
  title,
  description,
  children,
  divider = false,
  className,
  id,
}: SectionProps) {
  return (
    <section 
      id={id}
      className={cn(
        "space-y-4",
        divider && "pt-6",
        className
      )}
    >
      {divider && (
        <div className="mb-4 -mt-2">
          <ReceiptPerforation className="text-foreground" opacity={0.06} />
        </div>
      )}
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

/** @deprecated Use PageSection instead. Kept for backwards compatibility. */
export const Section = PageSection;

