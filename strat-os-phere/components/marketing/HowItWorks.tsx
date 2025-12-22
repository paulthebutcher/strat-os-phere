/**
 * How It Works Section
 * 
 * Design tokens used:
 * - surface-muted: Alternating section background
 * - accent-primary: Step number badge background
 * - panel: Card styling for each step
 * 
 * Enhanced with 4-step timeline with numbered gradient chips and colored top borders.
 */
export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Inputs",
      description: "Define your market, customer, constraints, and confidence level. Add competitors by URL or name.",
      borderColor: "marketing-accent-border-indigo",
      gradient: "from-accent-primary to-accent-primary/80",
    },
    {
      number: "2",
      title: "Evidence",
      description: "Plinth automatically pulls live signals: pricing, changelogs, reviews, docs, jobs, status pages — not just marketing pages.",
      borderColor: "marketing-accent-border-teal",
      gradient: "from-[hsl(var(--marketing-accent-teal))] to-[hsl(var(--marketing-accent-teal)/0.8)]",
    },
    {
      number: "3",
      title: "Opportunities",
      description: "Get ranked differentiation opportunities with first experiments you can run, all backed by evidence.",
      borderColor: "marketing-accent-border-coral",
      gradient: "from-[hsl(var(--marketing-accent-coral))] to-[hsl(var(--marketing-accent-coral)/0.8)]",
    },
    {
      number: "4",
      title: "Bets",
      description: "Strategic Bets: what to say no to and why rivals won't follow. Decision-ready outputs with full citations.",
      borderColor: "marketing-accent-border-purple",
      gradient: "from-[hsl(var(--marketing-gradient-end))] to-[hsl(var(--marketing-gradient-end)/0.8)]",
    },
  ]

  return (
    <section id="how-it-works" className="mx-auto max-w-[1200px] px-4 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
          How it works
        </h2>
        <p className="mt-4 text-base text-text-secondary md:text-lg">
          Everything is backed by evidence with citations you can validate
        </p>
      </div>
      <div className="mx-auto mt-20 max-w-5xl">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`panel ${step.borderColor} relative flex flex-col p-6 transition-all hover:shadow-lg hover:scale-105`}
            >
              <div className="mb-4 flex shrink-0">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${step.gradient} text-white shadow-md`}>
                  <span className="text-xl font-bold">{step.number}</span>
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-text-primary">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary md:text-base">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

