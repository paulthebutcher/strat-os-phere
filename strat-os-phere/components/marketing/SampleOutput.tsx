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
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10">
              <TrendingUp className="h-5 w-5 text-accent-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-text-primary">
              Sample output
            </h2>
          </div>
          
          <SampleOutputSwitcher />
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

