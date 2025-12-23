import { DollarSign, Star, Briefcase, FileCode, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { brand } from "@/lib/ui/brand"
import { cn } from "@/lib/utils"
import { EvidenceConfidenceIllustration, Backdrop } from "@/components/graphics"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

const sourceTypes = [
  {
    icon: DollarSign,
    title: "Pricing",
    description: "Pricing pages and plans",
  },
  {
    icon: Star,
    title: "Reviews",
    description: "User reviews and ratings",
  },
  {
    icon: Briefcase,
    title: "Jobs",
    description: "Job postings and hiring",
  },
  {
    icon: FileCode,
    title: "Changelog",
    description: "Product updates and releases",
  },
  {
    icon: BookOpen,
    title: "Docs",
    description: "Documentation and guides",
  },
]

/**
 * Trust / Proof Band
 * 
 * "Evidence-backed, not vibes" section showing source types, recency, and confidence.
 */
export function Trust() {
  return (
    <MarketingSection id="trust" variant="muted" className="relative">
      <Backdrop variant="section" density="medium" />
      <MarketingContainer maxWidth="4xl" className="relative z-10">
        {/* Callout card with highlighted border */}
        <div className={cn(
          "panel relative overflow-hidden border-2 border-accent-primary/30",
          "bg-gradient-to-br from-accent-primary/5 via-surface to-surface",
          "p-8 md:p-12 shadow-lg"
        )}>
          {/* Evidence confidence illustration */}
          <div className="absolute top-8 right-8 w-32 h-24 opacity-30 pointer-events-none hidden md:block">
            <EvidenceConfidenceIllustration />
          </div>
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-text-primary">
              Evidence-backed, not vibes
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-text-secondary">
              Every opportunity is grounded in public evidence with full citations you can validate.
            </p>
          </div>
          
          {/* Source types grid */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {sourceTypes.map((source, index) => {
              const Icon = source.icon
              return (
                <div
                  key={index}
                  className={cn(
                    "panel p-4 text-center transition-all hover:shadow-md",
                    "bg-surface border border-border-subtle",
                    brand.surface.base
                  )}
                >
                  <div className="mb-3 flex justify-center">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-lg",
                      "bg-accent-primary/10"
                    )}>
                      <Icon className={cn("h-6 w-6", brand.primary.text)} />
                    </div>
                  </div>
                  <h3 className={cn("mb-1 text-sm font-semibold", "text-text-primary")}>
                    {source.title}
                  </h3>
                  <p className={cn("text-xs text-text-secondary")}>
                    {source.description}
                  </p>
                </div>
              )
            })}
          </div>
          
          {/* Recency and confidence info */}
          <div className="mt-10 space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="info" className="text-xs">
                  Evidence window: last 90 days (configurable)
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-xs">
                  Confidence increases with coverage + freshness
                </Badge>
              </div>
            </div>
            
            {/* Disclaimer */}
            <p className={cn(
              "mt-6 text-center text-xs italic",
              "text-text-muted"
            )}>
              Uses publicly available sources; may be incomplete.
            </p>
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

