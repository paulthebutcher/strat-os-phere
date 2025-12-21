import { Users, Briefcase, Target, Building2 } from "lucide-react"

const audiences = [
  {
    icon: Users,
    title: "Product & UX leaders",
    description: "Make positioning decisions with confidence",
  },
  {
    icon: Briefcase,
    title: "Strategy and innovation teams",
    description: "Find differentiation opportunities others miss",
  },
  {
    icon: Target,
    title: "Founders and early executives",
    description: "Build defensible positioning from day one",
  },
  {
    icon: Building2,
    title: "Internal platform and portfolio teams",
    description: "Navigate complex competitive landscapes",
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
          Designed for teams who make hard calls
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-text-secondary md:text-xl">
          If you're expected to justify decisions — not just make slides — Plinth is for you.
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
    </section>
  )
}

