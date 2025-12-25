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

import Link from "next/link"
import { Button } from "@/components/ui/button"

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
          <div className="space-y-8 sm:space-y-12">
            <div className="text-center space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
                Built for decisions that will be challenged
              </h2>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {outcomes.map((outcome, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 sm:p-6 rounded-lg",
                    "bg-surface/50 border border-border/40",
                    "shadow-sm",
                    "space-y-2 sm:space-y-3"
                  )}
                >
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary leading-tight">
                    {outcome.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {outcome.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center space-y-4 sm:space-y-6">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Used by Product, Strategy, and UX leaders making visible calls.
              </p>
              {/* Mobile CTA */}
              <div className="lg:hidden">
                <Link href="/new" className="inline-block w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="brand"
                    className="w-full sm:w-auto"
                  >
                    Try Plinth
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

