/**
 * Sample Output Section
 * 
 * Interactive sample output switcher for marketing purposes.
 * Shows 2-3 example opportunity cards that users can toggle between.
 */
import { TrendingUp } from "lucide-react"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { SampleOutputSwitcher } from "./SampleOutputSwitcher"

export function SampleOutput() {
  return (
    <MarketingSection id="sample-output" variant="muted">
      <MarketingContainer maxWidth="6xl">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10">
              <TrendingUp className="h-5 w-5 text-accent-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-text-primary">
              Sample output
            </h2>
          </div>
          
          <p className="text-center text-base text-text-secondary mb-6 max-w-2xl mx-auto">
            This is what you share internally: the top opportunities, why they matter, and the evidence behind them.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
              Exec-ready
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
              Citations included
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
              Actionable next steps
            </span>
          </div>
          
          <SampleOutputSwitcher />
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

