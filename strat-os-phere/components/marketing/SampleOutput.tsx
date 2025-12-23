/**
 * Sample Output Callout Strip
 * 
 * A colored panel showing a sample opportunity output for marketing purposes.
 * This is static marketing copy, not wired to the app.
 */
import { TrendingUp, ExternalLink } from "lucide-react"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

export function SampleOutput() {
  return (
    <MarketingSection id="sample-output" variant="default">
      <MarketingContainer maxWidth="4xl">
        <div className="marketing-gradient-bg relative overflow-hidden rounded-2xl border-2 border-accent-primary/20 p-8 md:p-12 shadow-lg">
        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/20">
              <TrendingUp className="h-5 w-5 text-accent-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary md:text-3xl">
              Sample output
            </h2>
          </div>
          
          <div className="panel bg-surface border border-border-subtle p-6 md:p-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-text-primary">
                  Pricing transparency gap
                </h3>
                <p className="text-sm text-text-secondary md:text-base">
                  Competitors hide pricing behind contact forms, creating friction for self-service buyers. 
                  Opportunity to differentiate with transparent, upfront pricing.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-lg bg-accent-primary/10 px-3 py-1.5">
                <span className="text-lg font-bold text-accent-primary">8.2</span>
                <span className="text-xs text-text-muted">score</span>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-accent-primary/10 px-2.5 py-1 text-xs font-medium text-accent-primary">
                3 citations
              </span>
              <span className="inline-flex items-center rounded-md bg-[hsl(var(--marketing-accent-teal)/0.1)] px-2.5 py-1 text-xs font-medium text-[hsl(var(--marketing-accent-teal))]">
                High leverage
              </span>
              <span className="inline-flex items-center rounded-md bg-[hsl(var(--marketing-accent-coral)/0.1)] px-2.5 py-1 text-xs font-medium text-[hsl(var(--marketing-accent-coral))]">
                First experiment: pricing page
              </span>
            </div>
            
            <div className="mt-6 border-t border-border-subtle pt-4">
              <p className="text-xs text-text-muted">
                <strong className="font-semibold text-text-secondary">Evidence:</strong>{" "}
                Competitor A requires contact form for pricing (verified 2024-01-15). 
                Competitor B shows "Contact sales" only (verified 2024-01-12). 
                Review analysis shows 23 mentions of "pricing unclear" in last 90 days.
              </p>
            </div>
          </div>
          
          <p className="mt-6 text-sm text-text-muted">
            This is a sample output. Your actual analysis will include Jobs-to-be-Done, Scorecard, 
            Opportunities, and Strategic Bets—all with full citations you can validate.
          </p>
        </div>
      </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

