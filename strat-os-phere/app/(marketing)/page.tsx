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
import { HowItWorks } from "@/components/marketing/HowItWorks"
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
        
        {/* 2. How it works carousel */}
        <HowItWorks />
        
        {/* 3. "Start with a hunch" - Repositioned after carousel, reframed as input → output */}
        <NarrativeStep
          title="Start with a hunch. End with a decision you can defend."
          copy={
            <>
              <p className="mb-3">
                A market, a focus, and a real question are enough to generate an evidence-backed recommendation.
              </p>
              <p className="text-sm text-text-muted italic">
                You don't need perfect framing. Plinth pressure-tests the question for you.
              </p>
            </>
          }
          image={<ProjectSetupPreview />}
          alignment="right"
          artifactTitle="Minimal Input"
          artifactSubtitle="A starter prompt, not a workflow commitment."
          receiptCallouts={[
            { label: "Decision question is explicit" },
            { label: "Market context included" }
          ]}
          showOutputConnector={true}
          lighterWeight={true}
        />
        
        {/* 4. Evidence section */}
        <NarrativeStep
          title="Here's how a decision actually comes together"
          copy={
            <>
              <p className="mb-3">
                Every claim is sourced. Nothing is hand-wavy. No black-box conclusions.
              </p>
              <p className="text-sm text-text-muted">
                If the evidence doesn't support a strong recommendation, Plinth will say so.
              </p>
            </>
          }
          image={<EvidenceTablePreview />}
          alignment="left"
          artifactTitle="Evidence Sourced"
          artifactSubtitle="One page. Defensible call. Sources included."
          receiptCallouts={[
            { label: "Every claim is sourced" },
            { label: "Sources are inspectable" },
            { label: "Citations included" }
          ]}
        />
        
        {/* 5. Opportunities section */}
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
        
        {/* 6. Confidence section */}
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
        
        {/* 7. Next moves section */}
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
        
        {/* 8. Final CTA */}
        <FinalCTABand />
        
        <Footer />
      </main>
    </MarketingShell>
  )
}

