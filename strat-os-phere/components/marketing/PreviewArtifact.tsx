/**
 * PreviewArtifact
 * 
 * Wrapper component for marketing preview images/components.
 * Adds artifact headers and receipt callouts to transform UI screenshots into "decision receipts."
 */
"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ReceiptCallout {
  label: string
}

interface PreviewArtifactProps {
  /** The preview component/image to display */
  children: ReactNode
  /** Artifact title (e.g., "Decision Receipt", "Ranked Opportunities") */
  title: string
  /** Artifact subtitle (e.g., "One page. Defensible call. Sources included.") */
  subtitle: string
  /** Receipt callouts (max 3) - chips that highlight key proof points */
  callouts?: ReceiptCallout[]
  /** Optional className for the container */
  className?: string
  /** Lighter visual weight (reduced border contrast) */
  lighterWeight?: boolean
}

export function PreviewArtifact({
  children,
  title,
  subtitle,
  callouts = [],
  className,
  lighterWeight = false,
}: PreviewArtifactProps) {
  // Limit to 3 callouts max
  const displayCallouts = callouts.slice(0, 3)

  return (
    <div className={cn("space-y-3", className)}>
      {/* Artifact header with chips inline */}
      {title && (
        <div className="px-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h3 className="text-sm font-semibold text-text-primary">
              {title}
            </h3>
            {displayCallouts.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {displayCallouts.map((callout, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs px-2 py-0.5 bg-surface-muted/50 border-border-subtle"
                  >
                    {callout.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-text-muted mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Preview container with enhanced visual treatment */}
      <div className={cn(
        "relative rounded-xl border-2 overflow-hidden bg-white",
        lighterWeight 
          ? "border-border-subtle/60 shadow-lg" 
          : "border-border-subtle/80 shadow-2xl"
      )}>
        {/* Reduced background gradient/tint for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-muted/10 via-transparent to-transparent pointer-events-none" />
        
        {/* Preview content */}
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  )
}

