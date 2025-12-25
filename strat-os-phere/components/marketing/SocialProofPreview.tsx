/**
 * Social Proof Preview Section
 * 
 * Fictional AI-generated testimonials for layout and tone preview.
 * Explicitly labeled as fictional to avoid deception.
 * 
 * Guardrail: SOCIAL_PROOF_IS_FICTIONAL flag ensures we never accidentally ship as real.
 */
"use client"

import { Badge } from "@/components/ui/badge"
import { Collapsible } from "@/components/ui/collapsible"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal, Stagger } from "./motion"
import { cn } from "@/lib/utils"

// Guardrail: Explicit flag to prevent accidental shipping as real testimonials
const SOCIAL_PROOF_IS_FICTIONAL = true

interface TestimonialCard {
  quote: string
  role: string
  companyType: string
  outcomeTag: string
}

const fictionalTestimonials: TestimonialCard[] = [
  {
    quote: "This was the first time we could point to sources, articulate assumptions, and still walk out with a call. Uncomfortable—but useful.",
    role: "VP Product",
    companyType: "B2B SaaS",
    outcomeTag: "Decision credibility",
  },
  {
    quote: "We stopped arguing about 'interesting.' The output made it obvious what was safe to prioritize now vs what needed more evidence.",
    role: "Head of Strategy",
    companyType: "Fintech",
    outcomeTag: "Confidence boundaries",
  },
  {
    quote: "The 'why this ranks' section saved us hours. Even the skeptics could see what signals drove the recommendation.",
    role: "Director, UX + Research",
    companyType: "Marketplace",
    outcomeTag: "Explainable ranking",
  },
]

export function SocialProofPreview() {
  if (!SOCIAL_PROOF_IS_FICTIONAL) {
    // Guardrail: If flag is false, don't render (should never happen in production)
    return null
  }

  return (
    <MarketingSection variant="default" id="social-proof-preview">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
                What teams say when the output holds up
              </h2>
              {SOCIAL_PROOF_IS_FICTIONAL && (
                <Badge 
                  variant="muted" 
                  className="text-xs font-medium px-2 py-0.5 bg-muted/50 text-muted-foreground border-border-subtle"
                >
                  Preview
                </Badge>
              )}
            </div>
            <p className="text-base text-text-secondary mb-4 max-w-2xl mx-auto">
              A preview of future testimonials, shown here as fictional examples to illustrate the tone and outcomes.
            </p>
            {SOCIAL_PROOF_IS_FICTIONAL && (
              <p className="text-sm text-text-muted italic max-w-2xl mx-auto">
                Preview only: The quotes below are AI-generated fictional examples—not real customer testimonials.
              </p>
            )}
          </div>
        </Reveal>

        {/* Testimonial cards grid */}
        <Stagger stagger={60} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {fictionalTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className={cn(
                "bg-white rounded-xl border border-border-subtle p-6 shadow-sm",
                "flex flex-col"
              )}
            >
              {/* Quote */}
              <p className="text-sm leading-relaxed text-text-primary mb-6 flex-grow">
                "{testimonial.quote}"
              </p>

              {/* Footer with role, company, tag, and disclaimer */}
              <div className="space-y-3 pt-4 border-t border-border-subtle">
                <div>
                  <p className="text-xs font-medium text-text-primary">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {testimonial.companyType}
                  </p>
                </div>
                <Badge 
                  variant="muted" 
                  className="text-xs font-medium px-2 py-0.5 bg-accent-primary/10 text-accent-primary border-accent-primary/20"
                >
                  {testimonial.outcomeTag}
                </Badge>
                {SOCIAL_PROOF_IS_FICTIONAL && (
                  <p className="text-xs text-text-muted italic">
                    Fictional preview (AI-generated)
                  </p>
                )}
              </div>
            </div>
          ))}
        </Stagger>

        {/* Why this section exists - collapsible */}
        <Reveal delay={120}>
          <div className="max-w-2xl mx-auto">
            <Collapsible 
              title="Why are these fictional?" 
              defaultOpen={false}
              className="text-center"
            >
              <p className="text-sm text-text-secondary leading-relaxed">
                We're still early. This section previews how social proof will appear once we have real customer outcomes. Until then, we're keeping it transparent.
              </p>
            </Collapsible>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

