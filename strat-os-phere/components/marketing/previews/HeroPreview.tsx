/**
 * HeroPreview
 * 
 * Clean artifact-style preview showing executive readout format.
 * Resembles real output with opportunities, confidence pills, and evidence snippets.
 * Subtle motion with reduced-motion support.
 */
"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface Opportunity {
  title: string
  confidence: "directional" | "investment_ready"
  citationsCount: number
  evidenceTypes: number
  bullets: string[]
}

const opportunities: Opportunity[] = [
  {
    title: "Introduce a constrained free tier to unlock mid-market adoption",
    confidence: "investment_ready",
    citationsCount: 8,
    evidenceTypes: 3,
    bullets: [
      "4/5 competitors offer free tiers capped at usage",
      "Reviews cite 'trial friction' as a blocker to adoption"
    ]
  },
  {
    title: "Improve API rate limits based on competitor signals",
    confidence: "directional",
    citationsCount: 6,
    evidenceTypes: 2,
    bullets: [
      "Market standard appears to be 10K requests/hour for free tier",
      "Documentation patterns suggest rate limits are differentiators"
    ]
  },
  {
    title: "Add granular permission model for team collaboration",
    confidence: "directional",
    citationsCount: 5,
    evidenceTypes: 2,
    bullets: [
      "Competitors highlight role-based access in marketing",
      "Feature gaps mentioned in comparison reviews"
    ]
  }
]

const citations = [
  { domain: "competitor-a.com", type: "Pricing" },
  { domain: "competitor-b.com", type: "Docs" },
  { domain: "competitor-c.com", type: "Pricing" },
  { domain: "reviews-site.com", type: "Reviews" },
]

const confidenceColors = {
  directional: "bg-blue-50 text-blue-700 border-blue-200",
  investment_ready: "bg-green-50 text-green-700 border-green-200",
}

const confidenceLabels = {
  directional: "Directional",
  investment_ready: "Investment-ready",
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function HeroPreview() {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setIsVisible(true)
      return
    }
    // Fade in on mount
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
          Top Opportunities (Example)
        </h2>
      </div>

      {/* Main content: two-column layout */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left: Opportunities list */}
        <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
          {opportunities.map((opp, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200",
                hoveredIndex === idx
                  ? "border-accent-primary/40 bg-surface-muted/50 shadow-sm"
                  : "border-border-subtle bg-white"
              )}
            >
              {/* Title and confidence */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-2">
                <h3 className="text-sm font-semibold text-text-primary leading-snug flex-1">
                  {opp.title}
                </h3>
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 self-start",
                    confidenceColors[opp.confidence]
                  )}
                >
                  {confidenceLabels[opp.confidence]}
                </span>
              </div>

              {/* Evidence strength */}
              <div className="mb-3">
                <p className="text-xs text-text-muted">
                  {opp.citationsCount} citations across {opp.evidenceTypes} types
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
            <button
              className={cn(
                "text-sm font-medium text-accent-primary hover:text-accent-primary-hover transition-colors",
                "hover:underline underline-offset-2"
              )}
            >
              View evidence
            </button>
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

          {/* Citations tag */}
          <div className="mt-auto pt-4">
            <span className="text-[10px] text-text-muted uppercase tracking-wider">
              Citations
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
