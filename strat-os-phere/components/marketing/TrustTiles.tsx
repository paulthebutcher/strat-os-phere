import { Shield, FileText, Clock, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

const trustTiles = [
  {
    icon: Shield,
    title: "Public sources only",
    description: "We only use publicly available information—pricing pages, reviews, job postings, changelogs, and documentation. No private data or scraping.",
  },
  {
    icon: FileText,
    title: "Evidence types",
    description: "Multiple evidence types per opportunity: pricing signals, review sentiment, hiring patterns, product updates, and documentation changes.",
  },
  {
    icon: Clock,
    title: "Recency aware",
    description: "Evidence window focuses on the last 90 days by default (configurable). Confidence increases with coverage and freshness of signals.",
  },
  {
    icon: Share2,
    title: "Shareable exec readout",
    description: "Export a VP-ready narrative with full citations. Every insight is defensible and traceable to its source.",
  },
]

export function TrustTiles() {
  return (
    <MarketingSection id="trust" variant="tinted" className="relative">
      <MarketingContainer maxWidth="6xl">
        <div className="mx-auto max-w-3xl text-center space-y-4 mb-12">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-text-primary">
            Trust & rigor
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-text-secondary">
            Every opportunity is grounded in public evidence with full citations you can validate.
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustTiles.map((tile, index) => {
            const Icon = tile.icon
            return (
              <div
                key={index}
                className={cn(
                  "panel p-6 rounded-2xl border border-border-subtle",
                  "bg-surface shadow-sm hover:shadow-md transition-all",
                  "hover:border-accent-primary/30"
                )}
              >
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-primary/10">
                    <Icon className="h-6 w-6 text-accent-primary" />
                  </div>
                </div>
                <h3 className="mb-2 text-base font-semibold text-text-primary text-center">
                  {tile.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary text-center">
                  {tile.description}
                </p>
              </div>
            )
          })}
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

