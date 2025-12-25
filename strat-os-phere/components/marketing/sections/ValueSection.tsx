/**
 * Value Section
 * 
 * "Decisions you can defend" - narrative progression from uncertainty to action.
 * Section id: #value
 */
import { MarketingSection } from "../MarketingSection"
import { MarketingContainer } from "../MarketingContainer"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const narrativePanels = [
  {
    eyebrow: "THE PROBLEM",
    title: "Interesting isn't enough",
    description: "Most strategy tools generate ideas. But when real money, people, or reputation are on the line, ideas aren't the hard part. Defensibility is.",
    chips: [],
    visualTreatment: "fog", // Softer contrast, slight blur/noise texture, muted tone
  },
  {
    eyebrow: "EVIDENCE",
    title: "Claims you can point to",
    description: "Plinth grounds every opportunity in public signals—pricing, docs, changelogs, reviews—so the \"why\" is inspectable, not implied.",
    chips: ["Pricing", "Docs", "Changelog", "Reviews"],
    visualTreatment: "sharpening", // Sharpens contrast, light dot-grid or citation-like motif
  },
  {
    eyebrow: "CONFIDENCE",
    title: "Boundaries, not bravado",
    description: "Every recommendation makes clear what the evidence supports today—and what would need to change to support a stronger call.",
    chips: ["Exploratory", "Directional", "Investment-ready"],
    visualTreatment: "structured", // Structured, calm, soft divider lines
  },
  {
    eyebrow: "ACTION",
    title: "What to do. Why now.",
    description: "Clear guidance on action, timing, and the assumptions that could invalidate the decision—before they invalidate you.",
    chips: ["Risks", "Assumptions", "What could change"],
    visualTreatment: "emphasized", // Highest contrast, slight emphasis (border, shadow, or glow)
  },
]

export function ValueSection() {
  return (
    <MarketingSection variant="default" id="value">
      <MarketingContainer maxWidth="6xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
            Decisions you can defend.
          </h2>
          <p className="text-lg md:text-xl text-text-secondary mb-2">
            When a room goes quiet and someone asks,
            <br className="hidden sm:inline" /> "Why this — and why now?"
          </p>
          <p className="text-sm text-muted-foreground">
            Plinth is built for that moment.
          </p>
        </div>

        {/* Narrative progression - horizontal on desktop, vertical on mobile */}
        <div className="relative mb-16">
          {/* Focus line - runs through all panels, starts faint, ends crisp */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 z-0">
            <div className="h-full bg-gradient-to-r from-transparent via-accent-primary/20 via-accent-primary/40 to-accent-primary/60" />
          </div>

          {/* Panels container */}
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
            {narrativePanels.map((panel, index) => {
              const isFirst = index === 0
              const isLast = index === narrativePanels.length - 1
              
              return (
                <div
                  key={index}
                  className={cn(
                    "relative bg-white rounded-xl border p-6",
                    "transition-all duration-300",
                    "overflow-hidden",
                    // Visual treatment based on panel type
                    panel.visualTreatment === "fog" && [
                      "border-border-subtle/50 opacity-90",
                      "shadow-sm",
                    ],
                    panel.visualTreatment === "sharpening" && [
                      "border-border-subtle shadow-sm",
                    ],
                    panel.visualTreatment === "structured" && [
                      "border-border-subtle shadow-sm",
                    ],
                    panel.visualTreatment === "emphasized" && [
                      "border-accent-primary/30 shadow-md",
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
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent-primary/40 via-accent-primary/30 to-accent-primary/20" />
                  )}

                  {/* Content */}
                  <div className="relative">
                    {/* Eyebrow */}
                    <div className="mb-3">
                      <span className={cn(
                        "text-xs font-medium uppercase tracking-wide",
                        panel.visualTreatment === "fog" && "text-muted-foreground/70",
                        panel.visualTreatment !== "fog" && "text-muted-foreground"
                      )}>
                        {panel.eyebrow}
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h3 className={cn(
                      "text-lg font-semibold mb-3",
                      panel.visualTreatment === "fog" && "text-text-primary/80",
                      panel.visualTreatment === "emphasized" && "text-text-primary",
                      panel.visualTreatment !== "fog" && panel.visualTreatment !== "emphasized" && "text-text-primary"
                    )}>
                      {panel.title}
                    </h3>
                    
                    {/* Description */}
                    <p className={cn(
                      "text-sm leading-relaxed mb-4",
                      panel.visualTreatment === "fog" && "text-text-secondary/80",
                      panel.visualTreatment === "emphasized" && "text-text-secondary",
                      panel.visualTreatment !== "fog" && panel.visualTreatment !== "emphasized" && "text-text-secondary"
                    )}>
                      {panel.description}
                    </p>
                    
                    {/* Chips - only show for panels 2, 3, 4 */}
                    {panel.chips.length > 0 && (
                      <div className="flex flex-wrap gap-2">
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

                  {/* Panel number indicator (mobile only) */}
                  <div className="md:hidden absolute top-4 right-4 w-6 h-6 rounded-full bg-muted/50 border border-border-subtle flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Closing line */}
        <p className="text-sm text-muted-foreground text-center">
          Most tools optimize for insight.
          <br className="sm:hidden" /> Plinth optimizes for decision credibility.
        </p>
      </MarketingContainer>
    </MarketingSection>
  )
}

