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
    <section id="how-it-works" className="border-t border-border mx-auto max-w-5xl px-4 py-20 md:py-24">
      <div className="mx-auto max-w-3xl space-y-12">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl text-center">
          How Plinth thinks through your market
        </h2>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-border bg-surface text-sm font-semibold text-foreground">
                {step.number}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

