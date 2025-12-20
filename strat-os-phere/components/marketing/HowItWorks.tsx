/**
 * How Plinth Thinks Section
 * 
 * Design tokens used:
 * - surface-muted: Alternating section background
 * - accent-primary: Step number badge background
 * - panel: Card styling for each step
 * 
 * Vertical flow with subtle connecting elements.
 */
export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Ingests live market signals",
      description: "Pricing, changelogs, reviews, jobs, docs — not just marketing pages",
    },
    {
      number: "2",
      title: "Separates claims from reality",
      description: "Flags gaps between what competitors say and what users experience",
    },
    {
      number: "3",
      title: "Surfaces unmet demand",
      description: "Jobs scored by frequency and dissatisfaction",
    },
    {
      number: "4",
      title: "Ranks strategic opportunities",
      description: "Based on leverage, not feature parity",
    },
    {
      number: "5",
      title: "Frames real bets",
      description: "What you'd have to say no to — and why competitors won't easily follow",
    },
  ]

  return (
    <section id="how-it-works" className="bg-surface-muted/30 mx-auto max-w-7xl px-4 py-32 md:py-40">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
          How Plinth thinks through your market
        </h2>
      </div>
      <div className="mx-auto mt-24 max-w-4xl space-y-10">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {index < steps.length - 1 && (
              <div className="absolute left-7 top-16 bottom-0 w-0.5 bg-border-subtle" />
            )}
            <div className="panel flex flex-col gap-6 p-8 shadow-sm sm:flex-row sm:items-start md:p-10">
              <div className="flex shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent-primary text-primary-foreground shadow-sm">
                  <span className="text-2xl font-bold">{step.number}</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="mb-3 text-2xl font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="text-base leading-relaxed text-text-secondary md:text-lg">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

