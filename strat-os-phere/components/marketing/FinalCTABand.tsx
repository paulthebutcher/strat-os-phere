/**
 * Final CTA — Narrative Conclusion
 * 
 * No UI previews. Only the hero section shows the artifact demo.
 * This is a clean, narrative conclusion that invites action.
 */
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal, HoverLift } from "./motion"

export function FinalCTABand() {
  return (
    <MarketingSection variant="gradient" className="relative overflow-hidden">
      <MarketingContainer maxWidth="5xl" className="relative z-10">
        <Reveal>
          <div className="space-y-8 sm:space-y-10">
            <div className="text-center space-y-4 max-w-[65ch] mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
                Get a clear answer in minutes
              </h2>
              <p className="text-base sm:text-lg text-text-secondary">
                See where you're ahead—and why it holds up when challenged.
              </p>
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
              <Link href="/example" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className={cn(
                    "w-full sm:w-auto border-2 hover:bg-accent-primary/5",
                    HoverLift.subtle
                  )}
                >
                  See a real readout →
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

