/**
 * What You Get Section
 * 
 * Responsive mosaic grid showcasing key deliverables.
 * Desktop: 12-column mosaic with varied spans
 * Tablet: 2-column
 * Mobile: 1-column stacked
 */
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { EvidenceLedgerVisual } from "./visuals/EvidenceLedgerVisual"
import { OpportunityRankingVisual } from "./visuals/OpportunityRankingVisual"
import { AssumptionsConfidenceVisual } from "./visuals/AssumptionsConfidenceVisual"
import { CompetitiveSnapshotsVisual } from "./visuals/CompetitiveSnapshotsVisual"
import { ShareableReadoutVisual } from "./visuals/ShareableReadoutVisual"
import { RepeatableMethodVisual } from "./visuals/RepeatableMethodVisual"

interface FeatureCard {
  id: string
  title: string
  description: string
  meta?: string
  Visual: React.ComponentType
  // Desktop spans (12-col grid)
  colSpan: number
  rowSpan: number
}

const features: FeatureCard[] = [
  {
    id: "evidence-ledger",
    title: "Evidence ledger",
    description: "All sources organized by type—pricing, docs, reviews, changelogs—with recency indicators.",
    meta: "Citations preserved",
    Visual: EvidenceLedgerVisual,
    colSpan: 5,
    rowSpan: 2,
  },
  {
    id: "opportunity-ranking",
    title: "Opportunity ranking",
    description: "Strategic bets scored by evidence strength, defensibility, and market signals.",
    meta: "Deterministic scoring",
    Visual: OpportunityRankingVisual,
    colSpan: 7,
    rowSpan: 2,
  },
  {
    id: "assumptions-confidence",
    title: "Assumptions & confidence",
    description: "Clear confidence levels and coverage metrics so you know what's certain vs. inferred.",
    meta: "Coverage visible",
    Visual: AssumptionsConfidenceVisual,
    colSpan: 7,
    rowSpan: 1,
  },
  {
    id: "competitive-snapshots",
    title: "Competitive snapshots",
    description: "Structured view of how competitors position, price, and differentiate.",
    Visual: CompetitiveSnapshotsVisual,
    colSpan: 5,
    rowSpan: 1,
  },
  {
    id: "shareable-readout",
    title: "Shareable readout",
    description: "Exec-ready output formatted for internal sharing with citations intact.",
    Visual: ShareableReadoutVisual,
    colSpan: 6,
    rowSpan: 1,
  },
  {
    id: "repeatable-method",
    title: "Repeatable method",
    description: "Same process, same structure—run it again when the market shifts.",
    Visual: RepeatableMethodVisual,
    colSpan: 6,
    rowSpan: 1,
  },
]

export function WhatYouGetSection() {
  return (
    <MarketingSection variant="default" id="product">
      <MarketingContainer maxWidth="7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
            What you get
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Structured outputs designed for decision-making, not just information gathering.
          </p>
        </div>
        
        {/* Responsive mosaic grid */}
        <div className={cn(
          "grid gap-4 md:gap-6",
          // Mobile: 1 column
          "grid-cols-1",
          // Tablet: 2 columns
          "md:grid-cols-2",
          // Desktop: 12 columns with auto rows
          "lg:grid-cols-12 lg:auto-rows-[minmax(160px,auto)]"
        )}>
          {features.map((feature) => {
            const Visual = feature.Visual
            
            return (
              <div
                key={feature.id}
                className={cn(
                  "group relative rounded-2xl border border-border-subtle bg-surface",
                  "shadow-sm hover:shadow-md hover:border-accent-primary/30",
                  "transition-all duration-200 hover:-translate-y-0.5",
                  "p-6 flex flex-col",
                  "h-full",
                  // Mobile: full width
                  "col-span-1",
                  // Tablet: full width (2-col grid)
                  "md:col-span-2",
                  // Desktop: use specified spans (map to Tailwind classes)
                  feature.colSpan === 5 && "lg:col-span-5",
                  feature.colSpan === 6 && "lg:col-span-6",
                  feature.colSpan === 7 && "lg:col-span-7",
                  feature.rowSpan === 1 && "lg:row-span-1",
                  feature.rowSpan === 2 && "lg:row-span-2"
                )}
              >
                {/* Visual - positioned based on card size */}
                <div className={cn(
                  "mb-4 flex-shrink-0",
                  // For larger cards (row-span-2), position visual top-right
                  feature.rowSpan === 2 && "lg:absolute lg:top-6 lg:right-6 lg:mb-0",
                  // For smaller cards, keep it inline at top
                  feature.rowSpan === 1 && "lg:mb-4",
                  "w-32 h-24 lg:w-40 lg:h-28"
                )} aria-hidden="true">
                  <Visual />
                </div>
                
                {/* Content */}
                <div className={cn(
                  "flex-1 flex flex-col min-w-0",
                  // Add padding-right for larger cards with absolute positioned visual
                  feature.rowSpan === 2 && "lg:pr-44"
                )}>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary mb-3 flex-1">
                    {feature.description}
                  </p>
                  
                  {/* Meta line */}
                  {feature.meta && (
                    <div className="pt-3 border-t border-border-subtle">
                      <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                        {feature.meta}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

