export function Differentiators() {
  const mostTools = [
    "Describe competitors",
    "Repeat market language",
    "Optimize for completeness",
  ]

  const plinth = [
    "Surfaces structural gaps",
    "Focuses on unmet jobs",
    "Prioritizes what competitors can't do",
    "Produces decisions you can defend in a room full of skeptics",
  ]

  return (
    <section className="border-t border-border mx-auto max-w-5xl px-4 py-20 md:py-24">
      <div className="mx-auto max-w-3xl space-y-12">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl text-center">
          Built for differentiation — not summaries
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border border-border p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Most tools
            </h3>
            <ul className="space-y-3">
              {mostTools.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-primary p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Plinth
            </h3>
            <ul className="space-y-3">
              {plinth.map((item, index) => (
                <li key={index} className="text-sm text-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

