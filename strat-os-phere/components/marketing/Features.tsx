import {
  Search,
  FileText,
  Target,
  Zap,
  Eye,
  Shield,
} from "lucide-react"

const features = [
  {
    icon: Search,
    title: "Clear competitor snapshots",
    description: "See how competitors actually position themselves, not just what they claim.",
  },
  {
    icon: FileText,
    title: "Synthesized market themes",
    description: "Understand what's converging, what's commoditized, and what's over-served.",
  },
  {
    icon: Target,
    title: "Explicit gaps",
    description: "Identify what competitors don't address — and where you can win.",
  },
  {
    icon: Zap,
    title: "Evidence-grounded opportunities",
    description: "Find strategic angles backed by real evidence, not guesswork.",
  },
  {
    icon: Eye,
    title: "Defensible insights",
    description: "Produce strategic angles you can defend in a room full of skeptics.",
  },
  {
    icon: Shield,
    title: "Structure over claims",
    description: "Analyze through the lens of structure, evidence, and unmet jobs — not marketing.",
  },
]

export function Features() {
  return (
    <section id="product" className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold text-text-primary md:text-4xl">
          From landscape → leverage
        </h2>
        <p className="mt-4 text-base text-text-secondary">
          Plinth analyzes competitors through the lens of structure, evidence, and unmet jobs — not marketing claims.
        </p>
        <p className="mt-4 text-sm font-medium text-text-primary">
          No fluff. No guesswork.
        </p>
      </div>
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div key={index} className="panel p-6">
              <div className="mb-4">
                <Icon className="h-6 w-6 text-text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

