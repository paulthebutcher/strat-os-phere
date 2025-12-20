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
      title: "Add competitors",
      description: "Paste public evidence (websites, pricing, trust pages) or auto-generate from the web.",
    },
    {
      number: "2",
      title: "Analyze the landscape",
      description: "Plinth generates evidence-backed competitor profiles and market synthesis.",
    },
    {
      number: "3",
      title: "Identify differentiation",
      description: "See gaps, Jobs to Be Done competitors miss, and where you can win.",
    },
    {
      number: "4",
      title: "Act with confidence",
      description: "Use insights directly in positioning, roadmap decisions, and exec conversations.",
    },
  ]

  return (
    <section id="how-it-works" className="bg-surface-muted/30 mx-auto max-w-7xl px-4 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
          A structured strategy workflow
        </h2>
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

