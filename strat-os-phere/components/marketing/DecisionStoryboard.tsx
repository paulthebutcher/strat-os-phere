/**
 * Decision Storyboard Section
 * 
 * Horizontal visual flow showing how a decision takes shape.
 * [Raw inputs] → [Evidence collected] → [Opportunities ranked] → [Decision Brief]
 * Each step is a small screenshot or cropped UI with 1-line caption.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

// Step 1: Raw inputs
function Step1Visual() {
  return (
    <div className="bg-white rounded-lg border border-border-subtle p-4 min-h-[120px] flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-xs sm:text-sm text-text-secondary italic max-w-[200px]">
          "Three competitors now offer SSO in their enterprise tiers..."
        </p>
        <Badge variant="secondary" className="text-[10px]">
          Raw input
        </Badge>
      </div>
    </div>
  )
}

// Step 2: Evidence collected
function Step2Visual() {
  const sources = [
    { type: "Pricing", domain: "competitor-a.com" },
    { type: "Docs", domain: "competitor-b.com" },
    { type: "Reviews", domain: "review-site.com" },
  ]

  return (
    <div className="bg-white rounded-lg border border-border-subtle p-3 space-y-2 min-h-[120px] flex flex-col justify-center">
      {sources.map((source, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 text-xs"
        >
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 shrink-0">
            {source.type}
          </Badge>
          <span className="text-text-secondary truncate">
            {source.domain}
          </span>
        </div>
      ))}
    </div>
  )
}

// Step 3: Opportunities ranked
function Step3Visual() {
  return (
    <div className="bg-white rounded-lg border border-border-subtle p-3 space-y-2 min-h-[120px] flex flex-col justify-center">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-text-primary">1.</span>
        <span className="text-xs text-text-secondary">Free tier expansion</span>
        <Badge variant="secondary" className="text-[10px] ml-auto">92%</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-text-primary">2.</span>
        <span className="text-xs text-text-secondary">API-first positioning</span>
        <Badge variant="secondary" className="text-[10px] ml-auto">85%</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-text-primary">3.</span>
        <span className="text-xs text-text-secondary">Team collaboration</span>
        <Badge variant="secondary" className="text-[10px] ml-auto">78%</Badge>
      </div>
    </div>
  )
}

// Step 4: Decision Brief
function Step4Visual() {
  return (
    <div className="bg-white rounded-lg border border-border-subtle p-3 space-y-2 min-h-[120px] flex flex-col justify-center">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-text-primary">Recommendation</p>
        <p className="text-[10px] text-text-secondary">Ship SSO in Q2</p>
      </div>
      <div className="pt-2 border-t border-border-subtle">
        <p className="text-[10px] text-text-muted">
          Would change if: competitor pricing shifts
        </p>
      </div>
    </div>
  )
}

const steps = [
  {
    title: "Raw inputs",
    visual: <Step1Visual />,
  },
  {
    title: "Evidence collected",
    visual: <Step2Visual />,
  },
  {
    title: "Opportunities ranked",
    visual: <Step3Visual />,
  },
  {
    title: "Decision Brief",
    visual: <Step4Visual />,
  },
]

export function DecisionStoryboard() {
  return (
    <MarketingSection variant="muted" id="how-it-works">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-3">
              How a decision takes shape
            </h2>
          </div>
        </Reveal>

        {/* Horizontal flow */}
        <Reveal delay={60}>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-4 md:gap-6 shrink-0">
                <div className="flex flex-col items-center gap-3 min-w-[200px] md:min-w-[220px]">
                  <div className="w-full">
                    {step.visual}
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary text-center">
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-text-muted shrink-0 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

