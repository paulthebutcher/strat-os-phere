/**
 * Differentiators Section
 * 
 * Enhanced with brand tokens for consistent styling and enterprise-grade appearance.
 */
import { X, Check } from "lucide-react"
import { brand } from "@/lib/ui/brand"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

export function Differentiators() {
  const mostTools = [
    "Summarize marketing pages",
    "Generate generic insights",
    "Lack evidence trail",
    "Don't force decisions",
  ]

  const plinth = [
    "Live market signals: pricing, changelogs, reviews, docs, jobs, status pages",
    "Evidence-backed with citations: full audit trail you can validate",
    "Deterministic scoring + explainers: repeatable, defensible",
    "Opinionated output formats: forces tradeoffs and clarity",
    "Built for senior strategy workflows: copyable artifacts ready for VP+ decisions",
  ]

  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-text-primary">
            Why Plinth vs generic research
          </h2>
        </div>
        <div className="mx-auto mt-20 grid gap-8 md:grid-cols-2 lg:max-w-5xl">
          <div className={cn("panel p-8 md:p-10 rounded-2xl shadow-sm ring-1 ring-black/5", brand.surface.base)}>
          <h3 className={cn("mb-8", brand.typeScale.subhead, "text-text-primary")}>
            Most tools
          </h3>
          <ul className="space-y-5">
            {mostTools.map((item, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full", brand.tone.bad.bg)}>
                  <X className={cn("h-4 w-4", brand.tone.bad.text)} />
                </div>
                <span className={cn(brand.typeScale.body, "text-text-secondary")}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={cn("panel border-2 border-accent-primary p-8 shadow-md md:p-10 rounded-2xl", brand.surface.base)}>
          <h3 className={cn("mb-8", brand.typeScale.subhead, "text-text-primary")}>
            Plinth
          </h3>
          <ul className="space-y-5">
            {plinth.map((item, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full", brand.tone.good.bg)}>
                  <Check className={cn("h-4 w-4", brand.tone.good.text)} />
                </div>
                <span className={cn(brand.typeScale.body, "text-text-secondary")}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

