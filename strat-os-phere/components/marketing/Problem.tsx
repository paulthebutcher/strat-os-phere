export function Problem() {
  return (
    <section id="problem" className="border-t border-border mx-auto max-w-5xl px-4 py-20 md:py-24">
      <div className="mx-auto max-w-3xl space-y-12">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl text-center">
          Strategy work doesn't fail because of bad ideas.
          <br />
          It fails because decisions stay fuzzy.
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-border p-6">
            <p className="text-base leading-relaxed text-foreground">
              Too many insights, not enough direction
            </p>
          </div>
          <div className="border border-border p-6">
            <p className="text-base leading-relaxed text-foreground">
              Opportunities that don't force tradeoffs
            </p>
          </div>
          <div className="border border-border p-6">
            <p className="text-base leading-relaxed text-foreground">
              Scorecards that collapse under exec scrutiny
            </p>
          </div>
          <div className="border border-border p-6">
            <p className="text-base leading-relaxed text-foreground">
              "Next steps" that aren't actually bets
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

