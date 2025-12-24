/**
 * Citations Page
 * 
 * Marketing page explaining how Plinth handles citations and source attribution.
 */
import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { GlassPanel } from "@/components/marketing/GlassPanel"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Citations — Trust — Plinth",
    description:
      "Every claim in Plinth is tied to traceable sources with URLs, so you can verify evidence and understand context.",
    path: "/trust/citations",
    robots: {
      index: false,
      follow: false,
    },
  })
}

export default function CitationsPage() {
  return (
    <MarketingPageShell
      title="Citations"
      eyebrow="Trust"
      lead="Every claim is tied to traceable sources with URLs, so you can verify evidence and understand context."
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
                    Verifiable claims
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Every strategic bet and insight includes citations you can click through to see the original evidence.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Context preservation
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Citations preserve the original context of the evidence, helping you understand how claims were derived.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Defensible decisions
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    When presenting recommendations, you can point to specific sources, making your decisions easier to defend and explain.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    No black boxes
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    We don't hide sources or ask you to trust claims without evidence. Every recommendation shows its work.
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
                      Source URLs preserved
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Every piece of evidence collected from competitor pages preserves its source URL, so you can always trace back to the original context.
                    </p>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Claims linked to evidence
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Strategic bets and insights explicitly link to the evidence that supports them, making the connection between claim and source clear.
                    </p>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Multiple citations supported
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      When a claim is supported by multiple sources, all relevant citations are included, giving you a fuller picture of the evidence base.
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

