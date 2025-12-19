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

export function WhoItsFor() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold text-text-primary md:text-4xl">
          Designed for teams who make hard calls
        </h2>
        <p className="mt-4 text-base text-text-secondary">
          If you're expected to justify decisions — not just make slides — Plinth is for you.
        </p>
      </div>
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {audiences.map((audience, index) => {
          const Icon = audience.icon
          return (
            <div key={index} className="panel p-6 text-center">
              <div className="mb-4 flex justify-center">
                <Icon className="h-6 w-6 text-text-primary" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-text-primary">
                {audience.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {audience.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

