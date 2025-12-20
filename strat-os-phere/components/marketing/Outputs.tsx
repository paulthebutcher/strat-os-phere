export function Outputs() {
  const outputs = [
    {
      title: "Jobs to Be Done",
      description: "Clear, specific jobs grounded in unmet demand — not generic personas.",
    },
    {
      title: "Competitive Scorecards",
      description: "Weighted comparisons that reveal where differences actually matter.",
    },
    {
      title: "Strategic Opportunities",
      description: "Ranked opportunities that force clarity on tradeoffs, required capabilities, and defensibility.",
    },
  ]

  return (
    <section id="outputs" className="border-t border-border mx-auto max-w-5xl px-4 py-20 md:py-24">
      <div className="mx-auto max-w-3xl space-y-12">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl text-center">
          What Plinth gives you — and why it's different
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {outputs.map((output, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                {output.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {output.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

