/**
 * Social Proof Section
 * 
 * Design tokens used:
 * - panel: Card styling for testimonials
 * - surface-muted: Logo placeholder background
 * - accent-primary: Avatar placeholder background
 * 
 * Enhanced with avatar placeholders and improved testimonial card styling.
 */
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

export function SocialProof() {
  return (
    <MarketingSection variant="default">
      <MarketingContainer maxWidth="4xl">
        <div className="text-center space-y-6">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-text-primary">
            Built for experienced strategists
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-text-secondary max-w-prose mx-auto">
            Designed to support VP+ decision-making workflows. Plinth gives you the clarity and defensibility you need to make hard calls with confidence.
          </p>
          <div className="mt-12">
            <div className="panel inline-block p-6 border-2 border-border-subtle rounded-2xl shadow-sm ring-1 ring-black/5">
              <p className="text-sm font-semibold uppercase tracking-wider text-text-muted md:text-base">
                Early access
              </p>
              <p className="mt-2 text-base text-text-secondary md:text-lg">
                Currently in early access. Built for Product/UX strategy professionals who need decision-ready outputs.
              </p>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

