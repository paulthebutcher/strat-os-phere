/**
 * Outputs Section
 * 
 * Enhanced with brand tokens for consistent styling and enterprise-grade appearance.
 */
import { Target, BarChart3, Lightbulb, TrendingUp, FileText } from "lucide-react"
import { brand } from "@/lib/ui/brand"
import { cn } from "@/lib/utils"

const outputs = [
  {
    id: "opportunities",
    title: "Opportunities",
    description: "Ranked differentiation opportunities with first experiments you can run. Grounded in evidence, not assumptions.",
    icon: Lightbulb,
    borderColor: "marketing-accent-border-coral",
    iconColor: "text-[hsl(var(--marketing-accent-coral))]",
    iconBg: "bg-[hsl(var(--marketing-accent-coral)/0.1)]",
  },
  {
    id: "scorecard",
    title: "Scorecard",
    description: "Weighted scorecard across competitors with visual bar chart. See where you win, where you lag, and where gaps exist.",
    icon: BarChart3,
    borderColor: "marketing-accent-border-indigo",
    iconColor: "text-accent-primary",
    iconBg: "bg-accent-primary/10",
  },
  {
    id: "strategic-bets",
    title: "Strategic Bets",
    description: "Decision forcing function: what to say no to, and why competitors won't easily follow. Forces tradeoffs and creates clarity.",
    icon: TrendingUp,
    borderColor: "marketing-accent-border-purple",
    iconColor: "text-[hsl(var(--marketing-gradient-end))]",
    iconBg: "bg-[hsl(var(--marketing-gradient-end)/0.1)]",
  },
  {
    id: "jobs-to-be-done",
    title: "Jobs-to-be-Done",
    description: "Specific jobs customers need done, scored by frequency and dissatisfaction. Each job includes an opportunity score you can act on.",
    icon: Target,
    borderColor: "marketing-accent-border-teal",
    iconColor: "text-[hsl(var(--marketing-accent-teal))]",
    iconBg: "bg-[hsl(var(--marketing-accent-teal)/0.1)]",
  },
  {
    id: "evidence",
    title: "Evidence & Citations",
    description: "Every output includes citations to public sources: pricing pages, changelogs, reviews, docs, jobs, status pages. Full audit trail.",
    icon: FileText,
    borderColor: "marketing-accent-border-indigo",
    iconColor: "text-accent-primary",
    iconBg: "bg-accent-primary/10",
  },
]

export function Outputs() {
  return (
    <section id="outputs" className={cn("mx-auto max-w-[1200px] px-4", brand.spacing.section)}>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className={cn(brand.typeScale.headline, "text-text-primary")}>
          What you get
        </h2>
        <p className={cn("mt-6", brand.typeScale.bodyLarge, "text-text-secondary")}>
          Everything is copyable, exportable, and ready to use in your strategy work. No buzzwords—just actionable insights.
        </p>
      </div>
      <div className="mt-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {outputs.map((output) => {
            const Icon = output.icon
            return (
              <div
                key={output.id}
                className={cn(
                  "panel",
                  output.borderColor,
                  "relative flex flex-col p-6 transition-all hover:shadow-lg hover:scale-105",
                  brand.surface.base
                )}
              >
                <div className="mb-4 flex shrink-0">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg",
                    output.iconBg,
                    output.iconColor
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className={cn("mb-3", brand.typeScale.subhead, "text-text-primary")}>
                  {output.title}
                </h3>
                <p className={cn("text-sm leading-relaxed text-text-secondary md:text-base")}>
                  {output.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

