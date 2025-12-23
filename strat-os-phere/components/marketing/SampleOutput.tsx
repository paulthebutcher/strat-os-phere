/**
 * Sample Output Callout Strip
 * 
 * A colored panel showing a sample opportunity output for marketing purposes.
 * This is static marketing copy, not wired to the app.
 */
import { TrendingUp } from "lucide-react"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Surface } from "@/components/ui/surface"
import { CardShell } from "@/components/ui/surface"
import { OpportunityCard } from "@/components/opportunities/OpportunityCard"

export function SampleOutput() {
  return (
    <MarketingSection id="sample-output" variant="default">
      <div className="w-full bg-gradient-to-b from-[rgb(var(--plinth-surface-muted))] via-transparent to-transparent py-12 md:py-16">
        <MarketingContainer maxWidth="4xl">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(var(--plinth-accent)/0.1)]">
                <TrendingUp className="h-5 w-5 text-[rgb(var(--plinth-accent))]" />
              </div>
              <h2 className="text-2xl font-bold text-[rgb(var(--plinth-text))] md:text-3xl">
                Sample output
              </h2>
            </div>
            
            <Surface glow className="p-8 md:p-12">
              <CardShell>
                <OpportunityCard
                  title="Pricing transparency gap"
                  description="Competitors hide pricing behind contact forms, creating friction for self-service buyers. Opportunity to differentiate with transparent, upfront pricing."
                  score={8.2}
                  citationsCount={3}
                  badges={[
                    { label: "High leverage", tone: "success" },
                    { label: "First experiment: pricing page", tone: "warning" },
                  ]}
                  evidenceLine='Competitor A requires contact form for pricing (verified 2024-01-15). Competitor B shows "Contact sales" only (verified 2024-01-12). Review analysis shows 23 mentions of "pricing unclear" in last 90 days.'
                />
              </CardShell>
            </Surface>
            
            <p className="mt-6 text-center text-sm text-[rgb(var(--plinth-muted))]">
              This is a sample output. Your actual analysis will include Jobs-to-be-Done, Scorecard, 
              Opportunities, and Strategic Bets—all with full citations you can validate.
            </p>
          </div>
        </MarketingContainer>
      </div>
    </MarketingSection>
  )
}

