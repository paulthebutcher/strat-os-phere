/**
 * HeroArtifactBand
 * 
 * Compact artifact preview showing executive readout format.
 * Full-width band, ~200-240px height, scannable in one glance.
 * No paragraphs, bullets, scrollbars, or fake charts.
 */
"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Opportunity {
  title: string
  confidence: "directional" | "investment_ready"
  citationsCount: number
  evidenceTypes: number
}

const opportunities: Opportunity[] = [
  {
    title: "Launch enterprise SSO to match competitor positioning",
    confidence: "investment_ready",
    citationsCount: 5,
    evidenceTypes: 2,
  },
  {
    title: "Improve API rate limits based on competitor signals",
    confidence: "directional",
    citationsCount: 5,
    evidenceTypes: 2,
  },
  {
    title: "Add granular permission model for team collaboration",
    confidence: "directional",
    citationsCount: 5,
    evidenceTypes: 2,
  },
]

const citations = [
  { domain: "competitor-a.com" },
  { domain: "competitor-b.com" },
  { domain: "competitor-c.com" },
]

const confidenceColors = {
  directional: "bg-blue-50 text-blue-700 border-blue-200",
  investment_ready: "bg-green-50 text-green-700 border-green-200",
}

const confidenceLabels = {
  directional: "Directional",
  investment_ready: "Investment-ready",
}

export function HeroArtifactBand() {
  return (
    <div className={cn(
      "w-full bg-white rounded-lg border border-border-subtle",
      "overflow-hidden"
    )}>
      {/* Header */}
      <div className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 border-b border-border-subtle">
        <h3 className="text-xs sm:text-sm font-semibold text-text-primary">
          Top opportunities (example)
        </h3>
      </div>

      {/* Content: Opportunities + Citations */}
      <div className="flex flex-col md:flex-row">
        {/* Left: Opportunities list */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3">
          {opportunities.map((opp, idx) => (
            <div
              key={idx}
              className={cn(
                "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2",
                "py-2 border-b border-border-subtle last:border-0"
              )}
            >
              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-text-primary">
                  {opp.title}
                </p>
              </div>

              {/* Confidence + Evidence summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 shrink-0">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border",
                    confidenceColors[opp.confidence]
                  )}
                >
                  {confidenceLabels[opp.confidence]}
                </span>
                <span className="text-[10px] sm:text-xs text-text-muted">
                  {opp.citationsCount} citations · {opp.evidenceTypes} types
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Citations column */}
        <div className="w-full md:w-48 border-t md:border-t-0 md:border-l border-border-subtle bg-surface-muted/30 p-3 sm:p-4 md:p-5">
          <div className="space-y-1.5 sm:space-y-2">
            {citations.map((citation, idx) => (
              <div key={idx} className="flex items-center">
                <span className="text-[10px] sm:text-xs font-medium text-text-primary truncate">
                  {citation.domain}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

