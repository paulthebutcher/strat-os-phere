import { Shield, Lock, Eye, Clock } from "lucide-react"
import { brand } from "@/lib/ui/brand"
import { cn } from "@/lib/utils"

const principles = [
  {
    icon: Shield,
    title: "Public sources only",
    description: "Uses public sources only; no logins, no scraping behind auth",
  },
  {
    icon: Eye,
    title: "Citations included",
    description: "Every output includes citations so you can validate",
  },
  {
    icon: Clock,
    title: "Recency window",
    description: "Focuses on recent signals (last 90 days) for current market dynamics",
  },
  {
    icon: Lock,
    title: "You control inputs",
    description: "You can edit drafts before saving; you own your data",
  },
]

/**
 * Trust Section
 * 
 * Enhanced with brand tokens for consistent styling and enterprise-grade appearance.
 */
export function Trust() {
  return (
    <section className={cn(
      "marketing-gradient-bg mx-auto max-w-[1200px] px-4 rounded-2xl",
      brand.spacing.section
    )}>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className={cn(brand.typeScale.headline, "text-text-primary")}>
          Trust & rigor
        </h2>
        <p className={cn("mt-6", brand.typeScale.bodyLarge, "text-text-secondary")}>
          Explicit data boundaries and full transparency. You control what goes in, and you can validate what comes out.
        </p>
      </div>
      <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {principles.map((principle, index) => {
          const Icon = principle.icon
          return (
            <div
              key={index}
              className={cn(
                "panel p-8 text-center transition-all hover:shadow-lg hover:scale-105",
                brand.surface.base
              )}
            >
              <div className="mb-6 flex justify-center">
                <div className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br",
                  "from-accent-primary/20 to-accent-primary/10 shadow-sm"
                )}>
                  <Icon className={cn("h-8 w-8", brand.primary.text)} />
                </div>
              </div>
              <h3 className={cn("mb-3", brand.typeScale.subhead, "text-text-primary")}>
                {principle.title}
              </h3>
              <p className={cn("text-sm leading-relaxed text-text-secondary md:text-base")}>
                {principle.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

