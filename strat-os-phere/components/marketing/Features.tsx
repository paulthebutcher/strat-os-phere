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

/**
 * Features Section
 * 
 * Design tokens used:
 * - panel: Card styling with subtle border and shadow
 * - accent-primary: Icon container background (with opacity)
 * - text-text-primary: Headline and feature title colors
 * 
 * Enhanced card styling with icon containers and improved spacing.
 */
export function Features() {
  return (
    <section id="product" className="mx-auto max-w-7xl px-4 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
          From landscape → leverage
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-text-secondary md:text-xl">
          Plinth analyzes competitors through the lens of structure, evidence, and unmet jobs — not marketing claims.
        </p>
        <p className="mt-4 text-base font-semibold text-text-primary md:text-lg">
          No fluff. No guesswork.
        </p>
      </div>
      <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div key={index} className="panel p-8 transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-primary/10">
                <Icon className="h-6 w-6 text-accent-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="text-base leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

