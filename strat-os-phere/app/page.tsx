import { Hero } from "@/components/marketing/Hero"
import { Problem } from "@/components/marketing/Problem"
import { Features } from "@/components/marketing/Features"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { Outputs } from "@/components/marketing/Outputs"
import { Differentiators } from "@/components/marketing/Differentiators"
import { WhoItsFor } from "@/components/marketing/WhoItsFor"
import { Trust } from "@/components/marketing/Trust"
import { SocialProof } from "@/components/marketing/SocialProof"
import { CTABand } from "@/components/marketing/CTABand"
import { Footer } from "@/components/marketing/Footer"

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <Features />
      <HowItWorks />
      <Outputs />
      <Differentiators />
      <WhoItsFor />
      <Trust />
      <SocialProof />
      <CTABand />
      <Footer />
    </main>
  )
}
