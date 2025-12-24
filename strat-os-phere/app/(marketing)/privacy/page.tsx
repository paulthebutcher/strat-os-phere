/**
 * Privacy Policy Page
 * 
 * Basic privacy policy page for Plinth.
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
    description: "Privacy Policy for Plinth.",
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
      lead="How we collect, use, and protect your data."
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
                    This Privacy Policy was last updated on{" "}
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
                    Information we collect
                  </h2>
                  <p>
                    We collect information you provide directly to us, such as when you create an account, create projects, or contact us for support. This may include your email address, project data, and analysis inputs.
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    How we use your information
                  </h2>
                  <p>
                    We use the information we collect to provide, maintain, and improve our service, to process your requests, and to communicate with you. We do not share your project data or analysis inputs with other users or third parties without your explicit consent.
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Data security
                  </h2>
                  <p>
                    We take reasonable measures to protect your information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is 100% secure.
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Evidence collection
                  </h2>
                  <p>
                    When you use Plinth to analyze competitors, we collect evidence exclusively from publicly accessible pages (marketing sites, help docs, blog posts, etc.). We do not access private data, attempt to bypass authentication, or use methods that would violate terms of service.
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Cookies and tracking
                  </h2>
                  <p>
                    We use cookies and similar technologies to maintain your session and improve your experience. You can control cookie settings through your browser preferences.
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Your rights
                  </h2>
                  <p>
                    You have the right to access, update, or delete your account and data. If you would like to exercise these rights, please contact us at{" "}
                    <a
                      href="mailto:hello@myplinth.com"
                      className="text-primary hover:underline"
                    >
                      hello@myplinth.com
                    </a>
                    .
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Changes to this policy
                  </h2>
                  <p>
                    We may update this Privacy Policy from time to time. We will notify users of material changes by posting the updated policy on this page with a new "Last updated" date.
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Contact
                  </h2>
                  <p>
                    If you have questions about this Privacy Policy, please contact us at{" "}
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

