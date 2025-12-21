import { Users, Briefcase, Target, Building2 } from "lucide-react"

const audiences = [
  {
    icon: Users,
    title: "VP Product",
    description: "Portfolio decisions, differentiation bets, competitive repositioning",
  },
  {
    icon: Briefcase,
    title: "Head of UX / Experience Strategy",
    description: "Pricing strategy discovery, positioning clarity, strategic bets",
  },
  {
    icon: Target,
    title: "Product Strategy & Innovation leads",
    description: "What to say no to, where to differentiate, evidence-backed decisions",
  },
  {
    icon: Building2,
    title: "Senior Product/UX strategists",
    description: "Decision-ready outputs you can defend in executive reviews",
  },
]

/**
 * Who It's For Section
 * 
 * Design tokens used:
 * - panel: Card styling with hover effects
 * - accent-primary: Icon container background
 * - text-text-primary: Headline and title colors
 * 
 * Enhanced with icon containers and improved card styling.
 */
export function WhoItsFor() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
          Who it's for
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-text-secondary md:text-xl">
          Built for senior Product/UX strategy professionals who need decision-ready outputs, not research summaries.
        </p>
      </div>
      <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {audiences.map((audience, index) => {
          const Icon = audience.icon
          return (
            <div key={index} className="panel p-8 text-center transition-shadow hover:shadow-md">
              <div className="mb-6 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent-primary/10">
                  <Icon className="h-7 w-7 text-accent-primary" />
                </div>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-text-primary md:text-xl">
                {audience.title}
              </h3>
              <p className="text-base leading-relaxed text-text-secondary">
                {audience.description}
              </p>
            </div>
          )
        })}
      </div>
      <div className="mt-16 mx-auto max-w-3xl">
        <div className="panel p-8 border-2 border-border-subtle">
          <h3 className="mb-4 text-xl font-semibold text-text-primary text-center">
            Great for
          </h3>
          <ul className="mb-8 space-y-2 text-center">
            <li className="text-base text-text-secondary">Portfolio decisions</li>
            <li className="text-base text-text-secondary">Differentiation bets</li>
            <li className="text-base text-text-secondary">Pricing strategy discovery</li>
            <li className="text-base text-text-secondary">Competitive repositioning</li>
          </ul>
          <div className="border-t border-border-subtle pt-6">
            <h3 className="mb-4 text-xl font-semibold text-text-primary text-center">
              Not for
            </h3>
            <ul className="space-y-2 text-center">
              <li className="text-base text-text-muted">Not a generic SEO research tool</li>
              <li className="text-base text-text-muted">Not a replacement for user research</li>
              <li className="text-base text-text-muted">Not a BI dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

