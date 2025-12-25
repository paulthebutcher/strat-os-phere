/**
 * How It Works Section
 * 
 * Notion-style carousel with single-word headlines and progressive visual proof.
 * 4 slides: Frame, Scan, Weigh, Decide
 */
import { Section } from "./Section"
import { HowItWorksCarousel } from "./HowItWorksCarousel"

export function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      title="How it works"
      description="A step-by-step mental model of how a real decision forms"
      tone="default"
    >
      <HowItWorksCarousel />
    </Section>
  )
}

