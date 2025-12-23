import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { Hero } from "@/components/marketing/Hero"
import { ProblemOutcome } from "@/components/marketing/ProblemOutcome"
import { HowItWorksStepper } from "@/components/marketing/HowItWorksStepper"
import { BentoFeatureGrid } from "@/components/marketing/BentoFeatureGrid"
import { TrustMethod } from "@/components/marketing/TrustMethod"
import { FinalCTABand } from "@/components/marketing/FinalCTABand"
import { Footer } from "@/components/marketing/Footer"
import { MarketingShell } from "@/components/marketing/MarketingShell"
import { createPageMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Plinth — Competitive analysis that ends in a decision",
    description:
      "Turn competitor signals into decision-ready outputs: Jobs-to-be-Done, scorecards, opportunities, and Strategic Bets—backed by live evidence and citations.",
    path: "/",
    ogVariant: "default",
    canonical: true,
  });
}

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Home(props: HomeProps) {
  const searchParams = await props.searchParams
  
  // If magic link lands on / instead of /auth/callback, redirect to callback
  // This handles cases where Supabase Site URL is set to root domain
  const code = searchParams.code as string | undefined
  const tokenHash = searchParams.token_hash as string | undefined
  const type = searchParams.type as string | undefined
  
  // Check if this is a magic link callback that landed on root
  if (code || (tokenHash && type)) {
    const callbackUrl = new URL("/auth/callback", "http://localhost")
    if (code) callbackUrl.searchParams.set("code", code)
    if (tokenHash) callbackUrl.searchParams.set("token_hash", tokenHash)
    if (type) callbackUrl.searchParams.set("type", type)
    callbackUrl.searchParams.set("next", "/dashboard")
    
    // Redirect to proper callback route
    redirect(callbackUrl.pathname + callbackUrl.search)
  }

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
        
        {/* 5. Trust / Method */}
        <TrustMethod />
        
        {/* 6. Final CTA */}
        <FinalCTABand />
        
        <Footer />
      </main>
    </MarketingShell>
  )
}
