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
      title="From hunch to decision"
      description="How Plinth turns an initial hunch into a sourced, defensible recommendation. Quick flow that shows what you input, how Plinth processes it, and what you output."
      tone="default"
    >
      <HowItWorksCarousel />
    </Section>
  )
}

