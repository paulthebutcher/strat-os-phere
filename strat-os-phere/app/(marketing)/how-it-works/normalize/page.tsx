/**
 * Normalize Page
 * 
 * Marketing page explaining how Plinth normalizes evidence into a structured ledger.
 */
import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { GlassPanel } from "@/components/marketing/GlassPanel"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Normalize — How it Works — Plinth",
    description:
      "How Plinth organizes evidence into a structured ledger, making patterns and gaps visible across competitors.",
    path: "/how-it-works/normalize",
    robots: {
      index: false,
      follow: false,
    },
  })
}

export default function NormalizePage() {
  return (
    <MarketingPageShell
      title="Normalize"
      eyebrow="How it Works"
      lead="Evidence is organized into a structured ledger, making patterns and gaps visible across competitors."
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
                    Consistent structure
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Evidence from different competitors is organized into a common format, making it easy to compare and identify patterns.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Pattern visibility
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    When multiple competitors share similar features or positioning, the structured ledger makes these patterns immediately visible.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Gap identification
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    The normalized structure highlights where evidence is strong or weak, helping you identify gaps in your competitive understanding.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Citation preservation
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Even after normalization, every piece of evidence maintains links back to its original source, so you can always verify and explore context.
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
                      Structured organization
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Evidence is organized into consistent categories and fields, allowing for meaningful comparison across competitors while preserving the original context.
                    </p>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Cross-competitor alignment
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Similar evidence types are aligned across competitors, making it straightforward to see where they overlap or diverge.
                    </p>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Coverage indicators
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      The ledger includes coverage indicators showing where evidence is strong, weak, or missing—helping you understand the completeness of your competitive view.
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

