const principles = [
  {
    title: "Public evidence only",
    description: "Uses only public, user-provided evidence",
  },
  {
    title: "No private data scraping",
    description: "Clear guardrails around confidential information",
  },
  {
    title: "Transparent outputs",
    description: "Explainable, defensible insights you can trust",
  },
  {
    title: "Built for good strategy",
    description: "Designed to support good strategy — not shortcuts",
  },
]

export function Trust() {
  return (
    <section className="border-t border-border mx-auto max-w-5xl px-4 py-20 md:py-24">
      <div className="mx-auto max-w-3xl space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Built with care
          </h2>
          <p className="text-sm text-muted-foreground">
            Plinth is designed to support good strategy — not shortcuts.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle, index) => (
            <div key={index} className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                {principle.title}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

