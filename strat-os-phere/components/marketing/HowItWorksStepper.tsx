/**
 * How It Works Stepper
 * 
 * Notion-style carousel showing the 3-step process with polished static screenshots.
 * Left side: step list with active indicator
 * Right side: large preview area with device frame
 */
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { StepsCarousel, type StepItem } from "./StepsCarousel"

const steps: StepItem[] = [
  {
    id: "collect",
    stepLabel: "STEP 1",
    title: "Collect public evidence",
    description: "We gather evidence from pricing pages, docs, changelogs, and reviews across your competitors.",
    previewId: "collect",
  },
  {
    id: "normalize",
    stepLabel: "STEP 2",
    title: "Normalize",
    description: "Evidence is organized by type with recency indicators. We structure signals into a unified evidence base.",
    previewId: "normalize",
  },
  {
    id: "rank",
    stepLabel: "STEP 3",
    title: "Generate ranked bets",
    description: "Get prioritized strategic opportunities with citations, confidence scores, and defensibility metrics.",
    previewId: "rank",
  },
]

export function HowItWorksStepper() {
  return (
    <MarketingSection variant="muted" id="how-it-works">
      <MarketingContainer maxWidth="6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
            How it works
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Three steps from public evidence to ranked strategic bets.
          </p>
        </div>
        
        <StepsCarousel steps={steps} />
      </MarketingContainer>
    </MarketingSection>
  )
}

