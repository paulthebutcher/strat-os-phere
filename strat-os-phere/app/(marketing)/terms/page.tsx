/**
 * Terms of Service Page
 * 
 * Placeholder terms page—professional but honest about early stage.
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
    title: "Terms of service",
    description: "Terms of Service for Plinth.",
    path: "/terms",
    robots: {
      index: false,
      follow: false,
    },
  })
}

export default function TermsPage() {
  return (
    <MarketingPageShell
      title="Terms of Service (Draft)"
      eyebrow="Company"
      lead="Early version terms—contact us for enterprise terms."
    >
      <MarketingSection>
        <MarketingContainer maxWidth="4xl">
          <div className="space-y-6 sm:space-y-8">
            <GlassPanel className="p-4 sm:p-6 md:p-8 lg:p-12">
              <div className="space-y-6 sm:space-y-8 text-text-secondary">
                <div className={cn("p-4 sm:p-6 rounded-lg", "bg-surface-muted border border-border-subtle")}>
                  <p className="text-sm sm:text-base leading-relaxed">
                    This is an early version of our Terms of Service. If you're evaluating Plinth for enterprise use, contact us at{" "}
                    <a
                      href="mailto:hello@myplinth.com"
                      className="text-primary hover:underline break-all"
                    >
                      hello@myplinth.com
                    </a>
                    {" "}for the latest terms.
                  </p>
                </div>

                <div>
                  <p className="text-sm sm:text-base leading-relaxed">
                    Plinth is designed to help strategy professionals conduct competitive analysis and generate strategic insights. By using Plinth, you agree to use the service for lawful business purposes and to maintain the confidentiality of your account credentials.
                  </p>
                </div>

                <div>
                  <p className="text-sm sm:text-base leading-relaxed">
                    Your use of Plinth is also governed by our{" "}
                    <a
                      href="/privacy"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                </div>
              </div>
            </GlassPanel>
          </div>
        </MarketingContainer>
      </MarketingSection>
    </MarketingPageShell>
  )
}

