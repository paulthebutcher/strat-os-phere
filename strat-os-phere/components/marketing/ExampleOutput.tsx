/**
 * Example Output Section
 * 
 * Tiny illustrative snippet for approachability.
 * Section id: #example
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { cn } from "@/lib/utils"

export function ExampleOutput() {
  return (
    <MarketingSection variant="muted" id="example">
      <MarketingContainer maxWidth="4xl">
        <Reveal>
          <div className={cn(
            "bg-white rounded-lg border border-border-subtle p-6 shadow-sm",
            "max-w-2xl mx-auto"
          )}>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-text-secondary mb-1">Idea:</p>
                <p className="text-base text-text-primary">
                  "Teams struggle to coordinate on-call handoffs."
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary mb-1">Plinth:</p>
                <p className="text-base text-text-primary">
                  "Here are 3 evidence-bound opportunities + what would increase confidence."
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

