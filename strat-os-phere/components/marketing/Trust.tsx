import { Shield, Lock, Eye, Target } from "lucide-react"

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
    icon: Lock,
    title: "You control inputs",
    description: "You can edit drafts before saving; you own your data",
  },
  {
    icon: Target,
    title: "Transparent outputs",
    description: "Explainable, defensible insights with full evidence trail",
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
 * Enhanced with icon containers and improved spacing.
 */
export function Trust() {
  return (
    <section className="bg-surface-muted/30 mx-auto max-w-7xl px-4 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
          Trust & safety
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-text-secondary md:text-xl">
          Explicit data boundaries and full transparency. You control what goes in, and you can validate what comes out.
        </p>
      </div>
      <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {principles.map((principle, index) => {
          const Icon = principle.icon
          return (
            <div key={index} className="panel p-8 text-center transition-shadow hover:shadow-md">
              <div className="mb-6 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent-primary/10">
                  <Icon className="h-7 w-7 text-accent-primary" />
                </div>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-text-primary md:text-xl">
                {principle.title}
              </h3>
              <p className="text-base leading-relaxed text-text-secondary">
                {principle.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

