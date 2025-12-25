/**
 * Value Section
 * 
 * "Decisions you can defend" - narrative progression from uncertainty to action.
 * Section id: #value
 * 
 * Layout: Left header + right sequence rail (desktop) | Stacked (mobile)
 */
"use client"

import { MarketingSection } from "../MarketingSection"
import { MarketingContainer } from "../MarketingContainer"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState, useEffect, useRef } from "react"
import { Reveal, Stagger } from "../motion"
import { prefersReducedMotion } from "@/lib/motion/tokens"

const narrativePanels = [
  {
    eyebrow: "THE PROBLEM",
    title: "Ideas don't survive scrutiny",
    description: "Most tools generate options.\nThe hard part is defending one when stakes are real.",
    microLine: "Plinth is built for scrutiny.",
    chips: [],
    visualTreatment: "fog", // Softer contrast, muted tone
  },
  {
    eyebrow: "EVIDENCE",
    title: "Receipts, not opinions",
    description: "Every claim links to sources you can open—pricing, docs, changelogs, reviews—so the \"why\" is inspectable.",
    chips: ["Pricing", "Docs", "Changelog", "Reviews"],
    visualTreatment: "sharpening", // Light dot-grid/citation motif
  },
  {
    eyebrow: "CONFIDENCE",
    title: "Confidence has edges",
    description: "Plinth makes the boundary explicit: what the evidence supports now, what it doesn't, and what would strengthen the call.",
    chips: ["Exploratory → Directional → Investment-ready"],
    visualTreatment: "structured", // Thin rules / edge markers
  },
  {
    eyebrow: "ACTION",
    title: "A call you can stand behind",
    description: "Clear guidance on what to do, why now, and what could change the decision—before the decision changes you.",
    chips: ["Risks", "Assumptions", "What could change"],
    visualTreatment: "emphasized", // Crispest, most resolved
  },
]

/**
 * DecisionThread - Background connecting thread with milestone dots
 */
function DecisionThread({
  stepCount,
  hoveredIndex,
  orientation = "horizontal",
}: {
  stepCount: number
  hoveredIndex: number | null
  orientation?: "horizontal" | "vertical"
}) {
  const isHorizontal = orientation === "horizontal"
  const reduceMotion = useRef(false)

  useEffect(() => {
    reduceMotion.current = prefersReducedMotion()
  }, [])

  return (
    <>
      {/* Base thread line */}
      <div
        className={cn(
          "absolute z-0",
          isHorizontal
            ? "top-1/2 left-0 right-0 h-px -translate-y-1/2"
            : "left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
        )}
      >
        <Reveal y={0} delay={60} as="div">
          <div
            className={cn(
              "h-full bg-gradient-to-r from-transparent via-accent-primary/10 via-accent-primary/20 to-accent-primary/30",
              !isHorizontal &&
                "bg-gradient-to-b from-transparent via-accent-primary/10 via-accent-primary/20 to-accent-primary/30"
            )}
          />
        </Reveal>
      </div>

      {/* Milestone dots */}
      <div
        className={cn(
          "absolute z-10",
          isHorizontal
            ? "top-1/2 left-0 right-0 -translate-y-1/2"
            : "left-1/2 top-0 bottom-0 -translate-x-1/2"
        )}
      >
        <div className="relative h-full w-full">
          {narrativePanels.map((_, index) => {
            const isHovered = hoveredIndex === index
            const position = isHorizontal
              ? { left: `${((index + 0.5) / stepCount) * 100}%` }
              : { top: `${((index + 0.5) / stepCount) * 100}%` }

            return (
              <div
                key={index}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2",
                  !isHorizontal && "-translate-x-1/2 -translate-y-1/2"
                )}
                style={position}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    isHovered
                      ? "bg-accent-primary/60 scale-125"
                      : "bg-accent-primary/20"
                  )}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Brightened thread segment on hover */}
      {hoveredIndex !== null && !reduceMotion.current && (
        <div
          className={cn(
            "absolute z-[5] pointer-events-none transition-opacity duration-300",
            isHorizontal
              ? "top-1/2 left-0 right-0 h-px -translate-y-1/2"
              : "left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
          )}
        >
          <div
            className={cn(
              "absolute bg-accent-primary/40 transition-opacity duration-300",
              isHorizontal ? "h-full" : "w-full"
            )}
            style={
              isHorizontal
                ? {
                    left: `${(hoveredIndex / stepCount) * 100}%`,
                    width: `${(1 / stepCount) * 100}%`,
                  }
                : {
                    top: `${(hoveredIndex / stepCount) * 100}%`,
                    height: `${(1 / stepCount) * 100}%`,
                  }
            }
          />
        </div>
      )}
    </>
  )
}

