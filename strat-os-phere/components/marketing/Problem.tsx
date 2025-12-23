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
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

export function Problem() {
  return (
    <MarketingSection id="problem" variant="muted">
      <MarketingContainer maxWidth="4xl">
        <div className="text-center space-y-6">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-text-primary">
            Competitive analysis is either too shallow or too slow.
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-text-secondary max-w-prose mx-auto">
            Marketing slides lack depth. Weeks of research lack speed. And "we learned a lot" isn't a decision.
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="panel p-6 md:p-8 rounded-2xl shadow-sm ring-1 ring-black/5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-primary/10">
                <AlertCircle className="h-4 w-4 text-accent-primary" />
              </div>
            </div>
            <p className="text-base leading-relaxed text-text-secondary md:text-lg">
              Too shallow: marketing slides don't reveal structural gaps
            </p>
          </div>
          <div className="panel p-6 md:p-8 rounded-2xl shadow-sm ring-1 ring-black/5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-primary/10">
                <AlertCircle className="h-4 w-4 text-accent-primary" />
              </div>
            </div>
            <p className="text-base leading-relaxed text-text-secondary md:text-lg">
              Too slow: weeks of research while decisions wait
            </p>
          </div>
          <div className="panel p-6 md:p-8 rounded-2xl shadow-sm ring-1 ring-black/5">
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
      </MarketingContainer>
    </MarketingSection>
  )
}

