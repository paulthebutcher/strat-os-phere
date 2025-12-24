/**
 * Output Preview Section
 * 
 * Section showcasing the final Opportunity artifact output.
 * Emphasizes that it's a shareable, decision-ready artifact, not a dashboard.
 */
import { MarketingSection } from "../MarketingSection"
import { MarketingContainer } from "../MarketingContainer"
import { OpportunityArtifactPreview } from "../previews/OpportunityArtifactPreview"
import { cn } from "@/lib/utils"

export function OutputPreviewSection() {
  return (
    <MarketingSection variant="muted" id="output-preview">
      <MarketingContainer maxWidth="7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Callouts */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
                What you get: decision-ready strategic bets
              </h2>
              <p className="text-lg leading-relaxed text-text-secondary">
                Not a dashboard. A shareable artifact you can defend.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="bg-white rounded-lg border border-border-subtle p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  Evidence-backed recommendations
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Every opportunity includes citations, confidence metrics, and explicit assumptions.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-border-subtle p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  Ready to share and defend
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Export or share directly. Each bet includes the evidence trail needed for executive reviews.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-border-subtle p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  Deterministic and repeatable
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Same inputs produce the same outputs. Scoring is transparent and explainable.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Large preview */}
          <div className="lg:sticky lg:top-24">
            <OpportunityArtifactPreview />
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

