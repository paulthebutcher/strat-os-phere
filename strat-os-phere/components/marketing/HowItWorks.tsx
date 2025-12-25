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
      title="From hunch to clarity"
      description="How Plinth turns early intuition into evidence you can trust."
      tone="default"
    >
      <HowItWorksCarousel />
    </Section>
  )
}

