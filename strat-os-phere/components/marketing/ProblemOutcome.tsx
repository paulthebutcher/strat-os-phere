/**
 * Problem → Outcome Section
 * 
 * Explains why now / what breaks today, and what Plinth delivers.
 * Calm, analytical tone focused on the problem and outcome.
 */
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

export function ProblemOutcome() {
  return (
    <MarketingSection variant="default">
      <MarketingContainer maxWidth="6xl">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Problem column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger/10">
                <AlertCircle className="h-5 w-5 text-danger" />
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-text-primary">
                What breaks today
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-text-primary">
                  Fragmented signals
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Pricing pages, docs, changelogs, and reviews live in different places. Manual synthesis is time-consuming and inconsistent.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-text-primary">
                  Unclear priorities
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Without structured ranking, it's hard to know which opportunities are most defensible or evidence-backed.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-text-primary">
                  Missing citations
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Strategic recommendations without traceable sources are hard to defend in executive conversations.
                </p>
              </div>
            </div>
          </div>
          
          {/* Outcome column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-text-primary">
                What you get
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-text-primary">
                  Unified evidence base
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  All market signals organized by type with recency indicators. One source of truth for competitive intelligence.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-text-primary">
                  Ranked opportunities
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Strategic bets scored by evidence strength, defensibility, and market timing. Clear priorities for decision-making.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-text-primary">
                  Traceable citations
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Every recommendation links back to sources. Confidence and coverage metrics show what's certain vs. inferred.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

