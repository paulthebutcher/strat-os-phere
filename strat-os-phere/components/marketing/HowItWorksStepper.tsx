/**
 * Decisions You Can Defend Section
 * 
 * Visual-first progression showing how a hunch becomes a defendable call.
 * Each step anchored to a visual, not more words.
 * Enhanced with icons and interactive visual flow.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal, Stagger } from "./motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Lightbulb, Search, TrendingUp, ArrowRight } from "lucide-react"
import { sampleAnalysis } from "./sampleReadoutData"

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
  const sources = sampleAnalysis.evidence.sources.slice(0, 3).map(source => ({
    type: source.type,
    domain: source.domain
  }))

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
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <span>Exploratory</span>
        <span className="text-text-muted">→</span>
        <span>Directional</span>
        <span className="text-text-muted">→</span>
        <span className="font-semibold text-text-primary">Investment-ready</span>
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
    title: "Bring Your Hunch",
    description: "Start with what you think might be true",
    icon: Lightbulb,
    visual: <Step1Visual />,
  },
  {
    stepNumber: 2,
    title: "Collect Evidence",
    description: "We gather real sources and citations",
    icon: Search,
    visual: <Step2Visual />,
  },
  {
    stepNumber: 3,
    title: "Rank Opportunities",
    description: "Prioritized by evidence strength and market signals",
    icon: TrendingUp,
    visual: <Step3Visual />,
  },
  {
    stepNumber: 4,
    title: "See Confidence",
    description: "Clear next steps and what would change the call",
    icon: ArrowRight,
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
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Reveal key={index} delay={index * 60}>
                <div className="flex flex-col h-full">
                  {/* Step number and icon */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-primary/10 border border-accent-primary/20">
                      <Icon className="w-5 h-5 text-accent-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Step {step.stepNumber}
                    </span>
                  </div>
                  
                  {/* Visual */}
                  <div className="mb-4 flex-1">
                    {step.visual}
                  </div>
                  
                  {/* Title and description */}
                  <h3 className="text-lg font-semibold mb-2 text-text-primary">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {step.description}
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

