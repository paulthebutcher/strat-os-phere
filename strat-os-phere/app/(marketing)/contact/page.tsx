/**
 * Contact Page
 * 
 * Simple contact page for Plinth.
 */
import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { GlassPanel } from "@/components/marketing/GlassPanel"
import { createPageMetadata } from "@/lib/seo/metadata"

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
      lead="Get in touch with the Plinth team."
    >
      <MarketingSection>
        <MarketingContainer maxWidth="2xl">
          <div className="space-y-8">
            <GlassPanel className="p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Email
                  </h2>
                  <p className="text-base text-text-secondary">
                    For questions, feedback, or support, reach us at{" "}
                    <a
                      href="mailto:hello@myplinth.com"
                      className="text-primary hover:underline"
                    >
                      hello@myplinth.com
                    </a>
                  </p>
                </div>
                <div className="pt-6 border-t border-border-subtle">
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Feedback
                  </h2>
                  <p className="text-base text-text-secondary">
                    We're building Plinth for VP+ Product, UX, and Strategy teams. If you're working in this space and have thoughts on how we can improve, we'd love to hear from you.
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

