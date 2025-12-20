/**
 * Problem Section
 * 
 * Design tokens used:
 * - surface-muted: Alternating section background for visual separation
 * - panel: Card styling for problem items with subtle shadows
 * 
 * Enhanced with card layout and better spacing for readability.
 */
export function Problem() {
  return (
    <section id="problem" className="bg-surface-muted/30 mx-auto max-w-7xl px-4 py-32 md:py-40">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
          Strategy work doesn't fail because of bad ideas.
          <br />
          It fails because decisions stay fuzzy.
        </h2>
        <div className="mt-24 grid gap-6 md:grid-cols-2">
          <div className="panel p-10 shadow-sm">
            <p className="text-xl leading-relaxed text-text-secondary md:text-2xl">
              Too many insights, not enough direction
            </p>
          </div>
          <div className="panel p-10 shadow-sm">
            <p className="text-xl leading-relaxed text-text-secondary md:text-2xl">
              Opportunities that don't force tradeoffs
            </p>
          </div>
          <div className="panel p-10 shadow-sm">
            <p className="text-xl leading-relaxed text-text-secondary md:text-2xl">
              Scorecards that collapse under exec scrutiny
            </p>
          </div>
          <div className="panel p-10 shadow-sm">
            <p className="text-xl leading-relaxed text-text-secondary md:text-2xl">
              "Next steps" that aren't actually bets
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

