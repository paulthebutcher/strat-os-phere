/**
 * How It Works Stepper
 * 
 * Fullstory-style vertical stepper showing the 3-step process.
 * Clean, minimal design with preview images.
 */
import { Target, Search, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

const steps = [
  {
    icon: Target,
    title: "Define the decision context",
    description: "Describe what you're evaluating. We infer what signals to gather.",
  },
  {
    icon: Search,
    title: "Add competitors",
    description: "Select 3-7 competitors. We pull evidence from their public pages.",
  },
  {
    icon: TrendingUp,
    title: "Generate ranked opportunities",
    description: "Get prioritized strategic bets with citations, confidence, and defensibility scores.",
  },
]

export function HowItWorksStepper() {
  return (
    <MarketingSection variant="muted" id="how-it-works">
      <MarketingContainer maxWidth="5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
            How it works
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Three steps from decision context to ranked opportunities.
          </p>
        </div>
        
        <div className="relative">
          {/* Vertical line connector */}
          <div className="hidden md:block absolute left-6 top-0 bottom-0 w-0.5 bg-border-subtle"></div>
          
          <div className="space-y-12 md:space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isLast = index === steps.length - 1
              
              return (
                <div key={index} className="relative">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Icon + connector */}
                    <div className="flex items-start gap-4 md:gap-6">
                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-primary/10 border-2 border-accent-primary/20">
                        <Icon className="h-6 w-6 text-accent-primary" />
                      </div>
                      {!isLast && (
                        <div className="hidden md:block absolute left-6 top-12 w-0.5 h-full bg-border-subtle"></div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-accent-primary uppercase tracking-wide">
                          Step {index + 1}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-semibold text-text-primary mb-3">
                        {step.title}
                      </h3>
                      <p className="text-base leading-relaxed text-text-secondary max-w-2xl">
                        {step.description}
                      </p>
                      
                      {/* Preview placeholder */}
                      <div className="mt-6 rounded-lg border border-border-subtle bg-surface-muted/50 p-8 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <div className="w-16 h-16 mx-auto rounded-lg bg-accent-primary/10 flex items-center justify-center">
                            <Icon className="h-8 w-8 text-accent-primary/50" />
                          </div>
                          <p className="text-xs text-text-muted">Preview</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

