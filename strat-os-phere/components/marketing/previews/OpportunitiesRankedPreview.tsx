/**
 * OpportunitiesRankedPreview
 * 
 * Preview showing opportunities list with ranking visible.
 * Shows it's not a list of ideas but a prioritized shortlist based on signal strength.
 */
"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ConfidencePill } from "@/components/marketing/ConfidencePill"

const opportunities = [
  {
    rank: 1,
    title: "Launch enterprise SSO to match competitor positioning",
    confidence: "investment_ready" as const,
    citations: 8,
  },
  {
    rank: 2,
    title: "Improve API rate limits based on competitor signals",
    confidence: "directional" as const,
    citations: 6,
  },
  {
    rank: 3,
    title: "Add granular permission model for team collaboration",
    confidence: "directional" as const,
    citations: 5,
  },
]

export function OpportunitiesRankedPreview() {
  return (
    <div className="bg-white p-5 md:p-6 min-h-[320px] flex flex-col">
      {/* Proof-first: Focus on ranking and why */}
      <div className="space-y-3">
        {/* Top opportunity - most prominent */}
        <div
          className={cn(
            "p-4 rounded-lg border-2 transition-all",
            "border-accent-primary/50 bg-accent-primary/8"
          )}
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 bg-accent-primary text-white">
              {opportunities[0].rank}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-text-primary mb-2 leading-snug">
                {opportunities[0].title}
              </h4>
              <div className="flex items-center gap-3 flex-wrap">
                <ConfidencePill level={opportunities[0].confidence} className="text-xs" />
                <span className="text-xs font-medium text-text-secondary">
                  {opportunities[0].citations} sources
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Other opportunities - compact */}
        <div className="space-y-2">
          {opportunities.slice(1).map((opp, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-border-subtle bg-white"
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 bg-surface-muted text-text-secondary">
                  {opp.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-text-primary mb-1.5 leading-snug">
                    {opp.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <ConfidencePill level={opp.confidence} className="text-[10px]" />
                    <span className="text-[10px] text-text-secondary">
                      {opp.citations} sources
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

