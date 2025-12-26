/**
 * Marketing Homepage
 * 
 * 5-act visual narrative:
 * ACT I — The Problem: Decisions Without Shape
 * ACT II — The Stakes: Being Wrong Is Expensive
 * ACT III — The Shift: Evidence Creates Structure
 * ACT IV — The Outcome: A Defensible Call
 * ACT V — The Aftermath: What Changes When It Holds Up
 * 
 * Core Rule: Hero keeps the artifact demo. Everything else is narrative, symbolic, and compositional.
 * No UI screenshots below the hero. The product is the inevitable conclusion, not the subject.
 */
import type { Metadata } from "next"
import { HeroWithPreview } from "@/components/marketing/HeroWithPreview"
import { CredibilityBar } from "@/components/marketing/CredibilityBar"
import { FinalCTABand } from "@/components/marketing/FinalCTABand"
import { Footer } from "@/components/marketing/Footer"
import { MarketingShell } from "@/components/marketing/MarketingShell"
import { ProblemSection } from "@/components/marketing/ProblemSection"
import { TheTurnSection } from "@/components/marketing/TheTurnSection"
import { OutcomeExampleSection } from "@/components/marketing/OutcomeExampleSection"
import { WhyItHoldsUpSection } from "@/components/marketing/WhyItHoldsUpSection"
import { NotForEveryoneSection } from "@/components/marketing/NotForEveryoneSection"
import { StructureEmergingSection } from "@/components/marketing/StructureEmergingSection"
import { EditorialBreak } from "@/components/marketing/layout/EditorialBreak"
import { AuthoritativeInterrupt } from "@/components/marketing/layout/AuthoritativeInterrupt"
import { PaperSection } from "@/components/marketing/layout/PaperSection"
import { OffsetDivider } from "@/components/marketing/layout/OffsetDivider"
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
        {/* Hero: The Artifact Demo (Only UI on Page) */}
        <HeroWithPreview />
        
        {/* Credibility Bar: Quiet enterprise signal */}
        <CredibilityBar />
        
        {/* ACT I — The Problem: Decisions Without Shape */}
        <ProblemSection />
        
        {/* Authoritative Interrupt: Hard scroll stop */}
        <AuthoritativeInterrupt>
          Strategy without evidence is just opinion
        </AuthoritativeInterrupt>
        
        {/* ACT II — The Stakes: Being Wrong Is Expensive */}
        <TheTurnSection />
        
        {/* Authoritative Interrupt: Hard scroll stop */}
        <AuthoritativeInterrupt>
          The cost of being wrong compounds
        </AuthoritativeInterrupt>
        
        {/* ACT III — The Shift: Evidence Creates Structure */}
        <StructureEmergingSection />
        
        {/* Editorial Break: Typographic Moment */}
        <EditorialBreak caption="Evidence replaces debate">
          This is where opinions end
        </EditorialBreak>
        
        {/* ACT IV — The Outcome: A Defensible Call */}
        <OutcomeExampleSection />
        
        {/* Authoritative Interrupt: Hard scroll stop */}
        <AuthoritativeInterrupt>
          When evidence holds up, decisions stick
        </AuthoritativeInterrupt>
        
        {/* ACT V — The Aftermath: What Changes When It Holds Up */}
        <WhyItHoldsUpSection />
        
        {/* Deliberately Challenging Section: Not For Everyone */}
        <NotForEveryoneSection />
        
        {/* Final CTA: Narrative Conclusion */}
        <FinalCTABand />
        
        <Footer />
      </main>
    </MarketingShell>
  )
}

