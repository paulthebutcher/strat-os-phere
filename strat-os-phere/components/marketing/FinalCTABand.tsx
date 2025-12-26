/**
 * Final CTA — Return to the Moment
 * 
 * Full hero screenshot again (slightly smaller)
 */
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal, HoverLift } from "./motion"
import { HeroMoment } from "./HeroMoment"

export function FinalCTABand() {
  return (
    <MarketingSection variant="gradient" className="relative overflow-hidden">
      <MarketingContainer maxWidth="5xl" className="relative z-10">
        <Reveal>
          <div className="space-y-8 sm:space-y-10">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
                See where you're ahead
              </h2>
            </div>
            
            {/* Hero screenshot (slightly smaller) */}
            <div className="max-w-4xl mx-auto">
              <div className="shadow-2xl rounded-xl overflow-hidden">
                <HeroMoment variant="full" />
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-2">
              <Link href="/new" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="brand"
                  className={cn(
                    "w-full sm:w-auto shadow-lg",
                    HoverLift.className
                  )}
                >
                  Pressure-test an idea →
                </Button>
              </Link>
            </div>
            <p className="text-sm md:text-base text-text-muted text-center pt-2">
              Takes ~2 minutes. No login required.
            </p>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

