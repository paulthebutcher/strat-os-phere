/**
 * Who It's For Section
 * 
 * Design tokens used:
 * - text-text-primary: Headline and title colors
 * - text-text-secondary: Description colors
 * 
 * Minimal, confident presentation without icons or avatars.
 */
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
    <section className="mx-auto max-w-7xl px-4 py-32 md:py-40">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
          Built for leaders who have to decide.
        </h2>
      </div>
      <div className="mt-24 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {audiences.map((audience, index) => (
          <div key={index} className="text-center">
            <h3 className="mb-3 text-xl font-semibold text-text-primary md:text-2xl">
              {audience.title}
            </h3>
            <p className="text-base leading-relaxed text-text-secondary md:text-lg">
              {audience.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

