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
    <div className="bg-white p-6 md:p-8 min-h-[350px] flex flex-col">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-2">
            Opportunities, ranked
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            Not a list of ideas — a prioritized shortlist based on signal strength
          </p>
        </div>

        {/* Ranking drivers legend */}
        <div className="flex flex-wrap gap-3 text-xs text-text-secondary mb-4 pb-3 border-b border-border-subtle">
          <span className="font-medium">Ranking drivers:</span>
          <span>Evidence strength</span>
          <span>•</span>
          <span>Competitive gap</span>
          <span>•</span>
          <span>Market signals</span>
        </div>

        {/* Opportunities list */}
        <div className="space-y-3">
          {opportunities.map((opp, idx) => (
            <div
              key={idx}
              className={cn(
                "p-4 rounded-lg border transition-all",
                idx === 0
                  ? "border-accent-primary/40 bg-accent-primary/5"
                  : "border-border-subtle bg-white"
              )}
            >
              <div className="flex items-start gap-3 mb-2">
                <div
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0",
                    idx === 0
                      ? "bg-accent-primary text-white"
                      : "bg-surface-muted text-text-secondary"
                  )}
                >
                  {opp.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-text-primary mb-2">
                    {opp.title}
                  </h4>
                  <div className="flex items-center gap-3">
                    <ConfidencePill level={opp.confidence} className="text-xs" />
                    <span className="text-xs text-text-secondary">
                      {opp.citations} citations
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

