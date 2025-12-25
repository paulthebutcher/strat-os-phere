/**
 * Value Section
 * 
 * "What Plinth delivers" - outcome-oriented statements about decision defense.
 * Section id: #value
 */
import { MarketingSection } from "../MarketingSection"
import { MarketingContainer } from "../MarketingContainer"

const valuePoints = [
  {
    title: "Evidence-bound opportunities",
    description: "Claims are grounded in public signals — pricing, docs, changelogs, reviews — with citations you can point to.",
  },
  {
    title: "Explicit confidence boundaries",
    description: "Every recommendation makes clear what the evidence supports today — and what would need to change to support a stronger call.",
  },
  {
    title: "Explainable prioritization",
    description: "Rankings aren't arbitrary. You can see exactly why one opportunity outranks another, and which signals drove the result.",
  },
  {
    title: "Executive-ready framing",
    description: "Clear guidance on what to do, why now, and what risks or assumptions could invalidate the decision.",
  },
]

export function ValueSection() {
  return (
    <MarketingSection variant="default" id="value">
      <MarketingContainer maxWidth="6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
            Decisions you can defend.
          </h2>
          <p className="text-lg text-text-secondary">
            When the question isn't what's interesting, but what's safe to act on.
          </p>
        </div>

        {/* Value points - outcome-oriented statements */}
        <div className="max-w-2xl mx-auto">
          <ul className="space-y-6">
            {valuePoints.map((point, index) => (
              <li
                key={index}
                className="text-lg text-text-secondary"
              >
                <span className="font-semibold text-text-primary">{point.title}</span>
                <span className="ml-2">{point.description}</span>
              </li>
            ))}
          </ul>
          
          {/* Contrast line */}
          <p className="mt-10 text-sm text-muted-foreground text-center">
            Most tools optimize for insight generation. Plinth optimizes for decision credibility.
          </p>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

