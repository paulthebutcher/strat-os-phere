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
    "Produces insights you can defend in a room full of skeptics",
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold text-text-primary md:text-4xl">
          Built for differentiation — not summaries
        </h2>
      </div>
      <div className="mt-16 grid gap-8 md:grid-cols-2">
        <div className="panel p-8">
          <h3 className="mb-6 text-xl font-semibold text-text-primary">
            Most tools
          </h3>
          <ul className="space-y-4">
            {mostTools.map((item, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-text-muted">×</span>
                <span className="text-base text-text-secondary">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel p-8 border-border-strong">
          <h3 className="mb-6 text-xl font-semibold text-text-primary">
            Plinth
          </h3>
          <ul className="space-y-4">
            {plinth.map((item, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-accent-primary">✓</span>
                <span className="text-base text-text-secondary">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

