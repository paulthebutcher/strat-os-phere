/**
 * How It Works Section
 * 
 * Enhanced with brand tokens for consistent styling and enterprise-grade appearance.
 */
import { Target, Search, TrendingUp } from "lucide-react"
import { brand } from "@/lib/ui/brand"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

const iconMap = {
  target: Target,
  search: Search,
  trending: TrendingUp,
}

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Describe the decision",
      description: "Write what you're deciding. We infer what to research.",
      borderColor: "marketing-accent-border-indigo",
      gradient: "from-accent-primary to-accent-primary/80",
      icon: "target",
    },
    {
      number: "2",
      title: "We gather evidence",
      description: "We pull credible signals across sources and organize them by type.",
      borderColor: "marketing-accent-border-teal",
      gradient: "from-[hsl(var(--marketing-accent-teal))] to-[hsl(var(--marketing-accent-teal)/0.8)]",
      icon: "search",
    },
    {
      number: "3",
      title: "Get ranked opportunities",
      description: "You get prioritized moves + why they matter + citations.",
      borderColor: "marketing-accent-border-coral",
      gradient: "from-[hsl(var(--marketing-accent-coral))] to-[hsl(var(--marketing-accent-coral)/0.8)]",
      icon: "trending",
    },
  ]

  return (
    <MarketingSection id="how-it-works" variant="default">
      <MarketingContainer maxWidth="7xl">
        <div className="mx-auto max-w-3xl text-center space-y-4 mb-16">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-text-primary">
            How it works
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-text-secondary">
            Everything is backed by evidence with citations you can validate
          </p>
        </div>
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = iconMap[step.icon as keyof typeof iconMap]
              return (
                <div
                  key={index}
                  className={cn(
                    "panel",
                    step.borderColor,
                    "relative flex flex-col p-6 transition-all hover:shadow-lg hover:scale-105 rounded-2xl shadow-sm ring-1 ring-black/5",
                    brand.surface.base
                  )}
                >
                  <div className="mb-4 flex shrink-0">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br",
                      step.gradient,
                      "text-white shadow-md"
                    )}>
                      {Icon && <Icon className="h-6 w-6" />}
                    </div>
                  </div>
                  <h3 className={cn("mb-3", brand.typeScale.subhead, "text-text-primary")}>
                    {step.title}
                  </h3>
                  <p className={cn("text-sm leading-relaxed text-text-secondary md:text-base")}>
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

