/**
 * WeighPreview
 * 
 * Preview showing confidence indicators and ranking drivers.
 * Contrasts directional vs investment-ready signals.
 */
"use client"

import { Badge } from "@/components/ui/badge"
import { ConfidencePill } from "@/components/marketing/ConfidencePill"
import { cn } from "@/lib/utils"

const opportunities = [
  {
    rank: 1,
    title: "Introduce a constrained free tier",
    confidence: "investment_ready" as const,
    citations: 8,
    drivers: ["Consistent pricing signals", "Strong market coverage"],
  },
  {
    rank: 2,
    title: "Improve API rate limits",
    confidence: "directional" as const,
    citations: 6,
    drivers: ["Limited coverage", "Mixed signals"],
  },
]

export function WeighPreview() {
  return (
    <div className="bg-white p-5 md:p-6 min-h-[400px] flex flex-col">
      <div className="space-y-4">
        {/* Investment-ready example */}
        <div
          className={cn(
            "p-4 rounded-lg border-2",
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
              <div className="flex items-center gap-3 mb-2">
                <ConfidencePill level={opportunities[0].confidence} className="text-xs" />
                <span className="text-xs font-medium text-text-secondary">
                  {opportunities[0].citations} sources
                </span>
              </div>
              <div className="space-y-1">
                {opportunities[0].drivers.map((driver, idx) => (
                  <div key={idx} className="text-xs text-text-secondary flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-accent-primary" />
                    {driver}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Directional example */}
        <div className="p-3 rounded-lg border border-border-subtle bg-white">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 bg-surface-muted text-text-secondary">
              {opportunities[1].rank}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-text-primary mb-1.5 leading-snug">
                {opportunities[1].title}
              </h4>
              <div className="flex items-center gap-2">
                <ConfidencePill level={opportunities[1].confidence} className="text-[10px]" />
                <span className="text-[10px] text-text-secondary">
                  {opportunities[1].citations} sources
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Caption */}
        <div className="pt-4 border-t border-border-subtle">
          <p className="text-xs text-text-muted italic">
            Confidence is explicit, uncertainty is surfaced
          </p>
        </div>
      </div>
    </div>
  )
}

