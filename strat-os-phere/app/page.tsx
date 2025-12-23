import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { ArtifactPreviewHero } from "@/components/marketing/ArtifactPreviewHero"
import { SocialProof } from "@/components/marketing/SocialProof"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { SampleOutput } from "@/components/marketing/SampleOutput"
import { TrustTiles } from "@/components/marketing/TrustTiles"
import { CTABand } from "@/components/marketing/CTABand"
import { Footer } from "@/components/marketing/Footer"
import { StickyCTA } from "@/components/marketing/StickyCTA"
import { MarketingShell } from "@/components/marketing/MarketingShell"
import { ProofStrip } from "@/components/marketing/ProofStrip"
import { InteractivePreview } from "@/components/marketing/InteractivePreview"
import { FileText, Clock, Share2 } from "lucide-react"
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
        <ArtifactPreviewHero />
        <ProofStrip
          items={[
            {
              icon: FileText,
              label: "Evidence grouped by type",
              description: "Pricing, docs, reviews, and more",
            },
            {
              icon: Clock,
              label: "Recency signals",
              description: "Know what's current",
            },
            {
              icon: Share2,
              label: "Links to sources",
              description: "For verification",
            },
            {
              icon: FileText,
              label: "Citations included",
              description: "Always traceable",
            },
          ]}
        />
        <SocialProof />
        <div className="w-full py-16 md:py-24 bg-background border-t border-border-subtle">
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl">
            <InteractivePreview />
          </div>
        </div>
        <HowItWorks />
        <SampleOutput />
        <TrustTiles />
        <CTABand />
        <Footer />
        <StickyCTA />
      </main>
    </MarketingShell>
  )
}
