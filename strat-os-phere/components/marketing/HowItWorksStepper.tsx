/**
 * Decisions You Can Defend Section
 * 
 * Visual-first progression showing how a hunch becomes a defendable call.
 * Each step anchored to a visual, not more words.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal, Stagger } from "./motion"
import { Badge } from "@/components/ui/badge"
import { ConfidencePill } from "./ConfidencePill"
import { cn } from "@/lib/utils"

// Step 1 Visual: Single sentence input
function Step1Visual() {
  return (
    <div className="bg-white rounded-lg border border-border-subtle p-3 sm:p-4 min-h-[80px] flex items-center">
      <p className="text-xs sm:text-sm text-text-secondary italic">
        "Three competitors now offer SSO in their enterprise tiers..."
      </p>
    </div>
  )
}

// Step 2 Visual: Stacked source pills
function Step2Visual() {
  const sources = [
    { type: "Pricing", domain: "competitor-a.com" },
    { type: "Docs", domain: "competitor-b.com" },
    { type: "Reviews", domain: "review-site.com" },
  ]

  return (
    <div className="space-y-2">
      {sources.map((source, idx) => (
        <div
          key={idx}
          className="bg-white rounded-lg border border-border-subtle p-2.5 sm:p-3 flex items-center gap-2"
        >
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 shrink-0">
            {source.type}
          </Badge>
          <span className="text-[10px] sm:text-xs text-text-secondary truncate">
            {source.domain}
          </span>
        </div>
      ))}
    </div>
  )
}

// Step 3 Visual: Confidence progression
function Step3Visual() {
  return (
    <div className="bg-white rounded-lg border border-border-subtle p-3 sm:p-4 space-y-2">
      <div className="flex items-center gap-2">
        <ConfidencePill level="exploratory" className="text-[10px] px-2 py-0.5" />
        <span className="text-[10px] text-text-muted">→</span>
        <ConfidencePill level="directional" className="text-[10px] px-2 py-0.5" />
        <span className="text-[10px] text-text-muted">→</span>
        <ConfidencePill level="investment_ready" className="text-[10px] px-2 py-0.5" />
      </div>
    </div>
  )
}

// Step 4 Visual: Next action block
function Step4Visual() {
  return (
    <div className="bg-white rounded-lg border border-border-subtle p-3 sm:p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="primary" className="text-[10px] px-2 py-0.5">
          Ship
        </Badge>
      </div>
      <p className="text-[10px] sm:text-xs text-text-muted">
        Would change if: competitor pricing shifts
      </p>
    </div>
  )
}

const steps = [
  {
    stepNumber: 1,
    title: "Start with a hunch",
    description: "What you think might be true",
    visual: <Step1Visual />,
  },
  {
    stepNumber: 2,
    title: "Ground it in evidence",
    description: "Claims tied to real sources",
    visual: <Step2Visual />,
  },
  {
    stepNumber: 3,
    title: "Make confidence explicit",
    description: "What's supported vs unknown",
    visual: <Step3Visual />,
  },
  {
    stepNumber: 4,
    title: "Get a next step",
    description: "What to do now—and what would change the call",
    visual: <Step4Visual />,
  },
]

export function DecisionsYouCanDefend() {
  return (
    <MarketingSection variant="muted" id="decisions">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-3">
              Decisions you can defend.
            </h2>
            <p className="text-base sm:text-lg text-text-secondary">
              When someone asks "why this?", you'll have an answer.
            </p>
          </div>
        </Reveal>
        
        <Stagger stagger={60} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <Reveal key={index} delay={index * 60}>
              <div className="flex flex-col">
                <div className="mb-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    {step.stepNumber}
                  </span>
                </div>
                
                {/* Visual */}
                <div className="mb-3">
                  {step.visual}
                </div>
                
                <h3 className="text-base font-semibold mb-2 text-text-primary">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </Stagger>
      </MarketingContainer>
    </MarketingSection>
  )
}

