/**
 * Security & Privacy Page
 * 
 * Marketing page explaining Plinth's security and privacy posture.
 */
import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { GlassPanel } from "@/components/marketing/GlassPanel"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Security & Privacy",
    description:
      "Plinth collects only from public pages, preserves your privacy, and handles data responsibly.",
    path: "/trust/security-privacy",
    robots: {
      index: false,
      follow: false,
    },
  })
}

export default function SecurityPrivacyPage() {
  return (
    <MarketingPageShell
      title="Security & Privacy"
      eyebrow="Trust"
      lead="We collect only from public pages, preserve your privacy, and handle data responsibly."
    >
      <MarketingSection>
        <MarketingContainer maxWidth="4xl">
          <div className="space-y-12">
            {/* What it gives you */}
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-text-primary mb-6">
                Our approach
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Public pages only
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    We collect evidence exclusively from publicly accessible pages: marketing sites, help docs, blog posts, and public announcements. No private data, no speculation.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Your data privacy
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Your project data and analysis inputs are private to your account. We don't share your work with other users or use it for training models.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Secure authentication
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    We use secure, industry-standard authentication methods to protect your account and data access.
                  </p>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    Responsible data handling
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    We handle your data responsibly and transparently. See our Privacy Policy for details on what we collect and how we use it.
                  </p>
                </GlassPanel>
              </div>
            </div>

            {/* What we don't do */}
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-text-primary mb-6">
                What we don't do
              </h2>
              <div className="space-y-4">
                <GlassPanel className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      No private data collection
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      We don't collect or attempt to access private competitor data, internal tools, or confidential information. Everything comes from publicly accessible pages.
                    </p>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      No data sharing
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      We don't share your project data, analysis inputs, or outputs with other users or third parties without your explicit consent.
                    </p>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      No unauthorized access
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      We don't attempt to access competitor systems, bypass authentication, or use any methods that would violate terms of service or ethical guidelines.
                    </p>
                  </div>
                </GlassPanel>
              </div>
            </div>

            {/* Links */}
            <div className="pt-8 border-t border-border-subtle">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/privacy"
                  className="text-sm text-primary hover:underline text-center"
                >
                  View Privacy Policy →
                </a>
                <a
                  href="/contact"
                  className="text-sm text-primary hover:underline text-center"
                >
                  Contact us with questions →
                </a>
              </div>
            </div>
          </div>
        </MarketingContainer>
      </MarketingSection>
    </MarketingPageShell>
  )
}

