/**
 * What You Get Section
 * 
 * Compact outputs section showing 3 key deliverables with icons.
 */
"use client"

import { MarketingSection } from "../MarketingSection"
import { MarketingContainer } from "../MarketingContainer"
import { Reveal, Stagger } from "../motion"
import { cn } from "@/lib/utils"
import { TrendingUp, FileText, ArrowRight } from "lucide-react"

const outputs = [
  {
    title: "Opportunities, ranked",
    description: "Not a list of ideas: a prioritized shortlist",
    icon: TrendingUp,
  },
  {
    title: "Evidence attached",
    description: "Sources you can open and share",
    icon: FileText,
  },
  {
    title: "Clear next moves",
    description: "What to do now, and what would increase confidence",
    icon: ArrowRight,
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
          {outputs.map((output, index) => {
            const Icon = output.icon
            return (
              <Reveal key={index} delay={index * 60}>
                <div className={cn(
                  "bg-white rounded-xl border border-border-subtle p-6 shadow-sm",
                  "flex flex-col"
                )}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-primary/10 border border-accent-primary/20">
                      <Icon className="w-5 h-5 text-accent-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {output.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {output.description}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </Stagger>
      </MarketingContainer>
    </MarketingSection>
  )
}

