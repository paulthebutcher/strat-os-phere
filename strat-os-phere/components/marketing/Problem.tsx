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
    <section id="problem" className="bg-surface-muted/30 mx-auto max-w-7xl px-4 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
          Competitive analysis is broken.
        </h2>
        <p className="mt-6 text-center text-lg leading-relaxed text-text-secondary md:text-xl">
          Most tools summarize what already exists. They tell you who's out there — not how to win.
        </p>
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <div className="panel p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-primary/10">
                <AlertCircle className="h-4 w-4 text-accent-primary" />
              </div>
            </div>
            <p className="text-base leading-relaxed text-text-secondary md:text-lg">
              Everything looks like table stakes
            </p>
          </div>
          <div className="panel p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-primary/10">
                <AlertCircle className="h-4 w-4 text-accent-primary" />
              </div>
            </div>
            <p className="text-base leading-relaxed text-text-secondary md:text-lg">
              Insights are generic and hard to act on
            </p>
          </div>
          <div className="panel p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-primary/10">
                <AlertCircle className="h-4 w-4 text-accent-primary" />
              </div>
            </div>
            <p className="text-base leading-relaxed text-text-secondary md:text-lg">
              Teams spend weeks synthesizing decks that go stale immediately
            </p>
          </div>
        </div>
        <p className="mt-12 text-center text-lg font-semibold text-text-primary md:text-xl">
          Plinth is built for a different outcome.
        </p>
      </div>
    </section>
  )
}

