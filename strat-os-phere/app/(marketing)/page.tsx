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
        />
        
        {/* 3. "We collect evidence you can inspect" */}
        <NarrativeStep
          title="We collect evidence you can inspect"
          copy="Every claim has a source you can open and share."
          image={<EvidenceTablePreview />}
          alignment="left"
        />
        
        {/* 4. "Opportunities, ranked" */}
        <NarrativeStep
          title="Opportunities, ranked"
          copy="Not a list of ideas — a prioritized shortlist based on signal strength."
          image={<OpportunitiesRankedPreview />}
          alignment="right"
        />
        
        {/* 5. "Confidence boundaries (what's safe to act on)" */}
        <NarrativeStep
          title="Confidence boundaries (what's safe to act on)"
          copy="Plinth shows what's supported, what's uncertain, and what would change the recommendation."
          image={<ConfidenceBoundariesPreview />}
          alignment="left"
        />
        
        {/* 6. "Next moves (action, not analysis)" */}
        <NarrativeStep
          title="Next moves (action, not analysis)"
          copy="Clear actions to increase confidence — customer checks, competitive scans, and tests."
          image={<NextStepsPreview />}
          alignment="right"
        />
        
        {/* 7. Final CTA */}
        <FinalCTABand />
        
        <Footer />
      </main>
    </MarketingShell>
  )
}

