/**
 * Bento Feature Grid
 * 
 * Notion-style bento grid with varying card sizes.
 * Shows key deliverables in a visually interesting layout.
 */
import { FileText, TrendingUp, BarChart3, Users, Share2, Repeat } from "lucide-react"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

interface BentoCard {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  span?: "col-span-1" | "col-span-2" | "row-span-1" | "row-span-2"
}

const features: BentoCard[] = [
  {
    title: "Evidence ledger",
    description: "All sources organized by type—pricing, docs, reviews, changelogs—with recency indicators.",
    icon: FileText,
    span: "col-span-1",
  },
  {
    title: "Opportunity ranking",
    description: "Strategic bets scored by evidence strength, defensibility, and market signals.",
    icon: TrendingUp,
    span: "col-span-1",
  },
  {
    title: "Assumptions & confidence",
    description: "Clear confidence levels and coverage metrics so you know what's certain vs. inferred.",
    icon: BarChart3,
    span: "col-span-2",
  },
  {
    title: "Competitive snapshots",
    description: "Structured view of how competitors position, price, and differentiate.",
    icon: Users,
    span: "col-span-1",
  },
  {
    title: "Shareable readout",
    description: "Exec-ready output formatted for internal sharing with citations intact.",
    icon: Share2,
    span: "col-span-1",
  },
  {
    title: "Repeatable method",
    description: "Same process, same structure—run it again when the market shifts.",
    icon: Repeat,
    span: "col-span-1",
  },
]

export function BentoFeatureGrid() {
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isWide = feature.span === "col-span-2"
            
            return (
              <div
                key={index}
                className={cn(
                  "panel p-6 rounded-xl border border-border-subtle",
                  "bg-surface shadow-sm hover:shadow-md transition-all",
                  "hover:border-accent-primary/30",
                  isWide ? "md:col-span-2" : "md:col-span-1"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-primary/10">
                    <Icon className="h-6 w-6 text-accent-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

