/**
 * Marketing Homepage
 * 
 * Pure marketing page with NO auth dependencies, NO Supabase, NO server actions.
 * All previews are static "blue sky" components using sample data.
 * 
 * Single-lens positioning: confidence boundaries, not persona forks.
 */
import type { Metadata } from "next"
import { Hero } from "@/components/marketing/Hero"
import { ValueSection } from "@/components/marketing/sections/ValueSection"
import { HowItWorksStepper } from "@/components/marketing/HowItWorksStepper"
import { ConfidenceBoundaries } from "@/components/marketing/ConfidenceBoundaries"
import { ExampleOutput } from "@/components/marketing/ExampleOutput"
import { SocialProofPreview } from "@/components/marketing/SocialProofPreview"
import { FinalCTABand } from "@/components/marketing/FinalCTABand"
import { Footer } from "@/components/marketing/Footer"
import { MarketingShell } from "@/components/marketing/MarketingShell"
import { createPageMetadata } from "@/lib/seo/metadata"
import { microcopy } from "@/lib/copy/microcopy"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Find your unfair advantage — Plinth",
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
        
        {/* 2. What Plinth delivers */}
        <ValueSection />
        
        {/* 3. How it works */}
        <HowItWorksStepper />
        
        {/* 4. Confidence boundaries */}
        <ConfidenceBoundaries />
        
        {/* 5. Example output */}
        <ExampleOutput />
        
        {/* 6. Social proof preview */}
        <SocialProofPreview />
        
        {/* 7. Final CTA */}
        <FinalCTABand />
        
        <Footer />
      </main>
    </MarketingShell>
  )
}

