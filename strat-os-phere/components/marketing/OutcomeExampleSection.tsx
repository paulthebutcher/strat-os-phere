/**
 * Outcome Example Section
 * 
 * Mini case snippet showing a simple idea transformed into insight.
 */
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"

export function OutcomeExampleSection() {
  return (
    <MarketingSection variant="default">
      <MarketingContainer maxWidth="4xl">
        <Reveal>
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary">
                What this actually looks like — no dashboards, no fluff
              </h2>
            </div>
            <div className="prose prose-lg max-w-none text-center">
              <p className="text-base md:text-lg leading-relaxed text-text-secondary">
                Bring a hunch (e.g., "Teams struggle with on-call handoffs"). Plinth analyzes public sources, ranks opportunities with evidence scores, and shows what would increase confidence next.
              </p>
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

