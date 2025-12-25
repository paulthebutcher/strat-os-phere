/**
 * Built for Real Decision Makers Section
 * 
 * Result-oriented positioning for teams who can't afford second guesses.
 */
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function BuiltForDecisionMakersSection() {
  const bullets = [
    "Save prep time on strategic meetings",
    "Defend your recommendations with real evidence",
    "Skip opinion — focus on what's true",
  ]

  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="4xl">
        <Reveal>
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary">
                Built for teams who can't afford second guesses
              </h2>
            </div>
            <div className="space-y-4 max-w-2xl mx-auto">
              {bullets.map((bullet, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg",
                    "bg-surface border border-border-subtle"
                  )}
                >
                  <CheckCircle2 className="h-5 w-5 text-accent-primary mt-0.5 shrink-0" />
                  <p className="text-base md:text-lg text-text-secondary">
                    {bullet}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

