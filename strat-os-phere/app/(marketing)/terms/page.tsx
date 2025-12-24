/**
 * Terms of Service Page
 * 
 * Basic terms of service page for Plinth.
 */
import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { GlassPanel } from "@/components/marketing/GlassPanel"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Terms of Service — Plinth",
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
      title="Terms of Service"
      eyebrow="Company"
      lead="Terms governing your use of Plinth."
    >
      <MarketingSection>
        <MarketingContainer maxWidth="4xl">
          <div className="space-y-8">
            <GlassPanel className="p-8">
              <div className="prose prose-sm max-w-none space-y-6 text-text-secondary">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Last updated
                  </h2>
                  <p>
                    These Terms of Service were last updated on{" "}
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    .
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Acceptance of terms
                  </h2>
                  <p>
                    By accessing and using Plinth, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Use of service
                  </h2>
                  <p>
                    Plinth is designed to help strategy professionals conduct competitive analysis and generate strategic insights. You may use the service for lawful business purposes in accordance with these terms.
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Account responsibilities
                  </h2>
                  <p>
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Data and privacy
                  </h2>
                  <p>
                    Your use of Plinth is also governed by our Privacy Policy. Please review the Privacy Policy to understand our data practices.
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Changes to terms
                  </h2>
                  <p>
                    We reserve the right to modify these terms at any time. We will notify users of material changes by posting the updated terms on this page with a new "Last updated" date.
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Contact
                  </h2>
                  <p>
                    If you have questions about these Terms of Service, please contact us at{" "}
                    <a
                      href="mailto:hello@myplinth.com"
                      className="text-primary hover:underline"
                    >
                      hello@myplinth.com
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

