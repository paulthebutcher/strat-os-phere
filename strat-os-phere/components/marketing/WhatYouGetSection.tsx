/**
 * What You Get Section
 * 
 * Notion-style uniform grid with consistent card structure.
 * Desktop: 3 columns
 * Tablet: 2 columns
 * Mobile: 1 column
 */
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { WhatYouGetCard } from "./WhatYouGetCard"
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
  Visual: React.ComponentType
}

const features: FeatureCard[] = [
  {
    id: "evidence-ledger",
    title: "Evidence ledger",
    description: "All sources organized by type—pricing, docs, reviews, changelogs—with recency indicators.",
    Visual: EvidenceLedgerVisual,
  },
  {
    id: "opportunity-ranking",
    title: "Opportunity ranking",
    description: "Strategic bets scored by evidence strength, defensibility, and market signals.",
    Visual: OpportunityRankingVisual,
  },
  {
    id: "assumptions-confidence",
    title: "Assumptions & confidence",
    description: "Clear confidence levels and coverage metrics so you know what's certain vs. inferred.",
    Visual: AssumptionsConfidenceVisual,
  },
  {
    id: "competitive-snapshots",
    title: "Competitive snapshots",
    description: "Structured view of how competitors position, price, and differentiate.",
    Visual: CompetitiveSnapshotsVisual,
  },
  {
    id: "shareable-readout",
    title: "Shareable readout",
    description: "Exec-ready output formatted for internal sharing with citations intact.",
    Visual: ShareableReadoutVisual,
  },
  {
    id: "repeatable-method",
    title: "Repeatable method",
    description: "Same process, same structure—run it again when the market shifts.",
    Visual: RepeatableMethodVisual,
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
        
        {/* Uniform grid: 3-col desktop, 2-col tablet, 1-col mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <WhatYouGetCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              Preview={feature.Visual}
            />
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

