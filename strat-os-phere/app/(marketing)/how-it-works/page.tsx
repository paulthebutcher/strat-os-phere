/**
 * How it Works Hub Page
 * 
 * Overview page for the How it Works section with links to subpages.
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
    title: "How it Works — Plinth",
    description:
      "Learn how Plinth collects competitor evidence, normalizes it into a structured ledger, and ranks strategic opportunities.",
    path: "/how-it-works",
    robots: {
      index: false,
      follow: false,
    },
  })
}

export default function HowItWorksPage() {
  return (
    <MarketingPageShell
      title="How it Works"
      eyebrow="Method"
      lead="Three steps: collect evidence, normalize it into a structured ledger, then rank strategic opportunities."
    >
      <MarketingSection>
        <MarketingContainer maxWidth="4xl">
          <div className="space-y-12">
            {/* Overview */}
            <div>
              <p className="text-base text-text-secondary leading-relaxed max-w-2xl mx-auto text-center">
                Plinth is designed around a simple, repeatable method. We collect publicly available competitor signals, organize them into a structured evidence ledger, and surface ranked strategic opportunities backed by citations and confidence indicators.
              </p>
            </div>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/how-it-works/collect">
                <GlassPanel className="p-6 hover:border-primary/20 transition-colors cursor-pointer h-full">
                  <div className="space-y-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-semibold text-primary">
                      1
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">
                        Collect
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        Gather evidence from public pages across competitors, focusing on what's visible and verifiable.
                      </p>
                    </div>
                  </div>
                </GlassPanel>
              </Link>
              <Link href="/how-it-works/normalize">
                <GlassPanel className="p-6 hover:border-primary/20 transition-colors cursor-pointer h-full">
                  <div className="space-y-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-semibold text-primary">
                      2
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">
                        Normalize
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        Organize evidence into a structured ledger, making patterns and gaps visible across competitors.
                      </p>
                    </div>
                  </div>
                </GlassPanel>
              </Link>
              <Link href="/how-it-works/rank">
                <GlassPanel className="p-6 hover:border-primary/20 transition-colors cursor-pointer h-full">
                  <div className="space-y-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-semibold text-primary">
                      3
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">
                        Rank
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        Score and rank strategic bets by confidence and impact, surfacing the highest-signal opportunities first.
                      </p>
                    </div>
                  </div>
                </GlassPanel>
              </Link>
            </div>
          </div>
        </MarketingContainer>
      </MarketingSection>
    </MarketingPageShell>
  )
}

