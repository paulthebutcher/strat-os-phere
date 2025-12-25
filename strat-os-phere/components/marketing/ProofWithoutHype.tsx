/**
 * Proof Without Hype Section
 * 
 * Compact visual strip showing citation drawer, ranking breakdown, and confidence boundaries.
 * Visual-first proof, not promises.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Badge } from "@/components/ui/badge"
import { Reveal } from "./motion"
import { cn } from "@/lib/utils"

// Citation drawer preview
function CitationDrawerPreview() {
  const citations = [
    { domain: "competitor-a.com", quote: "SSO included in Enterprise plan" },
    { domain: "competitor-b.com", quote: "Published 2 months ago" },
  ]

  return (
    <div className="bg-white rounded-lg border border-border-subtle p-3 sm:p-4 space-y-2 min-h-[100px]">
      <p className="text-[10px] font-medium text-muted-foreground mb-2">Citations</p>
      {citations.map((citation, idx) => (
        <div key={idx} className="space-y-0.5">
          <p className="text-[10px] sm:text-xs font-medium text-text-primary">
            {citation.domain}
          </p>
          <p className="text-[10px] text-text-secondary line-clamp-1">
            {citation.quote}
          </p>
        </div>
      ))}
    </div>
  )
}

// Ranking breakdown preview
function RankingBreakdownPreview() {
  const drivers = [
    { label: "Evidence strength", value: "8.9" },
    { label: "Market signals", value: "8.5" },
    { label: "Competitive gap", value: "7.8" },
  ]

  return (
    <div className="bg-white rounded-lg border border-border-subtle p-3 sm:p-4 space-y-2 min-h-[100px]">
      <p className="text-[10px] font-medium text-muted-foreground mb-2">Ranking drivers</p>
      {drivers.map((driver, idx) => (
        <div key={idx} className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-text-secondary">{driver.label}</span>
          <span className="text-[10px] sm:text-xs font-semibold text-text-primary">
            {driver.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// Confidence boundary callout
function ConfidenceBoundaryPreview() {
  return (
    <div className="bg-white rounded-lg border border-border-subtle p-3 sm:p-4 space-y-2 min-h-[100px]">
      <p className="text-[10px] font-medium text-muted-foreground mb-2">Would change if</p>
      <p className="text-[10px] sm:text-xs text-text-secondary leading-relaxed">
        Competitor pricing shifts or new market data emerges
      </p>
    </div>
  )
}

export function ProofWithoutHype() {
  return (
    <MarketingSection variant="default" id="proof">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-3">
              Proof, not promises
            </h2>
          </div>
        </Reveal>

        {/* Visual strip */}
        <Reveal delay={60}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <CitationDrawerPreview />
            <RankingBreakdownPreview />
            <ConfidenceBoundaryPreview />
          </div>
        </Reveal>

        {/* Closer line */}
        <Reveal delay={120}>
          <p className="text-sm sm:text-base text-text-secondary text-center">
            Most tools generate ideas.{" "}
            <span className="font-semibold text-text-primary">
              Plinth shows you what's safe to act on.
            </span>
          </p>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

