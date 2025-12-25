/**
 * Outcome Example Section
 * 
 * Visual proof section showing a real Plinth decision artifact.
 * Two-column layout: visual artifact (left) + explanatory bullets (right).
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { DecisionBriefPreview } from "./previews/DecisionBriefPreview"

export function OutcomeExampleSection() {
  return (
    <MarketingSection variant="default">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="space-y-6 sm:space-y-8">
            {/* Headline - reduced on mobile */}
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
                What you get back — no dashboards, no fluff
              </h2>
            </div>

            {/* Mobile: Visual first, then bullets. Desktop: side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
              {/* Left Column: The Artifact (Primary) */}
              <div className="lg:sticky lg:top-8 order-1">
                <DecisionBriefPreview />
                
                {/* Caption - shorter on mobile */}
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-center text-text-secondary italic">
                  This is a real Plinth decision — exactly what you'd share with a stakeholder.
                </p>
              </div>

              {/* Right Column: Minimal Explanation (Secondary) */}
              <div className="space-y-4 sm:space-y-6 pt-0 sm:pt-2 order-2">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-text-primary mb-1 sm:mb-2">
                      Clear recommendation
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      One call, not a list of ideas
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-text-primary mb-1 sm:mb-2">
                      Evidence you can inspect
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      Every claim links to a real source
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-text-primary mb-1 sm:mb-2">
                      Confidence you can explain
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      Scores, thresholds, and uncertainty are explicit
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-text-primary mb-1 sm:mb-2">
                      Next steps included
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      See what would increase confidence next
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile CTA */}
            <Reveal delay={60}>
              <div className="mt-6 sm:mt-8 text-center lg:hidden">
                <Link href="/example" className="inline-block w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    See a real decision
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

