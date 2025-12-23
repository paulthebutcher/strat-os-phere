import { Briefcase, Palette, Target } from "lucide-react"
import { brand } from "@/lib/ui/brand"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

const personas = [
  {
    icon: Briefcase,
    title: "VP Product",
    description: "Portfolio decisions, differentiation bets, competitive repositioning. Decision-ready outputs you can defend in executive reviews.",
    borderColor: "marketing-accent-border-indigo",
    iconColor: "text-accent-primary",
    iconBg: "bg-accent-primary/10",
  },
  {
    icon: Palette,
    title: "VP UX/Design",
    description: "Pricing strategy discovery, positioning clarity, strategic bets. Evidence-backed insights for design and experience decisions.",
    borderColor: "marketing-accent-border-coral",
    iconColor: "text-[hsl(var(--marketing-accent-coral))]",
    iconBg: "bg-[hsl(var(--marketing-accent-coral)/0.1)]",
  },
  {
    icon: Target,
    title: "Strategy/Insights",
    description: "What to say no to, where to differentiate, evidence-backed decisions. Strategic bets with full evidence trail.",
    borderColor: "marketing-accent-border-teal",
    iconColor: "text-[hsl(var(--marketing-accent-teal))]",
    iconBg: "bg-[hsl(var(--marketing-accent-teal)/0.1)]",
  },
]

/**
 * Who It's For Section
 * 
 * Enhanced with brand tokens for consistent styling and enterprise-grade appearance.
 */
export function WhoItsFor() {
  return (
    <MarketingSection variant="default">
      <MarketingContainer maxWidth="7xl">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-text-primary">
            Who it's for
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-text-secondary max-w-prose mx-auto">
            Built for senior Product/UX strategy professionals who need decision-ready outputs, not research summaries.
          </p>
        </div>
        <div className="mt-20 grid gap-6 md:grid-cols-3">
        {personas.map((persona, index) => {
          const Icon = persona.icon
          return (
            <div
              key={index}
              className={cn(
                "panel",
                persona.borderColor,
                "relative flex flex-col p-8 transition-all hover:shadow-lg hover:scale-105 rounded-2xl shadow-sm ring-1 ring-black/5",
                brand.surface.base
              )}
            >
              <div className="mb-6 flex justify-center">
                <div className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-xl shadow-sm",
                  persona.iconBg,
                  persona.iconColor
                )}>
                  <Icon className="h-8 w-8" />
                </div>
              </div>
              <h3 className={cn("mb-4", brand.typeScale.subhead, "text-text-primary")}>
                {persona.title}
              </h3>
              <p className={cn("text-sm leading-relaxed text-text-secondary md:text-base")}>
                {persona.description}
              </p>
            </div>
          )
        })}
      </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

