/**
 * Confidence Boundaries Section
 * 
 * Shows the 3 confidence states (not modes): Exploratory, Directional, Investment-ready
 * Section id: #confidence
 */
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { cn } from "@/lib/utils"

const confidenceStates = [
  {
    level: "Exploratory",
    tagline: "Safe to explore",
    description: "Early signals worth testing. Evidence is limited or uneven.",
  },
  {
    level: "Directional",
    tagline: "Safe to prioritize discovery",
    description: "Multiple independent signals align, but key assumptions remain.",
  },
  {
    level: "Investment-ready",
    tagline: "Safe to invest",
    description: "Evidence converges across sources and competitors. Risks are explicit.",
  },
]

export function ConfidenceBoundaries() {
  return (
    <MarketingSection variant="default" id="confidence">
      <MarketingContainer maxWidth="6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
            Confidence boundaries, not false precision.
          </h2>
        </div>

        {/* Confidence states - horizontal row on desktop, stacked on mobile */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {confidenceStates.map((state, index) => (
            <div
              key={index}
              className={cn(
                "bg-white rounded-xl border border-border-subtle p-6 shadow-sm",
                "flex flex-col"
              )}
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {state.level}
                </h3>
                <p className="text-sm font-medium text-accent-primary mb-3">
                  {state.tagline}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary flex-grow">
                {state.description}
              </p>
            </div>
          ))}
        </div>

        {/* Closing line */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-base text-text-secondary">
            Plinth tells you what the evidence supports now — and what would change the recommendation.
          </p>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

