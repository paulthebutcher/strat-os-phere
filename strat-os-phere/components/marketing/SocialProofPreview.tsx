/**
 * Enterprise Credibility Section
 * 
 * Signals rigor without enterprise-only language.
 * Reassures enterprises but still makes sense for founders.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal, Stagger } from "./motion"
import { cn } from "@/lib/utils"

const trustPoints = [
  "Shows sources for every claim",
  "Makes uncertainty visible (not hidden)",
  "Fails closed when evidence is thin",
]

export function EnterpriseCredibility() {
  return (
    <MarketingSection variant="default" id="trust">
      <MarketingContainer maxWidth="4xl">
        <Reveal>
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
              Built for decisions that have consequences
            </h2>
          </div>
        </Reveal>
        
        <Stagger stagger={60} className="max-w-2xl mx-auto space-y-4">
          {trustPoints.map((point, index) => (
            <Reveal key={index} delay={index * 60}>
              <div className="flex items-start gap-3">
                <span className="text-text-secondary text-sm mt-0.5">•</span>
                <p className="text-base text-text-secondary flex-1">
                  {point}
                </p>
              </div>
            </Reveal>
          ))}
        </Stagger>
      </MarketingContainer>
    </MarketingSection>
  )
}

