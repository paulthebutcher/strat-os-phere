import { Briefcase, Palette, Target } from "lucide-react"

const personas = [
  {
    icon: Briefcase,
    title: "VP Product",
    description: "Portfolio decisions, differentiation bets, competitive repositioning. Decision-ready outputs you can defend in executive reviews.",
    borderColor: "marketing-accent-border-indigo",
    iconColor: "text-accent-primary",
    iconBg: "bg-accent-primary/10",
  },
  {
    icon: Palette,
    title: "VP UX/Design",
    description: "Pricing strategy discovery, positioning clarity, strategic bets. Evidence-backed insights for design and experience decisions.",
    borderColor: "marketing-accent-border-coral",
    iconColor: "text-[hsl(var(--marketing-accent-coral))]",
    iconBg: "bg-[hsl(var(--marketing-accent-coral)/0.1)]",
  },
  {
    icon: Target,
    title: "Strategy/Insights",
    description: "What to say no to, where to differentiate, evidence-backed decisions. Strategic bets with full evidence trail.",
    borderColor: "marketing-accent-border-teal",
    iconColor: "text-[hsl(var(--marketing-accent-teal))]",
    iconBg: "bg-[hsl(var(--marketing-accent-teal)/0.1)]",
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
 * Enhanced with 3 persona cards with color accents.
 */
export function WhoItsFor() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
          Who it's for
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-text-secondary md:text-xl">
          Built for senior Product/UX strategy professionals who need decision-ready outputs, not research summaries.
        </p>
      </div>
      <div className="mt-20 grid gap-6 md:grid-cols-3">
        {personas.map((persona, index) => {
          const Icon = persona.icon
          return (
            <div key={index} className={`panel ${persona.borderColor} relative flex flex-col p-8 transition-all hover:shadow-lg hover:scale-105`}>
              <div className="mb-6 flex justify-center">
                <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${persona.iconBg} ${persona.iconColor} shadow-sm`}>
                  <Icon className="h-8 w-8" />
                </div>
              </div>
              <h3 className="mb-4 text-xl font-bold text-text-primary md:text-2xl">
                {persona.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary md:text-base">
                {persona.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

