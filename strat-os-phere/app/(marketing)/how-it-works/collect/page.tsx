/**
 * Collect Page
 * 
 * Marketing page explaining how Plinth collects competitor evidence.
 */
import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { GlassPanel } from "@/components/marketing/GlassPanel"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Collect — How it Works — Plinth",
    description:
      "How Plinth collects evidence from public pages across competitors, focusing on what's visible and verifiable.",
    path: "/how-it-works/collect",
    robots: {
      index: false,
      follow: false,
    },
  })
}

export default function CollectPage() {
  return (
    <MarketingPageShell
      title="Collect"
      eyebrow="How it Works"
      lead="We gather evidence from public pages across your competitors, focusing on what's visible and verifiable."
    >
      <MarketingSection>
        <MarketingContainer maxWidth="4xl">
          <div className="space-y-8 sm:space-y-12">
            {/* What it gives you */}
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary mb-4 sm:mb-6">
                What it gives you
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <GlassPanel className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2 sm:mb-3">
                    Public pages only
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    We collect from publicly accessible sources: marketing sites, help docs, blog posts, and public announcements. No private data, no speculation.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2 sm:mb-3">
                    Broad coverage
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Evidence is gathered across multiple competitor touchpoints, giving you a comprehensive view of their public positioning and features.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2 sm:mb-3">
                    Source preservation
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Every piece of evidence preserves its source URL and context, so you can trace back to the original page whenever needed.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2 sm:mb-3">
                    Recency tracking
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Evidence includes timestamps and freshness indicators, helping you understand how current the signals are.
                  </p>
                </GlassPanel>
              </div>
            </div>

            {/* How it works */}
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary mb-4 sm:mb-6">
                How it works
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <GlassPanel className="p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-base sm:text-lg font-semibold text-text-primary">
                      Targeted collection
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      We aim to collect evidence from key competitor touchpoints: their marketing homepage, feature pages, help documentation, blog posts, and public announcements.
                    </p>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-base sm:text-lg font-semibold text-text-primary">
                      Verifiable sources
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      Every piece of evidence is tied to a specific, accessible URL. If you can't visit the source and verify it, we don't include it.
                    </p>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-base sm:text-lg font-semibold text-text-primary">
                      Structured extraction
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      Evidence is extracted and organized into a consistent format, making it ready for normalization and analysis in the next step.
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

