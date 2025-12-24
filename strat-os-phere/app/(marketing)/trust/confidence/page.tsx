/**
 * Confidence Page
 * 
 * Marketing page explaining how Plinth communicates confidence and coverage indicators.
 */
import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { GlassPanel } from "@/components/marketing/GlassPanel"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Confidence — Trust — Plinth",
    description:
      "Every recommendation in Plinth includes confidence indicators and coverage metrics, so you understand the strength of the evidence.",
    path: "/trust/confidence",
    robots: {
      index: false,
      follow: false,
    },
  })
}

export default function ConfidencePage() {
  return (
    <MarketingPageShell
      title="Confidence"
      eyebrow="Trust"
      lead="Every recommendation includes confidence indicators and coverage metrics, so you understand the strength of the evidence."
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
                    Evidence strength signals
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Confidence indicators show how well-evidenced a recommendation is, helping you understand where to trust results and where to be cautious.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Coverage visibility
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Coverage metrics show where evidence is strong, weak, or missing, giving you a clear picture of the completeness of your competitive view.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Risk-aware decisions
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    By understanding confidence levels, you can make informed decisions about which opportunities to prioritize and which to treat as hypotheses.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    No false precision
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    We don't present all recommendations with equal weight. Confidence indicators help you distinguish between well-evidenced insights and weaker signals.
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
                      Evidence-based confidence
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Confidence levels are calculated from observable factors: how many sources support a claim, how recent the evidence is, how consistently it appears, and how well it aligns with the decision context.
                    </p>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Coverage indicators
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Coverage metrics show where evidence is strong or weak across competitors and categories, helping you identify gaps in your competitive understanding and prioritize where to gather more information.
                    </p>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Transparent presentation
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Confidence and coverage are presented clearly alongside recommendations, not hidden in fine print. You should always understand the strength of the evidence you're using to make decisions.
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

