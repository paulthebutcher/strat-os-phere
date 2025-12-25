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

// Hero proof asset — single investment-ready recommendation only
const primaryOpportunity = {
  title: "Introduce a constrained free tier to unlock mid-market adoption",
  confidence: "investment_ready" as const,
  citationsCount: 8,
  bullets: [
    "4/5 competitors offer free tiers capped at usage",
    "Reviews cite 'trial friction' as a blocker to adoption"
  ]
}

const citations = [
  { domain: "competitor-a.com", type: "Pricing" },
  { domain: "competitor-b.com", type: "Docs" },
  { domain: "reviews-site.com", type: "Reviews" },
  { domain: "competitor-c.com", type: "Pricing" },
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
        "flex flex-col bg-white min-h-[450px] md:min-h-[520px] rounded-lg shadow-lg border border-border-subtle",
        "transition-opacity duration-500 ease-out",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Proof-first: Single investment-ready recommendation only */}
      {/* Main content: two-column layout */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left: Primary recommendation (single call) */}
        <div className="flex-1 p-6 md:p-8 space-y-4 overflow-y-auto">
          {/* Primary recommendation - prominent and clear */}
          <div className="p-5 md:p-6 rounded-lg border-2 border-accent-primary/50 bg-accent-primary/8 shadow-sm">
            {/* Title and confidence */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <h3 className="text-base md:text-lg font-semibold text-text-primary leading-snug flex-1">
                {primaryOpportunity.title}
              </h3>
              <ConfidencePill level={primaryOpportunity.confidence} className="text-xs shrink-0 self-start" />
            </div>

            {/* Evidence strength */}
            <div className="mb-4">
              <p className="text-sm font-medium text-text-primary">
                {primaryOpportunity.citationsCount} sources attached
              </p>
            </div>

            {/* Why this ranks bullets */}
            <div className="space-y-2">
              {primaryOpportunity.bullets.map((bullet, bulletIdx) => (
                <div key={bulletIdx} className="flex items-start gap-2.5">
                  <span className="text-accent-primary mt-0.5 shrink-0 font-semibold">•</span>
                  <p className="text-sm text-text-primary leading-relaxed">
                    {bullet}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Evidence snippet panel */}
        <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-border-subtle bg-surface-muted/30 p-5 md:p-6 flex flex-col">
          <div className="mb-4">
            <p className="text-sm font-semibold text-text-primary mb-3">
              Evidence attached
            </p>
          </div>

          {/* Citation list with improved spacing */}
          <div className="space-y-3">
            {citations.map((citation, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-text-primary truncate">
                  {citation.domain}
                </span>
                <Badge variant="secondary" className="text-xs px-2 py-1 shrink-0">
                  {citation.type}
                </Badge>
              </div>
            ))}
          </div>

          {/* What would change this call section */}
          <div className="mt-auto pt-4 border-t border-border-subtle">
            <p className="text-sm font-semibold text-text-primary mb-2">
              What would change this call?
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              This changes if two competitors launch comparable free tiers with similar limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

