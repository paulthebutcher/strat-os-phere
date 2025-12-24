/**
 * Deterministic Scoring Page
 * 
 * Marketing page explaining how Plinth uses deterministic scoring for rankings.
 */
import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { GlassPanel } from "@/components/marketing/GlassPanel"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Deterministic Scoring — Trust — Plinth",
    description:
      "Plinth uses transparent, deterministic scoring inputs—not black-box models—so you can explain how rankings were calculated.",
    path: "/trust/deterministic-scoring",
    robots: {
      index: false,
      follow: false,
    },
  })
}

export default function DeterministicScoringPage() {
  return (
    <MarketingPageShell
      title="Deterministic Scoring"
      eyebrow="Trust"
      lead="Rankings use transparent, deterministic inputs—not black-box models—so you can explain how scores were calculated."
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
                    Transparent calculations
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Scoring uses observable inputs like evidence coverage, recency, consistency, and cross-competitor alignment—not hidden model weights.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Explainable rankings
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    You can explain why one opportunity ranked higher than another by pointing to the deterministic factors that contributed to the score.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    No black boxes
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    We don't use opaque neural network outputs for scoring. Every ranking factor is based on observable, verifiable evidence characteristics.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Reproducible results
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Given the same evidence and scoring inputs, rankings are reproducible. This consistency helps build trust in the method.
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
                      Observable inputs
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Scoring considers factors you can observe and verify: how many sources support a claim, how recent the evidence is, how consistently it appears across competitors, and how well it aligns with your decision context.
                    </p>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Transparent weighting
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Scoring weights are based on principles you can understand: recency matters, multiple sources increase confidence, consistency strengthens signals. These aren't hidden neural network parameters.
                    </p>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Confidence + impact
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Rankings combine confidence scores (how well-evidenced an opportunity is) with impact estimates (how strategically important it appears), using deterministic calculations you can inspect and understand.
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

