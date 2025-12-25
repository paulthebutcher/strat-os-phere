/**
 * Marketing Homepage
 * 
 * Pure marketing page with NO auth dependencies, NO Supabase, NO server actions.
 * All previews are static "blue sky" components using sample data.
 * 
 * Product-led, visually diverse SaaS layout inspired by ClickUp, Notion, Linear, and Fullstory.
 * Every section features real product screenshots, storyboard-style flows, and full-width previews.
 */
import type { Metadata } from "next"
import { HeroWithPreview } from "@/components/marketing/HeroWithPreview"
import { WhoIsThisFor } from "@/components/marketing/sections/WhoIsThisFor"
import { DecisionStoryboard } from "@/components/marketing/DecisionStoryboard"
import { FullWidthProductPreview } from "@/components/marketing/FullWidthProductPreview"
import { EvidencePreviewGrid } from "@/components/marketing/EvidencePreviewGrid"
import { RankedOpportunitiesPreview } from "@/components/marketing/RankedOpportunitiesPreview"
import { ClearNextMoves } from "@/components/marketing/ClearNextMoves"
import { EnterpriseCredibility } from "@/components/marketing/SocialProofPreview"
import { FinalCTABand } from "@/components/marketing/FinalCTABand"
import { Footer } from "@/components/marketing/Footer"
import { MarketingShell } from "@/components/marketing/MarketingShell"
import { createPageMetadata } from "@/lib/seo/metadata"
import { microcopy } from "@/lib/copy/microcopy"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Find your unfair advantage",
    description: microcopy.marketing.heroSubhead,
    path: "/",
    ogVariant: "default",
    canonical: true,
  })
}

export default function MarketingHome() {
  return (
    <MarketingShell>
      <main className="marketing-landing min-h-screen">
        {/* 1. Hero with Product Preview */}
        <HeroWithPreview />
        
        {/* 2. Who is this for? */}
        <WhoIsThisFor />
        
        {/* 3. How a decision takes shape (Storyboard) */}
        <DecisionStoryboard />
        
        {/* 4. Full-width Decision Brief Preview */}
        <FullWidthProductPreview />
        
        {/* 5. Evidence as First-Class Artifact (Grid) */}
        <EvidencePreviewGrid />
        
        {/* 6. Ranked Opportunities Preview */}
        <RankedOpportunitiesPreview />
        
        {/* 7. Clear Next Moves */}
        <ClearNextMoves />
        
        {/* 8. Enterprise credibility */}
        <EnterpriseCredibility />
        
        {/* 9. Final CTA */}
        <FinalCTABand />
        
        <Footer />
      </main>
    </MarketingShell>
  )
}

