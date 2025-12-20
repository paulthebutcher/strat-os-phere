export function WhoItsFor() {
  const audiences = [
    {
      title: "VP Product",
      description: "Defend roadmap bets",
    },
    {
      title: "Head of UX / Design",
      description: "Turn research into direction",
    },
    {
      title: "Strategy teams",
      description: "Align execs around tradeoffs",
    },
    {
      title: "Founders",
      description: "Place focused bets before scaling",
    },
  ]

  return (
    <section className="border-t border-border mx-auto max-w-5xl px-4 py-20 md:py-24">
      <div className="mx-auto max-w-3xl space-y-12">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl text-center">
          Built for leaders who have to decide.
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((audience, index) => (
            <div key={index} className="text-center space-y-2">
              <h3 className="text-base font-semibold text-foreground">
                {audience.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

