/**
 * Evidence Ledger Page
 * 
 * Marketing page explaining how Plinth collects and organizes competitor evidence.
 */
import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { GlassPanel } from "@/components/marketing/GlassPanel"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Evidence Ledger — Plinth",
    description:
      "How Plinth collects and organizes competitor evidence into a structured, inspectable ledger with citations and recency indicators.",
    path: "/product/evidence-ledger",
    robots: {
      index: false,
      follow: false,
    },
  })
}

export default function EvidenceLedgerPage() {
  return (
    <MarketingPageShell
      title="Evidence Ledger"
      eyebrow="Product"
      lead="A structured, inspectable record of competitor evidence—with citations, recency, and coverage indicators."
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
                    Traceable sources
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Every piece of evidence links back to its source, so you can verify claims and understand context.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2 sm:mb-3">
                    Recency indicators
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Evidence includes timestamps and freshness markers, helping you understand how current the signals are.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2 sm:mb-3">
                    Structured organization
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Evidence is normalized across competitors, making patterns and gaps visible in a consistent format.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2 sm:mb-3">
                    Coverage visibility
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    See what's been collected, what's missing, and where evidence is strongest or weakest.
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
                      Public pages only
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      We collect evidence from publicly accessible pages: marketing sites, help docs, blog posts, and public announcements. No private data, no speculation.
                    </p>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-base sm:text-lg font-semibold text-text-primary">
                      Structured extraction
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      Evidence is extracted and organized into a consistent format, making it easy to compare across competitors and identify patterns.
                    </p>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-base sm:text-lg font-semibold text-text-primary">
                      Citation preservation
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      Every claim in the ledger preserves its source URL and context, so you can trace back to the original evidence whenever needed.
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

