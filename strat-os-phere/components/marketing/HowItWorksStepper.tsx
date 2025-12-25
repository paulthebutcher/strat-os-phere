/**
 * Decisions You Can Defend Section
 * 
 * Simple progression showing how a hunch becomes a defendable call.
 * Ultra-short steps, reduced text density.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal, Stagger } from "./motion"
import { cn } from "@/lib/utils"

const steps = [
  {
    stepNumber: 1,
    title: "Start with a hunch",
    description: "What you think might be true",
  },
  {
    stepNumber: 2,
    title: "Ground it in evidence",
    description: "Pricing, docs, reviews, changelogs",
  },
  {
    stepNumber: 3,
    title: "Make confidence explicit",
    description: "What's supported vs what's unknown",
  },
  {
    stepNumber: 4,
    title: "Get a next step",
    description: "What to do now, and what to validate",
  },
]

export function DecisionsYouCanDefend() {
  return (
    <MarketingSection variant="muted" id="decisions">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-3">
              Decisions you can defend.
            </h2>
            <p className="text-base sm:text-lg text-text-secondary">
              When someone asks "why this?", you'll have an answer.
            </p>
          </div>
        </Reveal>
        
        <Stagger stagger={60} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <Reveal key={index} delay={index * 60}>
              <div className="flex flex-col">
                <div className="mb-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    {step.stepNumber}
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-2 text-text-primary">
                  {step.title}
                </h3>
                <p className="text-sm text-text-secondary">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </Stagger>
      </MarketingContainer>
    </MarketingSection>
  )
}

