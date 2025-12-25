/**
 * What You Get Section
 * 
 * Compact outputs section showing 3 key deliverables.
 */
"use client"

import { MarketingSection } from "../MarketingSection"
import { MarketingContainer } from "../MarketingContainer"
import { Reveal, Stagger } from "../motion"
import { cn } from "@/lib/utils"

const outputs = [
  {
    title: "Opportunities, ranked",
    description: "Not a list of ideas: a prioritized shortlist",
  },
  {
    title: "Evidence attached",
    description: "Sources you can open and share",
  },
  {
    title: "Clear next moves",
    description: "What to do now, and what would increase confidence",
  },
]

export function WhatYouGet() {
  return (
    <MarketingSection variant="default" id="outputs">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
              What you get in minutes
            </h2>
          </div>
        </Reveal>
        
        <Stagger stagger={60} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {outputs.map((output, index) => (
            <Reveal key={index} delay={index * 60}>
              <div className={cn(
                "bg-white rounded-xl border border-border-subtle p-6 shadow-sm",
                "flex flex-col"
              )}>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {output.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {output.description}
                </p>
              </div>
            </Reveal>
          ))}
        </Stagger>
      </MarketingContainer>
    </MarketingSection>
  )
}

