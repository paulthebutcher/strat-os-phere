/**
 * Outcome Example Section (Decision Canvas)
 * 
 * Proof-first layout: full-width artifact with compact proof legend.
 * Single cohesive proof block that keeps attention on the artifact.
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { DecisionBriefPreview } from "./previews/DecisionBriefPreview"
import { cn } from "@/lib/utils"

interface ProofLegendItemProps {
  label: string
  description: string
}

function ProofLegendItem({ label, description }: ProofLegendItemProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs sm:text-sm font-semibold text-text-primary">
        {label}
      </h3>
      <p className="text-xs text-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  )
}

export function OutcomeExampleSection() {
  const proofLegendItems = [
    {
      label: "Recommendation",
      description: "One call, not a list"
    },
    {
      label: "Evidence",
      description: "Every claim is sourced"
    },
    {
      label: "Confidence",
      description: "Scores show what's supported"
    },
    {
      label: "Next steps",
      description: "Guardrails show what changes the call"
    }
  ]

  return (
    <MarketingSection variant="default">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Section headline + subhead */}
            <div className="text-center space-y-2 sm:space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight lg:whitespace-nowrap">
                What you actually get
              </h2>
              <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto">
                A decision artifact you can share with stakeholders. No dashboards, no fluff.
              </p>
            </div>

            {/* Full-width artifact wrapper */}
            <div className="w-full">
              <DecisionBriefPreview />
            </div>

            {/* Compact proof legend - 4-up grid */}
            <div className={cn(
              "grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6",
              "pt-2 sm:pt-4"
            )}>
              {proofLegendItems.map((item, index) => (
                <ProofLegendItem
                  key={index}
                  label={item.label}
                  description={item.description}
                />
              ))}
            </div>

            {/* Mobile CTA */}
            <Reveal delay={60}>
              <div className="mt-4 sm:mt-6 text-center lg:hidden">
                <Link href="/example" className="inline-block w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    See a real decision
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

