/**
 * Marketing Homepage
 * 
 * Story-driven flow that makes Plinth's value immediately obvious, tangible, and credible.
 * Narrative progression: Problem → Solution → Proof → Outcomes → Decision Makers → CTA
 * 
 * Pure marketing page with NO auth dependencies, NO Supabase, NO server actions.
 * All previews are static "blue sky" components using sample data.
 */
import type { Metadata } from "next"
import { HeroWithPreview } from "@/components/marketing/HeroWithPreview"
import { FinalCTABand } from "@/components/marketing/FinalCTABand"
import { Footer } from "@/components/marketing/Footer"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { MarketingShell } from "@/components/marketing/MarketingShell"
import { ProblemPromiseSection } from "@/components/marketing/ProblemPromiseSection"
import { ProofSection } from "@/components/marketing/ProofSection"
import { OutcomeExampleSection } from "@/components/marketing/OutcomeExampleSection"
import { BuiltForDecisionMakersSection } from "@/components/marketing/BuiltForDecisionMakersSection"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Stand behind your strategy",
    description: "Evidence-backed insights that hold up in real conversations — not just docs.",
    path: "/",
    ogVariant: "default",
    canonical: true,
  })
}

export default function MarketingHome() {
  return (
    <MarketingShell>
      <main className="marketing-landing min-h-screen">
        {/* 1. Hero: "Stand behind your strategy" */}
        <HeroWithPreview />
        
        {/* 2. How it works carousel */}
        <HowItWorks />
        
        {/* 3. Problem → Plinth's Unique Promise */}
        <ProblemPromiseSection />
        
        {/* 4. Proof → What You Actually Get */}
        <ProofSection />
        
        {/* 5. Outcome Example */}
        <OutcomeExampleSection />
        
        {/* 6. Built for Real Decision Makers */}
        <BuiltForDecisionMakersSection />
        
        {/* 7. Final CTA */}
        <FinalCTABand />
        
        <Footer />
      </main>
    </MarketingShell>
  )
}

