/**
 * What You Get / Deliverables Section
 * 
 * Enhanced with brand tokens for consistent styling and enterprise-grade appearance.
 */
import { Target, Lightbulb, TrendingUp, FileText } from "lucide-react"
import { brand } from "@/lib/ui/brand"
import { cn } from "@/lib/utils"
import { OpportunitiesIllustration, Backdrop } from "@/components/graphics"

const outputs = [
  {
    id: "opportunities",
    title: "Top opportunities (ranked)",
    description: "Ranked differentiation opportunities with scores and confidence levels. Each opportunity includes why it matters and next steps.",
    icon: TrendingUp,
    borderColor: "marketing-accent-border-coral",
    iconColor: "text-[hsl(var(--marketing-accent-coral))]",
    iconBg: "bg-[hsl(var(--marketing-accent-coral)/0.1)]",
  },
  {
    id: "evidence",
    title: "Defensible evidence pack (citations)",
    description: "Every insight includes citations to public sources you can validate. Full audit trail with source types and recency.",
    icon: FileText,
    borderColor: "marketing-accent-border-indigo",
    iconColor: "text-accent-primary",
    iconBg: "bg-accent-primary/10",
  },
  {
    id: "strategic-bets",
    title: "Strategic bets + next steps",
    description: "What to say no to and why competitors won't easily follow. Includes first experiments you can run to validate.",
    icon: Target,
    borderColor: "marketing-accent-border-purple",
    iconColor: "text-[hsl(var(--marketing-gradient-end))]",
    iconBg: "bg-[hsl(var(--marketing-gradient-end)/0.1)]",
  },
  {
    id: "positioning",
    title: "Copy-ready positioning angles",
    description: "Ready-to-use positioning statements and differentiation angles backed by evidence. Export and use in your strategy work.",
    icon: Lightbulb,
    borderColor: "marketing-accent-border-teal",
    iconColor: "text-[hsl(var(--marketing-accent-teal))]",
    iconBg: "bg-[hsl(var(--marketing-accent-teal)/0.1)]",
  },
]

export function Outputs() {
  return (
    <section id="outputs" className={cn("mx-auto max-w-[1200px] px-4 relative", brand.spacing.section)}>
      <Backdrop variant="section" density="subtle" />
      <div className="mx-auto max-w-3xl text-center relative z-10">
        <h2 className={cn(brand.typeScale.headline, "text-text-primary")}>
          What you get
        </h2>
        <p className={cn("mt-6", brand.typeScale.bodyLarge, "text-text-secondary")}>
          Everything is copyable, exportable, and ready to use in your strategy work. No buzzwords—just actionable insights backed by evidence.
        </p>
      </div>
      <div className="mt-20 relative z-10">
        {/* Opportunities illustration for opportunities card */}
        <div className="grid gap-6 md:grid-cols-2">
          {outputs.map((output) => {
            const Icon = output.icon
            const isOpportunities = output.id === "opportunities"
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
                {isOpportunities && (
                  <div className="absolute top-4 right-4 w-24 h-16 opacity-20 pointer-events-none">
                    <OpportunitiesIllustration />
                  </div>
                )}
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

