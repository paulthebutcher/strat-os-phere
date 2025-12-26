/**
 * "The Flow" Section
 * 
 * Simple left-to-right or top-to-bottom flow with screenshots.
 * Headline: "Bring a hunch. Leave with receipts."
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal, Stagger } from "./motion"
import { cn } from "@/lib/utils"

export function TheFlowSection() {
  const steps = [
    {
      label: "You bring",
      description: "a question, a market, a hunch"
    },
    {
      label: "Plinth does",
      description: "the digging"
    },
    {
      label: "You get",
      description: "something defensible"
    }
  ]

  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              Bring a hunch. Leave with receipts.
            </h2>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Stagger>
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={cn(
                    "text-center space-y-4",
                    "p-6 rounded-lg bg-surface/50 border border-border-subtle"
                  )}
                >
                  <div className={cn(
                    "rounded-lg border border-border-subtle bg-surface-muted/30",
                    "aspect-video flex items-center justify-center mb-4"
                  )}>
                    <p className="text-xs text-text-muted">
                      [{step.label === "You bring" && "Input screenshot"}
                      {step.label === "Plinth does" && "Evidence gathering"}
                      {step.label === "You get" && "Readout preview"}]
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">
                      {step.label}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </Stagger>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

