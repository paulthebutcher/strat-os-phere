/**
 * Proof Without Hype Section
 * 
 * Compact visual strip showing citation drawer, ranking breakdown, and confidence boundaries.
 * Visual-first proof, not promises. Enhanced with better visual hierarchy and trust elements.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Badge } from "@/components/ui/badge"
import { Reveal } from "./motion"
import { cn } from "@/lib/utils"
import { FileText, TrendingUp, AlertCircle } from "lucide-react"
import { sampleAnalysis } from "./sampleReadoutData"

// Citation drawer preview
function CitationDrawerPreview() {
  const citations = sampleAnalysis.evidence.sources.slice(0, 2).map(source => ({
    domain: source.domain,
    quote: source.title
  }))

  return (
    <div className="bg-white rounded-lg border border-border-subtle p-4 sm:p-5 space-y-3 min-h-[140px] flex flex-col">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-accent-primary" />
        <p className="text-xs font-semibold text-text-primary">Citations</p>
      </div>
      <div className="space-y-2 flex-1">
        {citations.map((citation, idx) => (
          <div key={idx} className="space-y-0.5 p-2 rounded border border-border-subtle bg-surface-muted/30">
            <p className="text-xs font-medium text-text-primary">
              {citation.domain}
            </p>
            <p className="text-[10px] text-text-secondary line-clamp-1">
              {citation.quote}
            </p>
          </div>
        ))}
      </div>
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
    <div className="bg-white rounded-lg border border-border-subtle p-4 sm:p-5 space-y-3 min-h-[140px] flex flex-col">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-accent-primary" />
        <p className="text-xs font-semibold text-text-primary">Ranking drivers</p>
      </div>
      <div className="space-y-2.5 flex-1">
        {drivers.map((driver, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded border border-border-subtle bg-surface-muted/30">
            <span className="text-xs text-text-secondary">{driver.label}</span>
            <span className="text-xs font-semibold text-accent-primary">
              {driver.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Confidence boundary callout
function ConfidenceBoundaryPreview() {
  return (
    <div className="bg-white rounded-lg border border-border-subtle p-4 sm:p-5 space-y-3 min-h-[140px] flex flex-col">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-accent-primary" />
        <p className="text-xs font-semibold text-text-primary">Would change if</p>
      </div>
      <div className="flex-1 flex items-center">
        <p className="text-xs text-text-secondary leading-relaxed">
          Competitor pricing shifts or new market data emerges
        </p>
      </div>
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

