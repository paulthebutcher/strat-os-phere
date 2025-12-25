/**
 * Contact Page
 * 
 * Frictionless contact page with clear guidance on what to include.
 */
import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { GlassPanel } from "@/components/marketing/GlassPanel"
import { createPageMetadata } from "@/lib/seo/metadata"
import { cn } from "@/lib/utils"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Contact — Plinth",
    description: "Get in touch with the Plinth team.",
    path: "/contact",
    robots: {
      index: false,
      follow: false,
    },
  })
}

export default function ContactPage() {
  return (
    <MarketingPageShell
      title="Contact"
      eyebrow="Company"
      lead="Get in touch—we'll respond with a clear next step, not a sales script."
    >
      <MarketingSection>
        <MarketingContainer maxWidth="2xl">
          <div className="space-y-8">
            <GlassPanel className="p-8 md:p-12">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Email us
                  </h2>
                  <p className="text-base text-text-secondary leading-relaxed mb-4">
                    Reach us at{" "}
                    <a
                      href="mailto:hello@myplinth.com"
                      className="text-primary hover:underline font-medium"
                    >
                      hello@myplinth.com
                    </a>
                    .
                  </p>
                  <p className="text-base text-text-secondary leading-relaxed">
                    <strong className="font-semibold text-text-primary">We'll respond with a clear next step—not a sales script.</strong>
                  </p>
                </div>

                <div className="pt-8 border-t border-border-subtle">
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    What should I include?
                  </h2>
                  <p className="text-base text-text-secondary leading-relaxed mb-4">
                    To help us respond quickly and usefully, include:
                  </p>
                  <ul className="space-y-2 text-base text-text-secondary list-disc list-inside">
                    <li>Decision type (e.g., "Should we build X?", "How do we position against Y?")</li>
                    <li>Market or industry context</li>
                    <li>Competitors you're analyzing (if known)</li>
                    <li>Desired output format (exec deck, roadmap, strategy memo, etc.)</li>
                  </ul>
                </div>
              </div>
            </GlassPanel>
          </div>
        </MarketingContainer>
      </MarketingSection>
    </MarketingPageShell>
  )
}

