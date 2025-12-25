/**
 * Value Section
 * 
 * "Decisions you can defend" - narrative progression from uncertainty to action.
 * Section id: #value
 */
"use client"

import { MarketingSection } from "../MarketingSection"
import { MarketingContainer } from "../MarketingContainer"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState } from "react"

const narrativePanels = [
  {
    eyebrow: "THE PROBLEM",
    title: "Insight doesn't survive scrutiny",
    description: "Most tools help you generate ideas.\nThe hard part is defending one when stakes are real.",
    microLine: "Plinth is built for scrutiny.",
    chips: [],
    visualTreatment: "fog", // Softer contrast, slight blur/noise texture, muted tone
  },
  {
    eyebrow: "EVIDENCE",
    title: "Receipts, not opinions",
    description: "Every claim is tied to sources you can open—pricing, docs, changelogs, reviews—so the \"why\" is inspectable.",
    chips: ["Pricing", "Docs", "Changelog", "Reviews"],
    visualTreatment: "sharpening", // Sharpens contrast, light dot-grid or citation-like motif
  },
  {
    eyebrow: "CONFIDENCE",
    title: "Confidence has edges",
    description: "Plinth makes the boundary explicit: what the evidence supports now, what it doesn't, and what would strengthen the call.",
    chips: ["Exploratory", "Directional", "Investment-ready"],
    visualTreatment: "structured", // Structured, calm, soft divider lines
  },
  {
    eyebrow: "ACTION",
    title: "A call you can stand behind",
    description: "Clear guidance on what to do, why now, and what could change the decision—before the decision changes you.",
    chips: ["Risks", "Assumptions", "What could change"],
    visualTreatment: "emphasized", // Highest contrast, slight emphasis (border, shadow, or glow)
  },
]

