/**
 * Who It's For Section
 * 
 * Two-column layout showing "Built for" and "Not for" to reduce ambiguity.
 * Confident, non-snarky tone.
 */
import { Check, X } from "lucide-react"
import { MarketingSection } from "../MarketingSection"
import { MarketingContainer } from "../MarketingContainer"
import { cn } from "@/lib/utils"

const builtFor = [
  "Product/Strategy/UX leaders deciding where to invest",
  "Startups prioritizing roadmap bets",
  "Enterprises aligning cross-functional investment",
]

const notFor = [
  "Real-time analytics dashboards",
  "Predictive forecasting or 'future guessing'",
  "Internal data warehousing / BI",
]

export function WhoItsForSection() {
  return (
    <MarketingSection variant="default">
      <MarketingContainer maxWidth="6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
            Who this is for
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Built for decision-makers who need evidence-backed strategic bets, not research dumps.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Built for */}
          <div className="bg-white rounded-xl border border-border-subtle p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10">
                <Check className="h-5 w-5 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary">
                Built for
              </h3>
            </div>

            <ul className="space-y-4">
              {builtFor.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed text-text-secondary">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not for */}
          <div className="bg-white rounded-xl border border-border-subtle p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <X className="h-5 w-5 text-text-muted" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary">
                Not for
              </h3>
            </div>

            <ul className="space-y-4">
              {notFor.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="h-5 w-5 text-text-muted shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed text-text-secondary">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

