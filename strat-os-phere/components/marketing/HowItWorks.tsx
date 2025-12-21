/**
 * How It Works Section
 * 
 * Design tokens used:
 * - surface-muted: Alternating section background
 * - accent-primary: Step number badge background
 * - panel: Card styling for each step
 * 
 * Enhanced with larger step badges and better visual hierarchy.
 */
export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Frame the decision",
      description: "Define your market, customer, constraints, and confidence level",
    },
    {
      number: "2",
      title: "Add competitors",
      description: "Provide URLs or names. Plinth generates evidence automatically",
    },
    {
      number: "3",
      title: "Plinth pulls live signals",
      description: "Pricing, changelogs, reviews, docs, jobs, status pages — not just marketing pages",
    },
    {
      number: "4",
      title: "Get decision-ready outputs",
      description: "Jobs-to-be-Done, Scorecard, Opportunities, and Strategic Bets — all with evidence and citations",
    },
  ]

  return (
    <section id="how-it-works" className="bg-surface-muted/30 mx-auto max-w-7xl px-4 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
          How it works
        </h2>
        <p className="mt-4 text-base text-text-secondary md:text-lg">
          Everything is backed by evidence with citations you can validate
        </p>
      </div>
      <div className="mx-auto mt-20 max-w-4xl space-y-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className="panel flex flex-col gap-6 p-8 transition-shadow hover:shadow-md sm:flex-row sm:items-start md:p-10"
          >
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
        ))}
      </div>
    </section>
  )
}

