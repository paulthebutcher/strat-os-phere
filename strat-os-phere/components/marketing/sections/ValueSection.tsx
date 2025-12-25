/**
 * Value Section
 * 
 * "What Plinth delivers" - tight bullets about decision defense.
 * Section id: #value
 */
import { MarketingSection } from "../MarketingSection"
import { MarketingContainer } from "../MarketingContainer"

const valuePoints = [
  "Evidence-bound opportunities (with citations)",
  "Clear assumptions and confidence boundaries",
  "Explainable prioritization (why this outranks alternatives)",
  "Executive-ready framing (what to do, why now, what could change)",
]

export function ValueSection() {
  return (
    <MarketingSection variant="default" id="value">
      <MarketingContainer maxWidth="6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
            Decisions you can defend.
          </h2>
        </div>

        {/* Value points grid - simple bullet list */}
        <div className="max-w-2xl mx-auto">
          <ul className="space-y-4">
            {valuePoints.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-lg text-text-secondary"
              >
                <span className="text-accent-primary font-semibold mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

