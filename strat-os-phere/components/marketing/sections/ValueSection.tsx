/**
 * Value Section
 * 
 * "What Plinth delivers" - outcome-oriented statements about decision defense.
 * Section id: #value
 */
import { MarketingSection } from "../MarketingSection"
import { MarketingContainer } from "../MarketingContainer"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const valueCards = [
  {
    eyebrow: "Evidence",
    title: "Citations you can point to",
    description: "Opportunities are grounded in public signals—pricing, docs, changelogs, reviews—so the \"why\" is inspectable.",
    chips: ["Pricing", "Docs", "Changelog"],
  },
  {
    eyebrow: "Confidence",
    title: "Boundaries, not bravado",
    description: "Every recommendation makes clear what the evidence supports today—and what would need to change to support a stronger call.",
    chips: ["Exploratory", "Directional", "Investment-ready"],
  },
  {
    eyebrow: "Ranking",
    title: "Explainable prioritization",
    description: "You can see why one opportunity outranks another—and which signals drove the result. No arbitrary scores.",
    chips: ["Drivers", "Weights", "Why this ranks"],
  },
  {
    eyebrow: "Exec framing",
    title: "What to do, why now",
    description: "Clear guidance on action, timing, and what risks or assumptions could invalidate the decision.",
    chips: ["Risks", "Assumptions", "What could change"],
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
            When the question isn't what's interesting—but what's safe to act on.
          </p>
        </div>

        {/* Value cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {valueCards.map((card, index) => (
            <div
              key={index}
              className={cn(
                "relative bg-white rounded-xl border border-border-subtle p-6 shadow-sm",
                "hover:shadow-md transition-shadow",
                "overflow-hidden"
              )}
            >
              {/* Subtle background motif - corner accent */}
              <div 
                className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                  backgroundSize: '24px 24px',
                }}
              />
              
              {/* Top-left accent bar */}
              <div className="absolute top-0 left-0 w-1 h-16 bg-gradient-to-b from-accent-primary/20 to-transparent" />
              
              {/* Content */}
              <div className="relative">
                {/* Eyebrow */}
                <div className="mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {card.eyebrow}
                  </span>
                </div>
                
                {/* Title */}
                <h3 className="text-lg font-semibold text-text-primary mb-3">
                  {card.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm leading-relaxed text-text-secondary mb-4">
                  {card.description}
                </p>
                
                {/* Proof chips */}
                <div className="flex flex-wrap gap-2">
                  {card.chips.map((chip, chipIndex) => (
                    <Badge
                      key={chipIndex}
                      variant="neutral"
                      className="text-xs font-normal border-border-subtle bg-muted/50"
                    >
                      {chip}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Contrast line */}
        <p className="text-sm text-muted-foreground text-center">
          Most tools optimize for insight. Plinth optimizes for decision credibility.
        </p>
      </MarketingContainer>
    </MarketingSection>
  )
}

