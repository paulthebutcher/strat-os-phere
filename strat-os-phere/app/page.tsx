import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { Hero } from "@/components/marketing/Hero"
import { Problem } from "@/components/marketing/Problem"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { Outputs } from "@/components/marketing/Outputs"
import { Differentiators } from "@/components/marketing/Differentiators"
import { WhoItsFor } from "@/components/marketing/WhoItsFor"
import { Trust } from "@/components/marketing/Trust"
import { SocialProof } from "@/components/marketing/SocialProof"
import { CTABand } from "@/components/marketing/CTABand"
import { Footer } from "@/components/marketing/Footer"
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
    <main>
      <Hero />
      <Problem />
      <Outputs />
      <HowItWorks />
      <Differentiators />
      <WhoItsFor />
      <Trust />
      <SocialProof />
      <CTABand />
      <Footer />
    </main>
  )
}
