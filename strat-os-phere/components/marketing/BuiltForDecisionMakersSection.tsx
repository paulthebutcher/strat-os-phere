/**
 * Built for Real Decision Makers Section
 * 
 * High-stakes outcomes narrative for decisions that will be challenged.
 */
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { cn } from "@/lib/utils"

interface OutcomeCard {
  headline: string
  description: string
}

export function BuiltForDecisionMakersSection() {
  const outcomes: OutcomeCard[] = [
    {
      headline: "Walk into the room prepared",
      description: "Stop spending days assembling slides just to justify a point.",
    },
    {
      headline: "Stand behind your recommendation",
      description: "Every claim backed by evidence you can point to, not just explain.",
    },
    {
      headline: "Move the conversation forward",
      description: "Focus on what's supported — and what would change the call — not opinions.",
    },
  ]

  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="4xl">
        <Reveal>
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary">
                Built for decisions that will be challenged
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {outcomes.map((outcome, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-6 rounded-lg",
                    "bg-surface/50 border border-border/40",
                    "shadow-sm",
                    "space-y-3"
                  )}
                >
                  <h3 className="text-lg font-semibold text-text-primary leading-tight">
                    {outcome.headline}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {outcome.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Used by Product, Strategy, and UX leaders making visible calls.
              </p>
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

