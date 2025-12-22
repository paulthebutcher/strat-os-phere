import { Shield, Lock, Eye, Clock } from "lucide-react"

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
 * Design tokens used:
 * - surface-muted: Alternating section background
 * - accent-primary: Icon container background
 * - panel: Card styling with hover effects
 * 
 * Enhanced with visual rhythm, subtle background tint, and better styling.
 */
export function Trust() {
  return (
    <section className="marketing-gradient-bg mx-auto max-w-[1200px] px-4 py-24 md:py-32 rounded-2xl">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
          Trust & rigor
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-text-secondary md:text-xl">
          Explicit data boundaries and full transparency. You control what goes in, and you can validate what comes out.
        </p>
      </div>
      <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {principles.map((principle, index) => {
          const Icon = principle.icon
          return (
            <div key={index} className="panel p-8 text-center transition-all hover:shadow-lg hover:scale-105 bg-surface">
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 shadow-sm">
                  <Icon className="h-8 w-8 text-accent-primary" />
                </div>
              </div>
              <h3 className="mb-3 text-lg font-bold text-text-primary md:text-xl">
                {principle.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary md:text-base">
                {principle.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

