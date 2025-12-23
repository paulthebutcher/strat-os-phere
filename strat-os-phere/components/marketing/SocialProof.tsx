/**
 * Social Proof Section
 * 
 * Design tokens used:
 * - panel: Card styling for testimonials
 * - surface-muted: Logo placeholder background
 * - accent-primary: Avatar placeholder background
 * 
 * Enhanced with avatar placeholders and improved testimonial card styling.
 */
import { Section } from "./Section"
import { cn } from "@/lib/utils"

export function SocialProof() {
  return (
    <Section
      title="Built for experienced strategists"
      description="Designed to support VP+ decision-making workflows. Plinth gives you the clarity and defensibility you need to make hard calls with confidence."
      tone="default"
    >
      <div className="max-w-4xl mx-auto mt-12">
        <div className={cn(
          "panel inline-block p-6 md:p-8 border-2 border-border-subtle rounded-2xl shadow-sm"
        )}>
          <p className="text-sm font-semibold uppercase tracking-wider text-text-muted md:text-base">
            Early access
          </p>
          <p className="mt-2 text-base text-text-secondary md:text-lg">
            Currently in early access. Built for Product/UX strategy professionals who need decision-ready outputs.
          </p>
        </div>
      </div>
    </Section>
  )
}

