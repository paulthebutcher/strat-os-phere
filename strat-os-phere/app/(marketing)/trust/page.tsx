/**
 * Trust Hub Page
 * 
 * Overview page for the Trust section with links to subpages.
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
    title: "Trust & confidence boundaries",
    description:
      "See how Plinth makes evidence, assumptions, and uncertainty inspectable—so decisions stay defensible.",
    path: "/trust",
    ogVariant: "default",
    canonical: true,
    robots: {
      index: false,
      follow: false,
    },
  })
}

export default function TrustPage() {
  return (
    <MarketingPageShell
      title="Trust"
      eyebrow="Credibility by design"
      lead="Plinth shows its work. Every recommendation is tied to sources and recency—so you can defend decisions in real conversations."
    >
      <MarketingSection>
        <MarketingContainer maxWidth="4xl">
          <div className="space-y-8 sm:space-y-12">
            {/* Overview */}
            <div className="px-4 sm:px-0">
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl mx-auto text-center">
                Plinth is designed for skeptical operators. We don't ask you to trust a black box. Instead, we surface citations, confidence indicators, deterministic scoring, and transparent evidence handling—so you can verify and defend every recommendation.
              </p>
            </div>

            {/* Trust pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Link href="/trust/citations">
                <GlassPanel className="p-4 sm:p-6 hover:border-primary/20 transition-colors cursor-pointer h-full min-h-[44px]">
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-text-primary">
                      Citations
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      Every claim is tied to traceable sources with URLs, so you can verify evidence and understand context.
                    </p>
                  </div>
                </GlassPanel>
              </Link>
              <Link href="/trust/deterministic-scoring">
                <GlassPanel className="p-4 sm:p-6 hover:border-primary/20 transition-colors cursor-pointer h-full min-h-[44px]">
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-text-primary">
                      Deterministic Scoring
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      Rankings use transparent, deterministic inputs—not black-box models—so you can explain how scores were calculated.
                    </p>
                  </div>
                </GlassPanel>
              </Link>
              <Link href="/trust/confidence">
                <GlassPanel className="p-4 sm:p-6 hover:border-primary/20 transition-colors cursor-pointer h-full min-h-[44px]">
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-text-primary">
                      Confidence
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      Every recommendation includes confidence indicators and coverage metrics, so you understand the strength of the evidence.
                    </p>
                  </div>
                </GlassPanel>
              </Link>
              <Link href="/trust/security-privacy">
                <GlassPanel className="p-4 sm:p-6 hover:border-primary/20 transition-colors cursor-pointer h-full min-h-[44px]">
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-text-primary">
                      Security & Privacy
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      We collect only from public pages, preserve your privacy, and handle data responsibly.
                    </p>
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

