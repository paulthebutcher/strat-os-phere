/**
 * Marketing Homepage
 * 
 * 4-act visual narrative:
 * 1. The mess — what decision-making looks like today
 * 2. The turning point — what Plinth changes
 * 3. The receipt — what you actually get out
 * 4. The advantage — why this compounds over time
 * 
 * Each section earns its vertical space and advances the story.
 * Background surfaces group narrative beats.
 */
import type { Metadata } from "next"
import { HeroWithPreview } from "@/components/marketing/HeroWithPreview"
import { CredibilityBar } from "@/components/marketing/CredibilityBar"
import { FinalCTABand } from "@/components/marketing/FinalCTABand"
import { Footer } from "@/components/marketing/Footer"
import { MarketingShell } from "@/components/marketing/MarketingShell"
import { ProblemSection } from "@/components/marketing/ProblemSection"
import { TheTurnSection } from "@/components/marketing/TheTurnSection"
import { TheFlowSection } from "@/components/marketing/TheFlowSection"
import { OutcomeExampleSection } from "@/components/marketing/OutcomeExampleSection"
import { WhyItHoldsUpSection } from "@/components/marketing/WhyItHoldsUpSection"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Clarity that holds up",
    description: "When the room is skeptical, evidence wins.",
    path: "/",
    ogVariant: "default",
    canonical: true,
  })
}

export default function MarketingHome() {
  return (
    <MarketingShell>
      <main className="marketing-landing min-h-screen">
        {/* Hero: The Moment Before the Meeting */}
        <HeroWithPreview />
        
        {/* Credibility Bar: Quiet enterprise signal */}
        <CredibilityBar />
        
        {/* Act 1: The Mess — What decision-making looks like today */}
        <ProblemSection />
        
        {/* Act 2: The Turning Point — What Plinth changes */}
        <TheTurnSection />
        
        {/* What you walk into the room with: Outcome-focused section */}
        <TheFlowSection />
        
        {/* Act 3: The Receipt — What you actually get out */}
        <OutcomeExampleSection />
        
        {/* Act 4: The Advantage — Why this compounds over time */}
        <WhyItHoldsUpSection />
        
        {/* Final CTA: Invite, Don't Sell */}
        <FinalCTABand />
        
        <Footer />
      </main>
    </MarketingShell>
  )
}

