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
        "flex flex-col bg-white min-h-[450px] md:min-h-[520px]",
        "transition-opacity duration-500 ease-out",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Proof-first: Remove header chrome, focus on content */}
      {/* Main content: two-column layout */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left: Top opportunity (most prominent) */}
        <div className="flex-1 p-5 md:p-6 space-y-3 overflow-y-auto">
          {/* Top recommendation - highlighted */}
          <div className="p-4 rounded-lg border-2 border-accent-primary/50 bg-accent-primary/8">
            {/* Title and confidence */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-text-primary leading-snug flex-1">
                {opportunities[0].title}
              </h3>
              <ConfidencePill level={opportunities[0].confidence} className="text-xs shrink-0 self-start" />
            </div>

            {/* Evidence strength */}
            <div className="mb-3">
              <p className="text-xs font-medium text-text-muted">
                {opportunities[0].citationsCount} sources attached
              </p>
            </div>

            {/* Why this ranks bullets */}
            <div className="space-y-1.5">
              {opportunities[0].bullets.map((bullet, bulletIdx) => (
                <div key={bulletIdx} className="flex items-start gap-2">
                  <span className="text-accent-primary mt-0.5 shrink-0">•</span>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {bullet}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Other opportunities - compact */}
          {opportunities.slice(1).map((opp, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-border-subtle bg-white"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <h3 className="text-xs font-semibold text-text-primary leading-snug flex-1">
                  {opp.title}
                </h3>
                <ConfidencePill level={opp.confidence} className="text-[10px] shrink-0 self-start" />
              </div>
              <p className="text-[10px] text-text-muted">
                {opp.citationsCount} sources
              </p>
            </div>
          ))}
        </div>

        {/* Right: Evidence snippet panel */}
        <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-border-subtle bg-surface-muted/30 p-4 md:p-5 flex flex-col">
          <div className="mb-3">
            <p className="text-xs font-semibold text-text-primary mb-2">
              Evidence attached
            </p>
          </div>

          {/* Citation list */}
          <div className="space-y-2.5">
            {citations.map((citation, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-text-primary truncate">
                  {citation.domain}
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 shrink-0">
                  {citation.type}
                </Badge>
              </div>
            ))}
          </div>

          {/* What would change this call section */}
          <div className="mt-auto pt-3 border-t border-border-subtle">
            <p className="text-xs font-semibold text-text-primary mb-1.5">
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

