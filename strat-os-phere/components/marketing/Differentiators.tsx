/**
 * Differentiators Section
 * 
 * Design tokens used:
 * - surface-muted: Alternating section background
 * - accent-primary: Checkmark color and highlighted border
 * - danger: X mark color for contrast
 * - panel: Card styling with enhanced border for Plinth card
 * 
 * Enhanced with better visual contrast between the two cards.
 */
import { X, Check } from "lucide-react"

export function Differentiators() {
  const mostTools = [
    "Summarize marketing pages",
    "Generate generic insights",
    "Lack evidence trail",
    "Don't force decisions",
  ]

  const plinth = [
    "Live market signals: pricing, changelogs, reviews, docs, jobs, status pages",
    "Evidence-backed with citations: full audit trail you can validate",
    "Deterministic scoring + explainers: repeatable, defensible",
    "Opinionated output formats: forces tradeoffs and clarity",
    "Built for senior strategy workflows: copyable artifacts ready for VP+ decisions",
  ]

  return (
    <section className="bg-surface-muted/30 mx-auto max-w-[1200px] px-4 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
          Why Plinth vs generic research
        </h2>
      </div>
      <div className="mx-auto mt-20 grid gap-8 md:grid-cols-2 lg:max-w-5xl">
        <div className="panel p-8 md:p-10">
          <h3 className="mb-8 text-2xl font-semibold text-text-primary">
            Most tools
          </h3>
          <ul className="space-y-5">
            {mostTools.map((item, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-danger/10">
                  <X className="h-4 w-4 text-danger" />
                </div>
                <span className="text-base leading-relaxed text-text-secondary md:text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel border-2 border-accent-primary p-8 shadow-md md:p-10">
          <h3 className="mb-8 text-2xl font-semibold text-text-primary">
            Plinth
          </h3>
          <ul className="space-y-5">
            {plinth.map((item, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-primary/10">
                  <Check className="h-4 w-4 text-accent-primary" />
                </div>
                <span className="text-base leading-relaxed text-text-secondary md:text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

