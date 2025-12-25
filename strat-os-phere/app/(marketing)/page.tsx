/**
 * Marketing Homepage
 * 
 * Single cohesive, visual-first narrative (preview-driven).
 * One continuous story: Input → Evidence → Ranked opportunities → Decision Brief → Action
 * 
 * Pure marketing page with NO auth dependencies, NO Supabase, NO server actions.
 * All previews are static "blue sky" components using sample data.
 */
import type { Metadata } from "next"
import Link from "next/link"
import { HeroWithPreview } from "@/components/marketing/HeroWithPreview"
import { NarrativeStep } from "@/components/marketing/NarrativeStep"
import { ProjectSetupPreview } from "@/components/marketing/previews/ProjectSetupPreview"
import { EvidenceTablePreview } from "@/components/marketing/previews/EvidenceTablePreview"
import { OpportunitiesRankedPreview } from "@/components/marketing/previews/OpportunitiesRankedPreview"
import { ConfidenceBoundariesPreview } from "@/components/marketing/previews/ConfidenceBoundariesPreview"
import { NextStepsPreview } from "@/components/marketing/previews/NextStepsPreview"
import { FinalCTABand } from "@/components/marketing/FinalCTABand"
import { Footer } from "@/components/marketing/Footer"
import { MarketingShell } from "@/components/marketing/MarketingShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { Button } from "@/components/ui/button"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Make decisions you can defend",
    description: "Plinth turns public market evidence into ranked opportunities with explicit confidence boundaries.",
    path: "/",
    ogVariant: "default",
    canonical: true,
  })
}

export default function MarketingHome() {
  return (
    <MarketingShell>
      <main className="marketing-landing min-h-screen">
        {/* 1. Hero: "Make decisions you can defend" */}
        <HeroWithPreview />
        
        {/* 2. "Start with a hunch" */}
        <NarrativeStep
          title="Start with a hunch"
          copy="Start with an idea, a competitor set, or a market question."
          image={<ProjectSetupPreview />}
          alignment="right"
          artifactTitle="Project Input"
          artifactSubtitle="One page. Defensible call. Sources included."
          receiptCallouts={[
            { label: "Decision question is explicit" },
            { label: "Market context included" }
          ]}
        />
        
        {/* 3. Evidence section */}
        <NarrativeStep
          title="Here's how a decision actually comes together"
          copy="Every claim has a source you can open and share."
          image={<EvidenceTablePreview />}
          alignment="left"
          artifactTitle="Evidence Attached"
          artifactSubtitle="One page. Defensible call. Sources included."
          receiptCallouts={[
            { label: "Evidence attached" },
            { label: "Sources are inspectable" },
            { label: "Citations included" }
          ]}
        />
        
        {/* 4. Opportunities section */}
        <NarrativeStep
          title="Opportunities, ranked"
          copy="Not a list of ideas — a prioritized shortlist based on signal strength."
          image={<OpportunitiesRankedPreview />}
          alignment="right"
          artifactTitle="Ranked Opportunities"
          artifactSubtitle="One page. Defensible call. Sources included."
          receiptCallouts={[
            { label: "Ranking is explicit" },
            { label: "Why it ranks" },
            { label: "Evidence strength shown" }
          ]}
        />
        
        {/* Mid-page soft CTA */}
        <MarketingSection variant="muted">
          <MarketingContainer maxWidth="4xl">
            <div className="text-center space-y-4">
              <p className="text-lg text-text-secondary">
                Curious what this looks like for your market?
              </p>
              <Link href="/new">
                <Button variant="outline" size="lg" className="border-2">
                  Try it with your idea →
                </Button>
              </Link>
            </div>
          </MarketingContainer>
        </MarketingSection>
        
        {/* 5. Confidence section */}
        <NarrativeStep
          title="Confidence boundaries (what's safe to act on)"
          copy="Shows what's supported, what's uncertain, and what would change the recommendation."
          image={<ConfidenceBoundariesPreview />}
          alignment="left"
          framingLine="Most tools give you ideas. Plinth shows what's safe to act on."
          artifactTitle="Decision Receipt"
          artifactSubtitle="One page. Defensible call. Sources included."
          receiptCallouts={[
            { label: "Confidence is explicit" },
            { label: "What changes the call" }
          ]}
        />
        
        {/* 6. Next moves section */}
        <NarrativeStep
          title="Next moves (action, not analysis)"
          copy="Clear actions to increase confidence — customer checks, competitive scans, and tests."
          image={<NextStepsPreview />}
          alignment="right"
          artifactTitle="Next Steps"
          artifactSubtitle="One page. Defensible call. Sources included."
          receiptCallouts={[
            { label: "Action, not analysis" },
            { label: "Clear validation steps" }
          ]}
        />
        
        {/* 7. Final CTA */}
        <FinalCTABand />
        
        <Footer />
      </main>
    </MarketingShell>
  )
}

