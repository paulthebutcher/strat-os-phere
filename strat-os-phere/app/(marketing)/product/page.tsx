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
          <div className="space-y-12">
            {/* What it gives you */}
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-text-primary mb-6">
                What it gives you
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Evidence-led insights
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Every strategic bet is tied to public evidence with traceable citations and recency indicators.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Ranked opportunities
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Strategic bets are organized by confidence and impact—surfacing the highest-signal opportunities first.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Decision-ready framing
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Outputs are designed for VP+ audiences: clear, defensible, and ready to drive decisions.
                  </p>
                </GlassPanel>
              </div>
            </div>

            {/* How it works (brief) */}
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-text-primary mb-6">
                How it works
              </h2>
              <div className="space-y-4">
                <GlassPanel className="p-6">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        Collect
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        We gather evidence from public pages across your competitors, focusing on what's visible and verifiable.
                      </p>
                    </div>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        Normalize
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        Evidence is organized into a structured ledger, making patterns and gaps visible across competitors.
                      </p>
                    </div>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        Rank
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        Strategic bets are scored and ranked by confidence and impact, helping you focus on the highest-signal opportunities.
                      </p>
                    </div>
                  </div>
                </GlassPanel>
              </div>
            </div>

            {/* Related pages */}
            <div className="pt-8 border-t border-border-subtle">
              <h2 className="text-2xl font-semibold tracking-tight text-text-primary mb-6">
                Learn more
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/product/evidence-ledger">
                  <GlassPanel className="p-6 hover:border-primary/20 transition-colors cursor-pointer">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      Evidence Ledger
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      How we collect and organize competitor evidence into a structured, inspectable format.
                    </p>
                  </GlassPanel>
                </Link>
                <Link href="/product/opportunity-ranking">
                  <GlassPanel className="p-6 hover:border-primary/20 transition-colors cursor-pointer">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      Opportunity Ranking
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      How strategic bets are scored and ranked to surface the highest-signal opportunities.
                    </p>
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

