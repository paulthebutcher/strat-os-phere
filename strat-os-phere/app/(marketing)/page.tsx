/**
 * Marketing Homepage
 * 
 * Pure marketing page with NO auth dependencies, NO Supabase, NO server actions.
 * All previews are static "blue sky" components using sample data.
 */
import type { Metadata } from "next"
import { Hero } from "@/components/marketing/Hero"
import { ProblemOutcome } from "@/components/marketing/ProblemOutcome"
import { HowItWorksStepper } from "@/components/marketing/HowItWorksStepper"
import { BentoFeatureGrid } from "@/components/marketing/BentoFeatureGrid"
import { ExampleOutput } from "@/components/marketing/ExampleOutput"
import { TrustMethod } from "@/components/marketing/TrustMethod"
import { MiniFAQ } from "@/components/marketing/MiniFAQ"
import { FinalCTABand } from "@/components/marketing/FinalCTABand"
import { Footer } from "@/components/marketing/Footer"
import { MarketingShell } from "@/components/marketing/MarketingShell"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Plinth — Find your unfair advantage",
    description:
      "Plinth turns public market evidence into ranked strategic bets — with citations, confidence, and VP-ready framing. Decision credibility over AI novelty.",
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
        
        {/* 2. Problem → Outcome */}
        <ProblemOutcome />
        
        {/* 3. How it works */}
        <HowItWorksStepper />
        
        {/* 4. What you get */}
        <BentoFeatureGrid />
        
        {/* 5. Example output */}
        <ExampleOutput />
        
        {/* 6. Trust / Method */}
        <TrustMethod />
        
        {/* 7. Mini FAQ */}
        <MiniFAQ />
        
        {/* 8. Final CTA */}
        <FinalCTABand />
        
        <Footer />
      </main>
    </MarketingShell>
  )
}

