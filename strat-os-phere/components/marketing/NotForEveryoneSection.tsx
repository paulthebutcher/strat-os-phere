/**
 * Deliberately Challenging Section
 * 
 * Names strategic anti-patterns and clarifies who Plinth is NOT built for.
 * 
 * Visual treatment:
 * - Tighter spacing and denser typography
 * - Creates contrast with calmer sections
 * - Signals confidence through directness
 * - No visual metaphors or illustrations
 * - Typography does the work
 * 
 * This section creates productive tension and signals authority.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { cn } from "@/lib/utils"

const antiPatterns = [
  {
    title: "Opinion-first strategy",
    description: "If you're looking for a tool to validate decisions you've already made, Plinth will frustrate you. We surface evidence, not confirmation."
  },
  {
    title: "Speed over rigor",
    description: "Plinth takes time. We analyze dozens of sources, cross-reference signals, and build defensible confidence scores. If you need answers in 30 seconds, look elsewhere."
  },
  {
    title: "Feature parity analysis",
    description: "We don't do competitive feature checklists. We analyze strategic positioning, market signals, and evidence-based opportunities. If you want a feature matrix, use a spreadsheet."
  },
  {
    title: "Consensus-driven decisions",
    description: "Plinth doesn't build consensus. It builds evidence. If your process requires everyone to agree before moving forward, our outputs will feel too definitive—or not definitive enough."
  }
]

export function NotForEveryoneSection() {
  return (
    <MarketingSection tone="default" density="tight">
      <MarketingContainer maxWidth="4xl">
        <Reveal>
          {/* PRIMARY READING PATH - Core claim */}
          <div className="text-center space-y-3 mb-10 max-w-[50ch] mx-auto">
            <h2 className={cn(
              "editorial-section-headline mx-auto relative inline-block",
              "whitespace-nowrap lg:whitespace-nowrap",
              "text-2xl sm:text-3xl md:text-4xl lg:text-4xl",
              "max-w-full font-semibold"
            )}>
              Not for everyone
            </h2>
            <p className="editorial-body mx-auto leading-snug text-text-primary">
              Plinth is built for teams that make evidence-based decisions. If that's not your process, you'll find it constraining.
            </p>
          </div>
        </Reveal>
        
        {/* Anti-patterns list - Dense, challenging typography */}
        <Reveal delay={60}>
          <div className="space-y-6 max-w-[60ch] mx-auto">
            {antiPatterns.map((pattern, idx) => (
              <div 
                key={idx}
                className="border-l-2 border-border-subtle pl-6 py-2"
              >
                <h3 className="text-lg font-semibold text-text-primary mb-2 leading-tight">
                  {pattern.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {pattern.description}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
        
        {/* Closing statement - Tighter spacing */}
        <Reveal delay={120}>
          <div className="mt-10 text-center max-w-[55ch] mx-auto">
            <p className="editorial-body text-text-primary leading-snug">
              If you're still reading, you're probably our kind of person. Evidence-first strategy work requires patience, rigor, and a willingness to be wrong.
            </p>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

