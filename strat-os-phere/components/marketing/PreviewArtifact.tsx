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
}

export function PreviewArtifact({
  children,
  title,
  subtitle,
  callouts = [],
  className,
}: PreviewArtifactProps) {
  // Limit to 3 callouts max
  const displayCallouts = callouts.slice(0, 3)

  return (
    <div className={cn("space-y-3", className)}>
      {/* Artifact header */}
      <div className="px-1">
        <h3 className="text-sm font-semibold text-text-primary mb-0.5">
          {title}
        </h3>
        <p className="text-xs text-text-muted">
          {subtitle}
        </p>
      </div>

      {/* Preview container with enhanced visual treatment */}
      <div className="relative rounded-xl border-2 border-border-subtle shadow-xl overflow-hidden bg-white">
        {/* Subtle background gradient/tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-muted/20 via-transparent to-transparent pointer-events-none" />
        
        {/* Preview content */}
        <div className="relative">
          {children}
        </div>
      </div>

      {/* Receipt callouts - chips outside the preview */}
      {displayCallouts.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {displayCallouts.map((callout, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-xs px-2.5 py-1 bg-surface-muted/50 border-border-subtle"
            >
              {callout.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

