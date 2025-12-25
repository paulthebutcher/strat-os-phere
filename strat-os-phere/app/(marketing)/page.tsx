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
import { WhoIsThisFor } from "@/components/marketing/sections/WhoIsThisFor"
import { DecisionsYouCanDefend } from "@/components/marketing/HowItWorksStepper"
import { WhatYouGet } from "@/components/marketing/sections/WhatYouGet"
import { ExampleOutput } from "@/components/marketing/ExampleOutput"
import { EnterpriseCredibility } from "@/components/marketing/SocialProofPreview"
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
        
        {/* 2. Who is this for? */}
        <WhoIsThisFor />
        
        {/* 3. Decisions you can defend */}
        <DecisionsYouCanDefend />
        
        {/* 4. What you get */}
        <WhatYouGet />
        
        {/* 5. Example snippet */}
        <ExampleOutput />
        
        {/* 6. Enterprise credibility */}
        <EnterpriseCredibility />
        
        {/* 7. Final CTA */}
        <FinalCTABand />
        
        <Footer />
      </main>
    </MarketingShell>
  )
}