export function ValueSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <MarketingSection variant="default" id="value">
      <MarketingContainer maxWidth="6xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
            Decisions you can defend.
          </h2>
          <p className="text-lg md:text-xl text-text-secondary mb-2">
            When the room goes quiet and someone asks:
            <br className="hidden sm:inline" /> "Why this—and why now?"
          </p>
          <p className="text-sm text-muted-foreground">
            Plinth turns public market noise into evidence-bound calls—with explicit confidence boundaries.
          </p>
        </div>

        {/* Narrative progression - horizontal on desktop, vertical on mobile */}
        <div className="relative mb-16">
          {/* Connecting thread - desktop: horizontal, mobile: vertical */}
          {/* Desktop horizontal thread */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 z-0">
            <div className="h-full bg-gradient-to-r from-transparent via-accent-primary/10 via-accent-primary/20 to-accent-primary/30" />
          </div>
          
          {/* Mobile vertical thread */}
          <div className="md:hidden absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 z-0">
            <div className="h-full bg-gradient-to-b from-transparent via-accent-primary/10 via-accent-primary/20 to-accent-primary/30" />
          </div>

          {/* Milestone dots - desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 -translate-y-1/2 z-10">
            <div className="relative h-full">
              {narrativePanels.map((_, index) => {
                const cardWidth = 100 / narrativePanels.length
                const leftPercent = (index + 0.5) * cardWidth
                const isHovered = hoveredIndex === index
                return (
                  <div
                    key={index}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${leftPercent}%` }}
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

          {/* Milestone dots - mobile */}
          <div className="md:hidden absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-10">
            <div className="relative h-full">
              {narrativePanels.map((_, index) => {
                const cardHeight = 100 / narrativePanels.length
                const topPercent = (index + 0.5) * cardHeight
                const isHovered = hoveredIndex === index
                return (
                  <div
                    key={index}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ top: `${topPercent}%` }}
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

          {/* Brightened thread segment on hover - desktop */}
          {hoveredIndex !== null && (
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 z-[5] pointer-events-none">
              <div
                className="absolute h-full bg-accent-primary/40 transition-opacity duration-300"
                style={{
                  left: `${(hoveredIndex / narrativePanels.length) * 100}%`,
                  width: `${(1 / narrativePanels.length) * 100}%`,
                }}
              />
            </div>
          )}

          {/* Brightened thread segment on hover - mobile */}
          {hoveredIndex !== null && (
            <div className="md:hidden absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 z-[5] pointer-events-none">
              <div
                className="absolute w-full bg-accent-primary/40 transition-opacity duration-300"
                style={{
                  top: `${(hoveredIndex / narrativePanels.length) * 100}%`,
                  height: `${(1 / narrativePanels.length) * 100}%`,
                }}
              />
            </div>
          )}

          {/* Panels container */}
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
            {narrativePanels.map((panel, index) => {
              const isHovered = hoveredIndex === index
              
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
                    // Reduced padding for tighter layout
                    "p-5",
                    // Hover effects
                    isHovered && [
                      "md:-translate-y-1 md:shadow-lg",
                      "border-accent-primary/20",
                    ],
                    // Visual treatment based on panel type
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
                  )}
                >
                  {/* Panel-specific background treatments */}
                  {panel.visualTreatment === "fog" && (
                    <>
                      {/* Noise texture overlay */}
                      <div 
                        className="absolute inset-0 opacity-[0.015] pointer-events-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                      />
                      {/* Blur effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-[0.5px] pointer-events-none" />
                    </>
                  )}
                  
                  {panel.visualTreatment === "sharpening" && (
                    <div 
                      className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none"
                      style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                        backgroundSize: '20px 20px',
                      }}
                    />
                  )}
                  
                  {panel.visualTreatment === "structured" && (
                    <>
                      {/* Soft divider lines */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
                    </>
                  )}
                  
                  {panel.visualTreatment === "emphasized" && (
                    <>
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent-primary/40 via-accent-primary/30 to-accent-primary/20" />
                      {/* Gentle glow on hover */}
                      {isHovered && (
                        <div className="absolute inset-0 ring-2 ring-accent-primary/10 rounded-xl pointer-events-none" />
                      )}
                    </>
                  )}

                  {/* Content */}
                  <div className="relative">
                    {/* Eyebrow */}
                    <div className="mb-2.5">
                      <span className={cn(
                        "text-xs font-medium uppercase tracking-wide",
                        panel.visualTreatment === "fog" && "text-muted-foreground/70",
                        panel.visualTreatment !== "fog" && "text-muted-foreground"
                      )}>
                        {panel.eyebrow}
                      </span>
                    </div>
                    
                    {/* Title - slightly larger for better hierarchy */}
                    <h3 className={cn(
                      "text-xl font-semibold mb-2.5",
                      panel.visualTreatment === "fog" && "text-text-primary/80",
                      panel.visualTreatment === "emphasized" && "text-text-primary",
                      panel.visualTreatment !== "fog" && panel.visualTreatment !== "emphasized" && "text-text-primary"
                    )}>
                      {panel.title}
                    </h3>
                    
                    {/* Description - slightly smaller */}
                    <p className={cn(
                      "text-sm leading-relaxed mb-3",
                      panel.visualTreatment === "fog" && "text-text-secondary/80",
                      panel.visualTreatment === "emphasized" && "text-text-secondary",
                      panel.visualTreatment !== "fog" && panel.visualTreatment !== "emphasized" && "text-text-secondary"
                    )}>
                      {panel.description.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < panel.description.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>

                    {/* Micro-line for Card 1 */}
                    {panel.microLine && (
                      <p className="text-xs text-muted-foreground mb-3 italic">
                        {panel.microLine}
                      </p>
                    )}
                    
                    {/* Chips - more visible on hover */}
                    {panel.chips.length > 0 && (
                      <div className={cn(
                        "flex flex-wrap gap-2 transition-opacity duration-300",
                        isHovered ? "opacity-100" : "opacity-70"
                      )}>
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
          </div>
        </div>
        
        {/* Closing line */}
        <p className="text-sm text-muted-foreground text-center">
          Most tools optimize for insight.{" "}
          <span className="font-semibold text-text-secondary">Plinth optimizes for decision credibility.</span>
        </p>
      </MarketingContainer>
    </MarketingSection>
  )
}
