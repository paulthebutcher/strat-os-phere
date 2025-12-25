/**
 * DecisionBriefPreview
 * 
 * Hero preview showing the Decision Brief (the output artifact).
 * Shows evidence attached, confidence boundaries, and "what would change this call".
 */
"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { ConfidencePill } from "@/components/marketing/ConfidencePill"

const opportunities = [
  {
    title: "Launch enterprise SSO to match competitor positioning",
    confidence: "investment_ready" as const,
    citationsCount: 8,
    bullets: [
      "3 competitors offer SSO in their enterprise tiers",
      "Customer reviews consistently mention SSO as requirement"
    ]
  },
  {
    title: "Improve API rate limits based on competitor signals",
    confidence: "directional" as const,
    citationsCount: 6,
    bullets: [
      "Market standard appears to be 10K requests/hour for free tier",
    ]
  },
]

const citations = [
  { domain: "competitor-a.com", type: "Pricing" },
  { domain: "competitor-b.com", type: "Docs" },
  { domain: "reviews-site.com", type: "Reviews" },
]

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function DecisionBriefPreview() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setIsVisible(true)
      return
    }
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div 
      className={cn(
        "flex flex-col bg-white min-h-[500px] md:min-h-[600px]",
        "transition-opacity duration-500 ease-out",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-border-subtle">
        <h2 className="text-sm md:text-base font-semibold text-text-primary">
          Decision Brief
        </h2>
      </div>

      {/* Main content: two-column layout */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left: Opportunities list */}
        <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
          {opportunities.map((opp, idx) => (
            <div
              key={idx}
              className={cn(
                "p-4 rounded-lg border transition-all",
                "border-border-subtle bg-white"
              )}
            >
              {/* Title and confidence */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-2">
                <h3 className="text-sm font-semibold text-text-primary leading-snug flex-1">
                  {opp.title}
                </h3>
                <ConfidencePill level={opp.confidence} className="text-xs shrink-0 self-start" />
              </div>

              {/* Evidence strength */}
              <div className="mb-3">
                <p className="text-xs text-text-muted">
                  {opp.citationsCount} citations
                </p>
              </div>

              {/* Why this ranks bullets */}
              <div className="space-y-1.5">
                {opp.bullets.map((bullet, bulletIdx) => (
                  <div key={bulletIdx} className="flex items-start gap-2">
                    <span className="text-accent-primary mt-0.5 shrink-0">•</span>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {bullet}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Evidence snippet panel */}
        <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-border-subtle bg-surface-muted/30 p-4 md:p-5 flex flex-col">
          <div className="mb-4">
            <p className="text-xs font-semibold text-text-primary mb-2">
              Evidence attached
            </p>
          </div>

          {/* Citation list */}
          <div className="space-y-3">
            {citations.map((citation, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-primary truncate">
                    {citation.domain}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 shrink-0 ml-2">
                    {citation.type}
                  </Badge>
                </div>
                <div className="h-px bg-border-subtle" />
              </div>
            ))}
          </div>

          {/* What would change this call section */}
          <div className="mt-auto pt-4 border-t border-border-subtle">
            <p className="text-xs font-semibold text-text-primary mb-2">
              What would change this call?
            </p>
            <p className="text-[11px] text-text-secondary">
              Competitor pricing shifts or new market data would update recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

