/**
 * Ranked Opportunities Preview Section
 * 
 * Visual comparison showing opportunities list with ranking and scores highlighted.
 * Shows that it's not a list of ideas, but a prioritized shortlist you can act on.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ConfidencePill } from "./ConfidencePill"
import { TrendingUp } from "lucide-react"

const opportunities = [
  {
    rank: 1,
    title: "Free tier expansion opportunity",
    description: "4 of 5 competitors offer free tiers with usage-based limits. StatusFlow and PagerGrid expanded theirs in the past 6 months, with user growth tracking in their changelogs.",
    confidence: "investment_ready" as const,
    score: 81.4,
    citations: 11,
  },
  {
    rank: 2,
    title: "API-first positioning gap",
    description: "PagerGrid and UptimeKit emphasize API access in their positioning. AlertHub and OnCallPro have limited API marketing, creating a positioning opportunity.",
    confidence: "directional" as const,
    score: 84.2,
    citations: 7,
  },
  {
    rank: 3,
    title: "Team collaboration features",
    description: "All competitors have strong team features, but enterprise reviews indicate gaps in real-time collaboration UX and security review workflows.",
    confidence: "directional" as const,
    score: 76.8,
    citations: 11,
  },
]

export function RankedOpportunitiesPreview() {
  return (
    <MarketingSection variant="default" id="opportunities">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-3">
              Ranked opportunities
            </h2>
            <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto">
              Not a list of ideas. A prioritized shortlist you can act on.
            </p>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="bg-white rounded-xl border-2 border-border-subtle shadow-lg overflow-hidden max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-surface-muted/50 border-b border-border-subtle p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-primary" />
                <h3 className="text-lg sm:text-xl font-semibold text-text-primary">
                  Top Opportunities
                </h3>
              </div>
            </div>

            {/* Opportunities list */}
            <div className="p-4 sm:p-6 space-y-4">
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
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0",
                        idx === 0
                          ? "bg-accent-primary text-white"
                          : "bg-surface-muted text-text-secondary"
                      )}>
                        {opp.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-semibold text-text-primary mb-1">
                          {opp.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                          {opp.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 sm:ml-4">
                      <div className="flex items-center gap-2 bg-accent-primary/10 rounded-lg px-3 py-1.5 border border-accent-primary/20">
                        <span className="text-sm font-bold text-accent-primary">
                          {opp.score}%
                        </span>
                      </div>
                      <ConfidencePill level={opp.confidence} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {opp.citations} citations
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

