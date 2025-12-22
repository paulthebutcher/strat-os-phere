/**
 * Problem Section
 * 
 * Design tokens used:
 * - surface-muted: Alternating section background for visual separation
 * - panel: Card styling for problem items
 * - accent-primary: Bullet point indicator color
 * 
 * Enhanced with card layout and better spacing for readability.
 */
import { AlertCircle } from "lucide-react"

export function Problem() {
  return (
    <section id="problem" className="bg-surface-muted/30 mx-auto max-w-[1200px] px-4 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
          Competitive analysis is either too shallow or too slow.
        </h2>
        <p className="mt-6 text-center text-lg leading-relaxed text-text-secondary md:text-xl">
          Marketing slides lack depth. Weeks of research lack speed. And "we learned a lot" isn't a decision.
        </p>
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <div className="panel p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-primary/10">
                <AlertCircle className="h-4 w-4 text-accent-primary" />
              </div>
            </div>
            <p className="text-base leading-relaxed text-text-secondary md:text-lg">
              Too shallow: marketing slides don't reveal structural gaps
            </p>
          </div>
          <div className="panel p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-primary/10">
                <AlertCircle className="h-4 w-4 text-accent-primary" />
              </div>
            </div>
            <p className="text-base leading-relaxed text-text-secondary md:text-lg">
              Too slow: weeks of research while decisions wait
            </p>
          </div>
          <div className="panel p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-primary/10">
                <AlertCircle className="h-4 w-4 text-accent-primary" />
              </div>
            </div>
            <p className="text-base leading-relaxed text-text-secondary md:text-lg">
              No shared frame: teams argue because there's no evidence trail or decision forcing function
            </p>
          </div>
        </div>
        <p className="mt-12 text-center text-lg font-semibold text-text-primary md:text-xl">
          Plinth gives you decision-ready outputs in minutes, not weeks.
        </p>
      </div>
    </section>
  )
}

