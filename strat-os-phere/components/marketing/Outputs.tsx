/**
 * What You Get / Deliverables Section
 * 
 * Enhanced with brand tokens for consistent styling and enterprise-grade appearance.
 */
import Link from "next/link"
import { Target, Lightbulb, TrendingUp, FileText } from "lucide-react"
import { brand } from "@/lib/ui/brand"
import { cn } from "@/lib/utils"
import { OpportunitiesIllustration, Backdrop } from "@/components/graphics"
import { Button } from "@/components/ui/button"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

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
    <MarketingSection id="outputs" variant="default" className="relative">
      <Backdrop variant="section" density="subtle" />
      <MarketingContainer maxWidth="7xl" className="relative z-10">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-text-primary">
            What you'll walk away with
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-text-secondary max-w-prose mx-auto">
            Everything is copyable, exportable, and ready to use in your strategy work. No buzzwords—just actionable insights backed by evidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <p className="text-sm text-text-secondary">
              <strong className="text-text-primary">Evidence</strong> → <strong className="text-text-primary">Opportunities</strong> → <strong className="text-text-primary">Bets</strong>
            </p>
          </div>
          <div>
            <Link href="/samples">
              <Button variant="outline" size="sm" className="border-2">
                See a sample
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-20">
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
                    "relative flex flex-col p-6 transition-all hover:shadow-lg hover:scale-105 rounded-2xl shadow-sm ring-1 ring-black/5",
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
      </MarketingContainer>
    </MarketingSection>
  )
}

