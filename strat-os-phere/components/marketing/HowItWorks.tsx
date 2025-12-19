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
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold text-text-primary md:text-4xl">
          A structured strategy workflow
        </h2>
      </div>
      <div className="mt-16 space-y-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="panel flex flex-col gap-6 p-8 sm:flex-row sm:items-start"
          >
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border-subtle bg-surface-muted">
                <span className="text-xl font-semibold text-text-primary">{step.number}</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-xl font-semibold text-text-primary">
                {step.title}
              </h3>
              <p className="text-base text-text-secondary leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

