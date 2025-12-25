/**
 * Privacy Policy Page
 * 
 * Simple, transparent, minimal privacy policy—honest and non-legalese.
 */
import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { GlassPanel } from "@/components/marketing/GlassPanel"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Privacy Policy — Plinth",
    description: "How we collect, use, and protect your data at Plinth.",
    path: "/privacy",
    robots: {
      index: false,
      follow: false,
    },
  })
}

export default function PrivacyPage() {
  return (
    <MarketingPageShell
      title="Privacy Policy"
      eyebrow="Company"
      lead="Simple, transparent explanation of how we handle your data."
    >
      <MarketingSection>
        <MarketingContainer maxWidth="4xl">
          <div className="space-y-6 sm:space-y-8">
            <GlassPanel className="p-4 sm:p-6 md:p-8 lg:p-12">
              <div className="space-y-8 sm:space-y-10 text-text-secondary">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-3 sm:mb-4">
                    What we collect
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed">
                    Account information: your email address when you sign up, and usage signals (which pages you visit, when you create projects, etc.). Project data: your decision questions, competitor names, and the evidence we collect during analysis runs. This data is private to your account.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-3 sm:mb-4">
                    What we don't collect
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed">
                    We don't collect customer secrets unless you explicitly provide them. We don't access private data from competitors—we only collect from publicly accessible pages (marketing sites, help docs, blog posts). We don't share your competitive data with other users.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-3 sm:mb-4">
                    How we use data
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed">
                    We use your data to provide the product (running analyses, storing projects, managing your account) and to improve quality (understanding usage patterns, fixing bugs, improving recommendations). We don't sell your data or share it with third parties for marketing purposes.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-3 sm:mb-4">
                    Retention
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed">
                    We retain your account and project data while your account is active. If you delete your account, we delete your data. Evidence we collect during analysis runs is stored in the context of your projects—we don't maintain a shared evidence pool across users.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-3 sm:mb-4">
                    Contact
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed">
                    Questions about privacy? Email us at{" "}
                    <a
                      href="mailto:hello@myplinth.com"
                      className="text-primary hover:underline break-all"
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

