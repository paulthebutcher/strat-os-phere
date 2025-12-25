/**
 * Example Page
 * 
 * Annotated example of a Plinth opportunity output.
 * Shows how to read opportunities with citations, confidence, and next steps.
 */
import type { Metadata } from "next"
import Link from "next/link"
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { ExampleOpportunityArtifact } from "@/components/marketing/ExampleOpportunityArtifact"
import { Button } from "@/components/ui/button"
import { createPageMetadata } from "@/lib/seo/metadata"
import { EXAMPLE_OPPORTUNITIES } from "@/lib/examples/opportunities"

// Use the "directional" opportunity as our example
const exampleOpportunity = EXAMPLE_OPPORTUNITIES.find(
  (opp) => opp.confidenceLevel === "directional"
) || EXAMPLE_OPPORTUNITIES[1]

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "A real example",
    description:
      "Read a sample opportunity with evidence, confidence boundaries, and \"what would increase confidence.\"",
    path: "/example",
    ogVariant: "default",
    canonical: true,
    robots: {
      index: true,
      follow: true,
    },
  })
}

export default function ExamplePage() {
  return (
    <MarketingPageShell
      title="One opportunity, clearly bounded"
      eyebrow="Example"
      lead="An example of how Plinth ties recommendations to evidence — and calls out what would increase confidence."
    >
      <MarketingSection>
        <MarketingContainer maxWidth="4xl">
          <div className="bg-white border border-border-subtle rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 overflow-hidden">
            <ExampleOpportunityArtifact opportunity={exampleOpportunity} />
          </div>
        </MarketingContainer>
      </MarketingSection>

      {/* Custom CTA */}
      <MarketingSection variant="muted">
        <MarketingContainer maxWidth="4xl">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row pt-2">
              <Link href="/how-plinth-thinks" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto min-h-[44px]">
                  How Plinth thinks
                </Button>
              </Link>
              <Link href="/new" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto min-h-[44px]">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </MarketingContainer>
      </MarketingSection>
    </MarketingPageShell>
  )
}

