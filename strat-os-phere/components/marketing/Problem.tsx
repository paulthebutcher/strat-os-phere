export function Problem() {
  return (
    <section id="problem" className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-semibold text-text-primary md:text-4xl">
          Competitive analysis is broken.
        </h2>
        <p className="mt-6 text-center text-base text-text-secondary">
          Most tools summarize what already exists. They tell you who's out there — not how to win.
        </p>
        <div className="mt-12 space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-accent-primary mt-2" />
            </div>
            <p className="text-base text-text-secondary">
              Everything looks like table stakes
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-accent-primary mt-2" />
            </div>
            <p className="text-base text-text-secondary">
              Insights are generic and hard to act on
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-accent-primary mt-2" />
            </div>
            <p className="text-base text-text-secondary">
              Teams spend weeks synthesizing decks that go stale immediately
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-base font-medium text-text-primary">
          Plinth is built for a different outcome.
        </p>
      </div>
    </section>
  )
}

