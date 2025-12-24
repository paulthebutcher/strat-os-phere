/**
 * Rank Page
 * 
 * Marketing page explaining how Plinth ranks strategic opportunities.
 */
import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { GlassPanel } from "@/components/marketing/GlassPanel"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Rank — How it Works — Plinth",
    description:
      "How Plinth scores and ranks strategic bets by confidence and impact, surfacing the highest-signal opportunities first.",
    path: "/how-it-works/rank",
    robots: {
      index: false,
      follow: false,
    },
  })
}

export default function RankPage() {
  return (
    <MarketingPageShell
      title="Rank"
      eyebrow="How it Works"
      lead="Strategic bets are scored and ranked by confidence and impact, helping you focus on the highest-signal opportunities first."
    >
      <MarketingSection>
        <MarketingContainer maxWidth="4xl">
          <div className="space-y-12">
            {/* What it gives you */}
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-text-primary mb-6">
                What it gives you
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Prioritized focus
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    The highest-signal opportunities appear first, so you can focus your strategy work where it matters most.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Confidence transparency
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Each opportunity shows its confidence level and supporting evidence, so you understand the strength of the signal.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Impact scoring
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Opportunities are scored by potential impact, helping you balance confidence with strategic importance.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Defensible rankings
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Rankings use deterministic scoring inputs, so you can explain why one opportunity ranked higher than another.
                  </p>
                </GlassPanel>
              </div>
            </div>

            {/* How it works */}
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-text-primary mb-6">
                How it works
              </h2>
              <div className="space-y-4">
                <GlassPanel className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Evidence-backed opportunities
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Strategic bets are derived from the evidence ledger, ensuring every opportunity is grounded in observable competitor signals.
                    </p>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Deterministic scoring
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Scoring uses transparent, deterministic inputs—like evidence coverage, recency, consistency, and cross-competitor alignment—rather than black-box models.
                    </p>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Multi-factor ranking
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Opportunities are ranked by combining confidence scores (how well-evidenced they are) with impact estimates (how strategically important they appear to be). The highest combined scores rank first.
                    </p>
                  </div>
                </GlassPanel>
              </div>
            </div>
          </div>
        </MarketingContainer>
      </MarketingSection>
    </MarketingPageShell>
  )
}

