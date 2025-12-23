/**
 * CTA Band Section
 * 
 * Enhanced with brand tokens for consistent styling and enterprise-grade appearance.
 * Full-bleed gradient treatment for strong visual separation.
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Backdrop } from "@/components/graphics"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

export function CTABand() {
  return (
    <MarketingSection variant="gradient" className="relative overflow-hidden">
      <Backdrop variant="section" density="medium" />
      <MarketingContainer maxWidth="4xl" className="relative z-10">
        <div className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-accent-primary/30",
          "bg-gradient-to-br from-accent-primary/15 via-accent-primary/8 to-surface",
          "p-12 text-center shadow-xl md:p-16"
        )}>
          <div className="space-y-6">
            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-text-primary">
              Get to your first opportunity in minutes.
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-text-secondary max-w-prose mx-auto">
              Start with a company + your decision. We'll do the research and give you ranked, defensible options.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-2">
              <Link href="/try">
                <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  Try Plinth
                </Button>
              </Link>
              <Link href="#sample-output">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-accent-primary/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  View sample output
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-text-muted max-w-md mx-auto">
              We'll never market to you using this email—only send a magic link to access your results securely.
            </p>
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

