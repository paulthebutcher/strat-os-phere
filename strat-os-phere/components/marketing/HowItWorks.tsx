/**
 * How It Works Section
 * 
 * Enhanced with brand tokens for consistent styling and enterprise-grade appearance.
 */
import { Target, Search, TrendingUp } from "lucide-react"
import { brand } from "@/lib/ui/brand"
import { cn } from "@/lib/utils"
import { WorkflowIllustration } from "@/components/graphics"

const iconMap = {
  target: Target,
  search: Search,
  trending: TrendingUp,
}

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Define market, target customer, competitors",
      description: "Set up your analysis by defining your market, target customer profile, and adding competitors by URL or name.",
      borderColor: "marketing-accent-border-indigo",
      gradient: "from-accent-primary to-accent-primary/80",
      icon: "target",
    },
    {
      number: "2",
      title: "Pull evidence from public sources (last 90 days)",
      description: "Automatically scans pricing pages, reviews, job postings, changelogs, and documentation from the last 90 days.",
      borderColor: "marketing-accent-border-teal",
      gradient: "from-[hsl(var(--marketing-accent-teal))] to-[hsl(var(--marketing-accent-teal)/0.8)]",
      icon: "search",
    },
    {
      number: "3",
      title: "Produce opportunities with confidence + citations",
      description: "Get ranked opportunities with confidence scores and full citations. Every insight is defensible and traceable.",
      borderColor: "marketing-accent-border-coral",
      gradient: "from-[hsl(var(--marketing-accent-coral))] to-[hsl(var(--marketing-accent-coral)/0.8)]",
      icon: "trending",
    },
  ]

  return (
    <section id="how-it-works" className={cn("mx-auto max-w-[1200px] px-4", brand.spacing.section)}>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className={cn(brand.typeScale.headline, "text-text-primary")}>
          How Plinth works in 3 steps
        </h2>
        <p className={cn("mt-4", brand.typeScale.body, "text-text-secondary")}>
          Everything is backed by evidence with citations you can validate
        </p>
      </div>
      <div className="mx-auto mt-20 max-w-5xl">
        {/* Workflow illustration above steps */}
        <div className="mb-12 flex justify-center">
          <div className="w-full max-w-md h-32 opacity-60">
            <WorkflowIllustration />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = iconMap[step.icon as keyof typeof iconMap]
            return (
              <div
                key={index}
                className={cn(
                  "panel",
                  step.borderColor,
                  "relative flex flex-col p-6 transition-all hover:shadow-lg hover:scale-105",
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
    </section>
  )
}

