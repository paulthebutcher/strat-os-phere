/**
 * Outputs Section
 * 
 * Design tokens used:
 * - panel: Card styling for output content
 * - accent-primary: Icon container background
 * - surface-muted: Placeholder mockup background
 * 
 * Focuses on decision artifacts: Jobs, Scorecards, and Opportunities.
 */
export function Outputs() {
  const outputs = [
    {
      title: "Jobs to Be Done",
      description: "Clear, specific jobs grounded in unmet demand — not generic personas.",
      icon: (
        <svg className="h-6 w-6 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      title: "Competitive Scorecards",
      description: "Weighted comparisons that reveal where differences actually matter.",
      icon: (
        <svg className="h-6 w-6 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "Strategic Opportunities",
      description: "Ranked opportunities that force clarity on tradeoffs, required capabilities, and defensibility.",
      icon: (
        <svg className="h-6 w-6 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ]

  return (
    <section id="outputs" className="mx-auto max-w-7xl px-4 py-32 md:py-40">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
          What Plinth gives you — and why it's different
        </h2>
      </div>
      <div className="mt-24 grid gap-8 md:grid-cols-3">
        {outputs.map((output, index) => (
          <div key={index} className="panel p-10 shadow-sm">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-accent-primary/10">
              {output.icon}
            </div>
            <h3 className="mb-4 text-2xl font-semibold text-text-primary">
              {output.title}
            </h3>
            <p className="text-base leading-relaxed text-text-secondary md:text-lg">
              {output.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

