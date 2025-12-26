/**
 * Marketing Homepage
 * 
 * Image-first storytelling with clever, memorable copy that sticks.
 * Narrative arc: Hero → Problem → Turn → Flow → What You Get → Why It Holds Up → CTA
 * 
 * Goal: More "oh, I get it" moments. Fewer explanations. Plinth should feel obvious, not argued.
 * 
 * Pure marketing page with NO auth dependencies, NO Supabase, NO server actions.
 * All previews are static "blue sky" components using sample data.
 */
import type { Metadata } from "next"
import { HeroWithPreview } from "@/components/marketing/HeroWithPreview"
import { CredibilityBar } from "@/components/marketing/CredibilityBar"
import { FinalCTABand } from "@/components/marketing/FinalCTABand"
import { Footer } from "@/components/marketing/Footer"
import { MarketingShell } from "@/components/marketing/MarketingShell"
import { ProblemSection } from "@/components/marketing/ProblemSection"
import { TheTurnSection } from "@/components/marketing/TheTurnSection"
import { WhatPlinthDoesSection } from "@/components/marketing/WhatPlinthDoesSection"
import { TheFlowSection } from "@/components/marketing/TheFlowSection"
import { OutcomeExampleSection } from "@/components/marketing/OutcomeExampleSection"
import { WhyItHoldsUpSection } from "@/components/marketing/WhyItHoldsUpSection"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Clarity that holds up",
    description: "When the stakes are high and the room is skeptical, evidence beats instinct.",
    path: "/",
    ogVariant: "default",
    canonical: true,
  })
}

export default function MarketingHome() {
  return (
    <MarketingShell>
      <main className="marketing-landing min-h-screen">
        {/* 1. Hero: The Moment Before the Meeting */}
        <HeroWithPreview />
        
        {/* 1a. Credibility Bar: Quiet enterprise signal */}
        <CredibilityBar />
        
        {/* 2. "This Is the Problem" (Image-Led, Minimal Text) */}
        <ProblemSection />
        
        {/* 3. The Turn: What Changes with Plinth */}
        <TheTurnSection />
        
        {/* 3a. What Plinth Does — and Doesn't Do: Explicit guardrails */}
        <WhatPlinthDoesSection />
        
        {/* 4. The Flow (Keep It Fast, Visual, Punny) */}
        <TheFlowSection />
        
        {/* 5. What You Actually Get (No Dashboards Section) */}
        <OutcomeExampleSection />
        
        {/* 6. Why It Holds Up (Credibility Without Chest-Thumping) */}
        <WhyItHoldsUpSection />
        
        {/* 7. Final CTA: Invite, Don't Sell */}
        <FinalCTABand />
        
        <Footer />
      </main>
    </MarketingShell>
  )
}

