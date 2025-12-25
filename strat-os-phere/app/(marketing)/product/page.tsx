/**
 * Product Overview Page
 * 
 * Marketing page describing Plinth's core product offering.
 */
import type { Metadata } from "next"
import Link from "next/link"
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { GlassPanel } from "@/components/marketing/GlassPanel"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Product — Plinth",
    description:
      "Plinth turns public market evidence into ranked strategic bets with citations, confidence, and VP-ready framing.",
    path: "/product",
    robots: {
      index: false,
      follow: false,
    },
  })
}

export default function ProductPage() {
  return (
    <MarketingPageShell
      title="Product"
      eyebrow="What we build"
      lead="Plinth turns competitor signals into decision-ready outputs—backed by live evidence and citations."
    >
      <MarketingSection>
        <MarketingContainer maxWidth="4xl">
          <div className="space-y-8 sm:space-y-12">
            {/* What it gives you */}
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary mb-4 sm:mb-6">
                What it gives you
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <GlassPanel className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2 sm:mb-3">
                    Evidence-led insights
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Every strategic bet is tied to public evidence with traceable citations and recency indicators.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2 sm:mb-3">
                    Ranked opportunities
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Strategic bets are organized by confidence and impact—surfacing the highest-signal opportunities first.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2 sm:mb-3">
                    Decision-ready framing
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Outputs are designed for VP+ audiences: clear, defensible, and ready to drive decisions.
                  </p>
                </GlassPanel>
              </div>
            </div>

            {/* How it works (brief) */}
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary mb-4 sm:mb-6">
                How it works
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <GlassPanel className="p-4 sm:p-6">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs sm:text-sm font-semibold text-primary">
                      1
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-1.5 sm:mb-2">
                        Collect
                      </h3>
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        We gather evidence from public pages across your competitors, focusing on what's visible and verifiable.
                      </p>
                    </div>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs sm:text-sm font-semibold text-primary">
                      2
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-1.5 sm:mb-2">
                        Normalize
                      </h3>
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        Evidence is organized into a structured ledger, making patterns and gaps visible across competitors.
                      </p>
                    </div>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs sm:text-sm font-semibold text-primary">
                      3
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-1.5 sm:mb-2">
                        Rank
                      </h3>
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        Strategic bets are scored and ranked by confidence and impact, helping you focus on the highest-signal opportunities.
                      </p>
                    </div>
                  </div>
                </GlassPanel>
              </div>
            </div>

            {/* Related pages */}
            <div className="pt-6 sm:pt-8 border-t border-border-subtle">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary mb-4 sm:mb-6">
                Learn more
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Link href="/product/evidence-ledger">
                  <GlassPanel className="p-4 sm:p-6 hover:border-primary/20 transition-colors cursor-pointer min-h-[44px] flex items-center">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-1 sm:mb-2">
                        Evidence Ledger
                      </h3>
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        How we collect and organize competitor evidence into a structured, inspectable format.
                      </p>
                    </div>
                  </GlassPanel>
                </Link>
                <Link href="/product/opportunity-ranking">
                  <GlassPanel className="p-4 sm:p-6 hover:border-primary/20 transition-colors cursor-pointer min-h-[44px] flex items-center">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-1 sm:mb-2">
                        Opportunity Ranking
                      </h3>
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        How strategic bets are scored and ranked to surface the highest-signal opportunities.
                      </p>
                    </div>
                  </GlassPanel>
                </Link>
              </div>
            </div>
          </div>
        </MarketingContainer>
      </MarketingSection>
    </MarketingPageShell>
  )
}

