/**
 * Marketing Homepage
 * 
 * Pure marketing page with NO auth dependencies, NO Supabase, NO server actions.
 * All previews are static "blue sky" components using sample data.
 */
import type { Metadata } from "next"
import { Hero } from "@/components/marketing/Hero"
import { CredibilitySection } from "@/components/marketing/sections/CredibilitySection"
import { OutputPreviewSection } from "@/components/marketing/sections/OutputPreviewSection"
import { WhoItsForSection } from "@/components/marketing/sections/WhoItsForSection"
import { ProblemOutcome } from "@/components/marketing/ProblemOutcome"
import { HowItWorksStepper } from "@/components/marketing/HowItWorksStepper"
import { WhatYouGetSection } from "@/components/marketing/WhatYouGetSection"
import { ExampleOutput } from "@/components/marketing/ExampleOutput"
import { TrustMethod } from "@/components/marketing/TrustMethod"
import { MiniFAQ } from "@/components/marketing/MiniFAQ"
import { FinalCTABand } from "@/components/marketing/FinalCTABand"
import { Footer } from "@/components/marketing/Footer"
import { MarketingShell } from "@/components/marketing/MarketingShell"
import { createPageMetadata } from "@/lib/seo/metadata"
import { microcopy } from "@/lib/copy/microcopy"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Plinth — Decide where to invest next",
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
        {/* 1. Hero */}
        <Hero />
        
        {/* 2. Credibility Section */}
        <CredibilitySection />
        
        {/* 3. Output Preview Section */}
        <OutputPreviewSection />
        
        {/* 4. Who It's For Section */}
        <WhoItsForSection />
        
        {/* 5. Problem → Outcome */}
        <ProblemOutcome />
        
        {/* 6. How it works */}
        <HowItWorksStepper />
        
        {/* 7. What you get */}
        <WhatYouGetSection />
        
        {/* 8. Example output */}
        <ExampleOutput />
        
        {/* 9. Trust / Method */}
        <TrustMethod />
        
        {/* 10. Mini FAQ */}
        <MiniFAQ />
        
        {/* 11. Final CTA */}
        <FinalCTABand />
        
        <Footer />
      </main>
    </MarketingShell>
  )
}

