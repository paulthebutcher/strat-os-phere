/**
 * Value Section
 * 
 * "Decisions you can defend" - narrative progression from uncertainty to action.
 * Section id: #value
 * 
 * Layout: Left header (narrow) + right progression strip (wide) | Stacked (mobile)
 * NO CARDS - just a connected progression with thin line.
 */
"use client"

import { MarketingSection } from "../MarketingSection"
import { MarketingContainer } from "../MarketingContainer"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Reveal, Stagger } from "../motion"

const steps = [
  {
    stepNumber: 1,
    title: "Ideas don't survive scrutiny",
    line: "Defensibility is the work.",
    chips: ["Stakeholders"],
  },
  {
    stepNumber: 2,
    title: "Receipts, not opinions",
    line: "Every claim links to sources.",
    chips: ["Pricing", "Docs"],
  },
  {
    stepNumber: 3,
    title: "Confidence has edges",
    line: "What's supported — and what isn't.",
    chips: ["Directional → Investment-ready"],
  },
  {
    stepNumber: 4,
    title: "A call you can defend",
    line: "What to do, why now, what could change.",
    chips: ["Risks", "Assumptions"],
  },
]

/**
 * DecisionThread - Thin connecting line behind steps
 */
function DecisionThread({
  stepCount,
  orientation = "horizontal",
}: {
  stepCount: number
  orientation?: "horizontal" | "vertical"
}) {
  const isHorizontal = orientation === "horizontal"

  return (
    <div
      className={cn(
        "absolute z-0",
        isHorizontal
          ? "top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-border-subtle"
          : "left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-border-subtle"
      )}
    />
  )
}

export function ValueSection() {
  return (
    <MarketingSection variant="default" id="value">
      <MarketingContainer maxWidth="6xl">
        {/* Desktop: Left header + Right horizontal progression */}
        <div className="hidden md:block mb-12 sm:mb-16 md:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-6 sm:gap-8 lg:gap-12 items-start">
            {/* Left: Section header (narrow) */}
            <Reveal>
              <div className="lg:sticky lg:top-24">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-3 sm:mb-4">
                  Decisions you can defend.
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-text-secondary mb-2">
                  When the room goes quiet and someone asks:
                  <br />"Why this—and why now?"
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Plinth makes evidence, confidence, and action explicit.
                </p>
              </div>
            </Reveal>

            {/* Right: Horizontal progression strip (wide) */}
            <div className="relative pt-8 pb-8">
              <DecisionThread
                stepCount={steps.length}
                orientation="horizontal"
              />

              <Stagger stagger={60} className="relative grid grid-cols-4 gap-6">
                {steps.map((step, index) => {
                  const isLast = index === steps.length - 1

                  return (
                    <div
                      key={index}
                      className={cn(
                        "relative flex flex-col",
                        // Slight contrast increase from step 1 → step 4
                        index === 0 && "opacity-90",
                        index === 1 && "opacity-95",
                        index === 2 && "opacity-100",
                        isLast && "opacity-100"
                      )}
                    >
                      {/* Step number */}
                      <div className="mb-3">
                        <span className="text-xs font-medium text-muted-foreground">
                          {step.stepNumber}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className={cn(
                          "text-base font-semibold mb-2",
                          isLast && "font-semibold"
                        )}
                      >
                        {step.title}
                      </h3>

                      {/* Line */}
                      <p className="text-sm text-text-secondary mb-3">
                        {step.line}
                      </p>

                      {/* Chips */}
                      {step.chips.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-auto">
                          {step.chips.map((chip, chipIndex) => (
                            <Badge
                              key={chipIndex}
                              variant="neutral"
                              className="text-xs font-normal border-border-subtle bg-muted/50"
                            >
                              {chip}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Final step accent edge */}
                      {isLast && (
                        <div className="absolute top-0 left-0 w-0.5 h-full bg-accent-primary/30" />
                      )}
                    </div>
                  )
                })}
              </Stagger>
            </div>
          </div>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="md:hidden mb-12 sm:mb-16">
          {/* Header */}
          <Reveal>
            <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary mb-3 sm:mb-4">
                Decisions you can defend.
              </h2>
              <p className="text-base sm:text-lg text-text-secondary mb-2">
                When the room goes quiet and someone asks:
                <br />"Why this—and why now?"
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Plinth makes evidence, confidence, and action explicit.
              </p>
            </div>
          </Reveal>

          {/* Vertical progression */}
          <div className="relative pt-8 pb-8">
            <DecisionThread
              stepCount={steps.length}
              orientation="vertical"
            />

            <Stagger stagger={60} className="relative space-y-8">
              {steps.map((step, index) => {
                const isLast = index === steps.length - 1

                return (
                  <div
                    key={index}
                    className={cn(
                      "relative pl-8 flex flex-col",
                      // Slight contrast increase from step 1 → step 4
                      index === 0 && "opacity-90",
                      index === 1 && "opacity-95",
                      index === 2 && "opacity-100",
                      isLast && "opacity-100"
                    )}
                  >
                    {/* Step number */}
                    <div className="mb-3">
                      <span className="text-xs font-medium text-muted-foreground">
                        {step.stepNumber}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className={cn(
                        "text-base font-semibold mb-2",
                        isLast && "font-semibold"
                      )}
                    >
                      {step.title}
                    </h3>

                    {/* Line */}
                    <p className="text-sm text-text-secondary mb-3">
                      {step.line}
                    </p>

                    {/* Chips */}
                    {step.chips.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {step.chips.map((chip, chipIndex) => (
                          <Badge
                            key={chipIndex}
                            variant="neutral"
                            className="text-xs font-normal border-border-subtle bg-muted/50"
                          >
                            {chip}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Final step accent edge */}
                    {isLast && (
                      <div className="absolute top-0 left-0 w-0.5 h-full bg-accent-primary/30" />
                    )}
                  </div>
                )
              })}
            </Stagger>
          </div>
        </div>

        {/* Closing line */}
        <Reveal delay={120}>
          <p className="text-sm text-muted-foreground text-center">
            Most tools optimize for insight.{" "}
            <span className="font-semibold text-text-secondary">
              Plinth optimizes for decision credibility.
            </span>
          </p>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}
