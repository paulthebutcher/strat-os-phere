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
import { Reveal } from "./motion"

const steps: StepItem[] = [
  {
    id: "collect",
    stepLabel: "STEP 1",
    title: "Collect public market evidence",
    description: "Pricing, docs, changelogs, reviews",
    previewId: "collect",
  },
  {
    id: "normalize",
    stepLabel: "STEP 2",
    title: "Normalize signals into comparable claims",
    description: "Structure signals into a unified evidence base",
    previewId: "normalize",
  },
  {
    id: "rank",
    stepLabel: "STEP 3",
    title: "Generate opportunities with citations + confidence boundaries",
    description: "Prioritized strategic opportunities with explicit confidence levels",
    previewId: "rank",
  },
]

export function HowItWorksStepper() {
  return (
    <MarketingSection variant="muted" id="how">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
              How Plinth works
            </h2>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <StepsCarousel steps={steps} />
        </Reveal>
        
        {/* Optional note */}
        <Reveal delay={120}>
          <div className="mt-8 text-center">
            <p className="text-sm text-text-muted italic max-w-xl mx-auto">
              Plinth won't pretend the evidence is stronger than it is.
            </p>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

