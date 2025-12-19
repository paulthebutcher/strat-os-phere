import { Shield, Eye, Lock, CheckCircle2 } from "lucide-react"

const principles = [
  {
    icon: Shield,
    title: "Public evidence only",
    description: "Uses only public, user-provided evidence",
  },
  {
    icon: Lock,
    title: "No private data scraping",
    description: "Clear guardrails around confidential information",
  },
  {
    icon: Eye,
    title: "Transparent outputs",
    description: "Explainable, defensible insights you can trust",
  },
  {
    icon: CheckCircle2,
    title: "Built for good strategy",
    description: "Designed to support good strategy — not shortcuts",
  },
]

export function Trust() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold text-text-primary md:text-4xl">
          Built with care
        </h2>
        <p className="mt-4 text-base text-text-secondary">
          Plinth is designed to support good strategy — not shortcuts.
        </p>
      </div>
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {principles.map((principle, index) => {
          const Icon = principle.icon
          return (
            <div key={index} className="panel p-6 text-center">
              <div className="mb-4 flex justify-center">
                <Icon className="h-6 w-6 text-text-primary" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-text-primary">
                {principle.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {principle.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

