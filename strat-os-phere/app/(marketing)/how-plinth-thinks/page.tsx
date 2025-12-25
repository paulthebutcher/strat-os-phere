/**
 * How Plinth Thinks Page
 * 
 * Marketing page explaining Plinth's methodology and decision system.
 * Focuses on confidence boundaries, evidence-bound approach, and fail-closed trust posture.
 */
import type { Metadata } from "next"
import Link from "next/link"
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { GlassPanel } from "@/components/marketing/GlassPanel"
import { Button } from "@/components/ui/button"
import { createPageMetadata } from "@/lib/seo/metadata"
import { cn } from "@/lib/utils"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "How Plinth thinks — Plinth",
    description:
      "How Plinth turns public signals into defensible calls—with citations and confidence boundaries.",
    path: "/how-plinth-thinks",
    ogVariant: "default",
    canonical: true,
    robots: {
      index: true,
      follow: true,
    },
  })
}

export default function HowPlinthThinksPage() {
  return (
    <MarketingPageShell
      title="How Plinth thinks"
      eyebrow="Methodology"
      lead="A decision system designed to make confidence boundaries explicit — what the evidence supports now, what it doesn't yet, and what would increase certainty."
    >
      {/* Hero note */}
      <MarketingSection>
        <MarketingContainer maxWidth="4xl">
          <div className="text-center px-4 sm:px-0">
            <p className="text-xs sm:text-sm text-text-muted italic">
              Decision credibility over AI novelty.
            </p>
          </div>
        </MarketingContainer>
      </MarketingSection>

      {/* What Plinth looks at */}
      <MarketingSection>
        <MarketingContainer maxWidth="4xl">
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary mb-4 sm:mb-6">
                What Plinth looks at
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <GlassPanel className="p-3 sm:p-5">
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Pricing and packaging signals
                  </p>
                </GlassPanel>
                <GlassPanel className="p-3 sm:p-5">
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Product docs and API surfaces
                  </p>
                </GlassPanel>
                <GlassPanel className="p-3 sm:p-5">
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Changelog/release velocity
                  </p>
                </GlassPanel>
                <GlassPanel className="p-3 sm:p-5">
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Reviews and community signals
                  </p>
                </GlassPanel>
                <GlassPanel className="p-3 sm:p-5">
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Security/compliance posture
                  </p>
                </GlassPanel>
                <GlassPanel className="p-3 sm:p-5">
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Public positioning and proof points
                  </p>
                </GlassPanel>
              </div>
            </div>
          </div>
        </MarketingContainer>
      </MarketingSection>

      {/* How signals become opportunities */}
      <MarketingSection variant="muted">
        <MarketingContainer maxWidth="4xl">
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary mb-4 sm:mb-6">
                How signals become opportunities
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <GlassPanel className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs sm:text-sm font-semibold text-primary">
                      1
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-1.5 sm:mb-2">
                        Collect public market evidence
                      </h3>
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        We gather evidence from publicly accessible sources across your competitors — marketing sites, documentation, announcements, and reviews.
                      </p>
                    </div>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs sm:text-sm font-semibold text-primary">
                      2
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-1.5 sm:mb-2">
                        Normalize into comparable claims
                      </h3>
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        Evidence is organized into structured claims so sources can agree or conflict clearly. This makes patterns visible across competitors.
                      </p>
                    </div>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs sm:text-sm font-semibold text-primary">
                      3
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-1.5 sm:mb-2">
                        Synthesize opportunities with explicit assumptions and citations
                      </h3>
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        Opportunities are synthesized from evidence patterns, with clear citations and explicit assumptions. You see what supports the recommendation and what doesn't.
                      </p>
                    </div>
                  </div>
                </GlassPanel>
              </div>
            </div>
          </div>
        </MarketingContainer>
      </MarketingSection>

      {/* Confidence boundaries */}
      <MarketingSection>
        <MarketingContainer maxWidth="4xl">
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary mb-4 sm:mb-6">
                Confidence boundaries (the organizing principle)
              </h2>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-6 sm:mb-8 px-4 sm:px-0">
                Three states as states, not modes:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <GlassPanel className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-1.5 sm:mb-2">
                    Exploratory
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-accent-primary mb-2 sm:mb-3">
                    Safe to explore
                  </p>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Signals are early or uneven. Worth testing, but not yet safe to commit significant resources.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-1.5 sm:mb-2">
                    Directional
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-accent-primary mb-2 sm:mb-3">
                    Safe to prioritize discovery
                  </p>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Multiple signals align, but key assumptions remain. Safe to begin scoping and validation work.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-1.5 sm:mb-2">
                    Investment-ready
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-accent-primary mb-2 sm:mb-3">
                    Safe to invest
                  </p>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Evidence converges; risks are explicit. Safe to commit resources with clear understanding of assumptions.
                  </p>
                </GlassPanel>
              </div>
              <div className="text-center px-4 sm:px-0">
                <p className="text-sm sm:text-base text-text-secondary italic">
                  Plinth won't pretend uncertainty is resolved.
                </p>
              </div>
            </div>
          </div>
        </MarketingContainer>
      </MarketingSection>

      {/* Why Plinth fails closed */}
      <MarketingSection variant="muted">
        <MarketingContainer maxWidth="4xl">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary mb-4 sm:mb-6">
                Why Plinth fails closed
              </h2>
              <GlassPanel className="p-4 sm:p-6">
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-3 sm:mb-4">
                  If evidence is thin, Plinth returns fewer (or no) opportunities.
                </p>
                <p className="text-sm sm:text-base text-text-primary font-medium">
                  "No output" is a trust feature, not a bug.
                </p>
              </GlassPanel>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-3 sm:mt-4">
                When the evidence doesn't support confident recommendations, Plinth tells you that. It's better to know you don't have enough signal than to get recommendations based on thin evidence.
              </p>
            </div>
          </div>
        </MarketingContainer>
      </MarketingSection>

      {/* What Plinth is / is not */}
      <MarketingSection>
        <MarketingContainer maxWidth="4xl">
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary mb-4 sm:mb-6">
                What Plinth is / is not
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <GlassPanel className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3 sm:mb-4">
                    Plinth is
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-text-secondary">
                    <li>• Evidence-bound</li>
                    <li>• Conservative</li>
                    <li>• Explainable</li>
                  </ul>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3 sm:mb-4">
                    Plinth is not
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-text-secondary">
                    <li>• A dashboard</li>
                    <li>• A brainstorm toy</li>
                    <li>• A replacement for judgment</li>
                  </ul>
                </GlassPanel>
              </div>
            </div>
          </div>
        </MarketingContainer>
      </MarketingSection>

      {/* Custom CTA */}
      <MarketingSection variant="muted">
        <MarketingContainer maxWidth="4xl">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-text-primary">
                Make the call with your eyes open.
              </h2>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row pt-2">
              <Link href="/example" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto min-h-[44px]">
                  View an example
                </Button>
              </Link>
              <Link href="/new" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto min-h-[44px]">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </MarketingContainer>
      </MarketingSection>
    </MarketingPageShell>
  )
}