export function ValueSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const reduceMotion = useRef(false)

  useEffect(() => {
    reduceMotion.current = prefersReducedMotion()
  }, [])

  return (
    <MarketingSection variant="default" id="value">
      <MarketingContainer maxWidth="6xl">
        {/* Desktop: Left header + Right horizontal sequence rail */}
        <div className="hidden md:block mb-16 md:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left: Section header */}
            <Reveal>
              <div className="lg:sticky lg:top-24">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
                  Decisions you can defend.
                </h2>
                <p className="text-lg md:text-xl text-text-secondary mb-2">
                  When the room goes quiet and someone asks:
                  <br />"Why this—and why now?"
                </p>
                <p className="text-sm text-muted-foreground">
                  Plinth turns public market noise into evidence-bound calls—with explicit confidence boundaries.
                </p>
              </div>
            </Reveal>

            {/* Right: Horizontal sequence rail */}
            <div className="relative">
              <DecisionThread
                stepCount={narrativePanels.length}
                hoveredIndex={hoveredIndex}
                orientation="horizontal"
              />

              <Stagger stagger={60} className="relative grid grid-cols-4 gap-4">
                {narrativePanels.map((panel, index) => {
                  const isHovered = hoveredIndex === index
                  const isLast = index === narrativePanels.length - 1

                  return (
                    <div
                      key={index}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className={cn(
                        "relative bg-white rounded-xl border",
                        "transition-all duration-300",
                        "overflow-hidden",
                        "group",
                        "p-5",
                        // Hover lift (disabled for reduced motion)
                        !reduceMotion.current &&
                          "hover:-translate-y-1 hover:shadow-md",
                        // Visual progression based on step
                        panel.visualTreatment === "fog" && [
                          "border-border-subtle/50",
                          "shadow-sm",
                          !isHovered && "opacity-90",
                        ],
                        panel.visualTreatment === "sharpening" && [
                          "border-border-subtle",
                          "shadow-sm",
                        ],
                        panel.visualTreatment === "structured" && [
                          "border-border-subtle",
                          "shadow-sm",
                        ],
                        panel.visualTreatment === "emphasized" && [
                          "border-accent-primary/30",
                          "shadow-md",
                          "ring-1 ring-accent-primary/10",
                        ],
                        // Hover border change
                        isHovered && "border-accent-primary/20",
                        // Last step emphasis
                        isLast && "border-accent-primary/30"
                      )}
                    >
                      {/* Step 1: Fog background */}
                      {panel.visualTreatment === "fog" && (
                        <>
                          <div
                            className="absolute inset-0 opacity-[0.015] pointer-events-none"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-[0.5px] pointer-events-none" />
                        </>
                      )}

                      {/* Step 2: Dot-grid/citation motif */}
                      {panel.visualTreatment === "sharpening" && (
                        <div
                          className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none"
                          style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                            backgroundSize: "20px 20px",
                          }}
                        />
                      )}

                      {/* Step 3: Structured boundaries */}
                      {panel.visualTreatment === "structured" && (
                        <>
                          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
                          <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border-subtle to-transparent" />
                          <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border-subtle to-transparent" />
                        </>
                      )}

                      {/* Step 4: Crisp resolution */}
                      {panel.visualTreatment === "emphasized" && (
                        <>
                          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent-primary/40 via-accent-primary/30 to-accent-primary/20" />
                          {isHovered && (
                            <div className="absolute inset-0 ring-2 ring-accent-primary/10 rounded-xl pointer-events-none" />
                          )}
                        </>
                      )}

                      {/* Content */}
                      <div className="relative">
                        {/* Eyebrow */}
                        <div className="mb-2.5">
                          <span
                            className={cn(
                              "text-xs font-medium uppercase tracking-wide",
                              panel.visualTreatment === "fog" &&
                                "text-muted-foreground/70",
                              panel.visualTreatment !== "fog" &&
                                "text-muted-foreground"
                            )}
                          >
                            {panel.eyebrow}
                          </span>
                        </div>

                        {/* Title */}
                        <h3
                          className={cn(
                            "text-xl font-semibold mb-2.5",
                            panel.visualTreatment === "fog" &&
                              "text-text-primary/80",
                            panel.visualTreatment === "emphasized" &&
                              "text-text-primary",
                            panel.visualTreatment !== "fog" &&
                              panel.visualTreatment !== "emphasized" &&
                              "text-text-primary"
                          )}
                        >
                          {panel.title}
                        </h3>

                        {/* Description */}
                        <p
                          className={cn(
                            "text-sm leading-relaxed mb-3",
                            panel.visualTreatment === "fog" &&
                              "text-text-secondary/80",
                            panel.visualTreatment === "emphasized" &&
                              "text-text-secondary",
                            panel.visualTreatment !== "fog" &&
                              panel.visualTreatment !== "emphasized" &&
                              "text-text-secondary"
                          )}
                        >
                          {panel.description
                            .split("\n")
                            .map((line, i, arr) => (
                              <span key={i}>
                                {line}
                                {i < arr.length - 1 && <br />}
                              </span>
                            ))}
                        </p>

                        {/* Micro-line for Step 1 */}
                        {panel.microLine && (
                          <p className="text-xs text-muted-foreground mb-3 italic">
                            {panel.microLine}
                          </p>
                        )}

                        {/* Chips - subtle contrast increase on hover */}
                        {panel.chips.length > 0 && (
                          <div
                            className={cn(
                              "flex flex-wrap gap-2 transition-opacity duration-300",
                              isHovered ? "opacity-100" : "opacity-70"
                            )}
                          >
                            {panel.chips.map((chip, chipIndex) => (
                              <Badge
                                key={chipIndex}
                                variant="neutral"
                                className={cn(
                                  "text-xs font-normal border-border-subtle",
                                  panel.visualTreatment === "emphasized"
                                    ? "bg-muted border-border-subtle"
                                    : "bg-muted/50"
                                )}
                              >
                                {chip}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </Stagger>
            </div>
          </div>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="md:hidden mb-16">
          {/* Header */}
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold tracking-tight text-text-primary mb-4">
                Decisions you can defend.
              </h2>
              <p className="text-lg text-text-secondary mb-2">
                When the room goes quiet and someone asks:
                <br />"Why this—and why now?"
              </p>
              <p className="text-sm text-muted-foreground">
                Plinth turns public market noise into evidence-bound calls—with explicit confidence boundaries.
              </p>
            </div>
          </Reveal>

          {/* Sequence rail */}
          <div className="relative">
            <DecisionThread
              stepCount={narrativePanels.length}
              hoveredIndex={hoveredIndex}
              orientation="vertical"
            />

            <Stagger stagger={60} className="relative space-y-6">
              {narrativePanels.map((panel, index) => {
                const isHovered = hoveredIndex === index
                const isLast = index === narrativePanels.length - 1

                return (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={cn(
                      "relative bg-white rounded-xl border",
                      "transition-all duration-300",
                      "overflow-hidden",
                      "group",
                      "p-5",
                      // Hover lift (disabled for reduced motion)
                      !reduceMotion.current &&
                        "hover:-translate-y-1 hover:shadow-md",
                      // Visual progression
                      panel.visualTreatment === "fog" && [
                        "border-border-subtle/50",
                        "shadow-sm",
                        !isHovered && "opacity-90",
                      ],
                      panel.visualTreatment === "sharpening" && [
                        "border-border-subtle",
                        "shadow-sm",
                      ],
                      panel.visualTreatment === "structured" && [
                        "border-border-subtle",
                        "shadow-sm",
                      ],
                      panel.visualTreatment === "emphasized" && [
                        "border-accent-primary/30",
                        "shadow-md",
                        "ring-1 ring-accent-primary/10",
                      ],
                      isHovered && "border-accent-primary/20",
                      isLast && "border-accent-primary/30"
                    )}
                  >
                    {/* Same visual treatments as desktop */}
                    {panel.visualTreatment === "fog" && (
                      <>
                        <div
                          className="absolute inset-0 opacity-[0.015] pointer-events-none"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-[0.5px] pointer-events-none" />
                      </>
                    )}

                    {panel.visualTreatment === "sharpening" && (
                      <div
                        className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none"
                        style={{
                          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                          backgroundSize: "20px 20px",
                        }}
                      />
                    )}

                    {panel.visualTreatment === "structured" && (
                      <>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
                        <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border-subtle to-transparent" />
                        <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border-subtle to-transparent" />
                      </>
                    )}

                    {panel.visualTreatment === "emphasized" && (
                      <>
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent-primary/40 via-accent-primary/30 to-accent-primary/20" />
                        {isHovered && (
                          <div className="absolute inset-0 ring-2 ring-accent-primary/10 rounded-xl pointer-events-none" />
                        )}
                      </>
                    )}

                    <div className="relative">
                      <div className="mb-2.5">
                        <span
                          className={cn(
                            "text-xs font-medium uppercase tracking-wide",
                            panel.visualTreatment === "fog" &&
                              "text-muted-foreground/70",
                            panel.visualTreatment !== "fog" &&
                              "text-muted-foreground"
                          )}
                        >
                          {panel.eyebrow}
                        </span>
                      </div>

                      <h3
                        className={cn(
                          "text-xl font-semibold mb-2.5",
                          panel.visualTreatment === "fog" &&
                            "text-text-primary/80",
                          panel.visualTreatment === "emphasized" &&
                            "text-text-primary",
                          panel.visualTreatment !== "fog" &&
                            panel.visualTreatment !== "emphasized" &&
                            "text-text-primary"
                        )}
                      >
                        {panel.title}
                      </h3>

                      <p
                        className={cn(
                          "text-sm leading-relaxed mb-3",
                          panel.visualTreatment === "fog" &&
                            "text-text-secondary/80",
                          panel.visualTreatment === "emphasized" &&
                            "text-text-secondary",
                          panel.visualTreatment !== "fog" &&
                            panel.visualTreatment !== "emphasized" &&
                            "text-text-secondary"
                        )}
                      >
                        {panel.description
                          .split("\n")
                          .map((line, i, arr) => (
                            <span key={i}>
                              {line}
                              {i < arr.length - 1 && <br />}
                            </span>
                          ))}
                      </p>

                      {panel.microLine && (
                        <p className="text-xs text-muted-foreground mb-3 italic">
                          {panel.microLine}
                        </p>
                      )}

                      {panel.chips.length > 0 && (
                        <div
                          className={cn(
                            "flex flex-wrap gap-2 transition-opacity duration-300",
                            isHovered ? "opacity-100" : "opacity-70"
                          )}
                        >
                          {panel.chips.map((chip, chipIndex) => (
                            <Badge
                              key={chipIndex}
                              variant="neutral"
                              className={cn(
                                "text-xs font-normal border-border-subtle",
                                panel.visualTreatment === "emphasized"
                                  ? "bg-muted border-border-subtle"
                                  : "bg-muted/50"
                              )}
                            >
                              {chip}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
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
