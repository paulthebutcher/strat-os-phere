import { FileText, Clock, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"


export function TrustTiles() {
  return (
    <MarketingSection id="trust" variant="tinted" className="relative">
      <MarketingContainer maxWidth="6xl">
        <div className="mx-auto max-w-3xl text-center space-y-4 mb-12">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-text-primary">
            Credible by design
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-text-secondary">
            Plinth shows its work. Every recommendation is tied to sources and recency—so you can defend decisions in real conversations.
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            className={cn(
              "panel p-6 rounded-2xl border border-border-subtle",
              "bg-surface shadow-sm hover:shadow-md transition-all",
              "hover:border-accent-primary/30"
            )}
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-primary/10">
                <FileText className="h-6 w-6 text-accent-primary" />
              </div>
            </div>
            <h3 className="mb-2 text-base font-semibold text-text-primary text-center">
              Evidence grouped by type
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary text-center">
              Pricing, docs, reviews, and more—organized so you can see what matters.
            </p>
          </div>
          
          <div
            className={cn(
              "panel p-6 rounded-2xl border border-border-subtle",
              "bg-surface shadow-sm hover:shadow-md transition-all",
              "hover:border-accent-primary/30"
            )}
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-primary/10">
                <Clock className="h-6 w-6 text-accent-primary" />
              </div>
            </div>
            <h3 className="mb-2 text-base font-semibold text-text-primary text-center">
              Recency signals
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary text-center">
              So you know what's current and what's stale.
            </p>
          </div>
          
          <div
            className={cn(
              "panel p-6 rounded-2xl border border-border-subtle",
              "bg-surface shadow-sm hover:shadow-md transition-all",
              "hover:border-accent-primary/30"
            )}
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-primary/10">
                <Share2 className="h-6 w-6 text-accent-primary" />
              </div>
            </div>
            <h3 className="mb-2 text-base font-semibold text-text-primary text-center">
              Links back to sources
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary text-center">
              For verification and deeper context when you need it.
            </p>
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

