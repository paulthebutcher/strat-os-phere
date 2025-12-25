/**
 * Proof → What You Actually Get Section
 * 
 * Two-column proof-first layout: compact proof pillars on left, concrete visual proof on right.
 * Shows how principles manifest in real outputs.
 */
"use client"

import { FileText, CheckCircle2, ArrowRight } from "lucide-react"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal, Stagger } from "./motion"
import { PreviewArtifact } from "./PreviewArtifact"
import { DecidePreview } from "./previews/DecidePreview"
import { cn } from "@/lib/utils"

interface ProofRowProps {
  icon: React.ElementType
  title: string
  description: string
}

function ProofRow({ icon: Icon, title, description }: ProofRowProps) {
  return (
    <div className={cn(
      "flex items-start gap-4 py-4 border-b border-border-subtle last:border-0",
      "group transition-colors"
    )}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10 shrink-0 group-hover:bg-accent-primary/15 transition-colors">
        <Icon className="h-5 w-5 text-accent-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-text-primary mb-1">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      </div>
    </div>
  )
}

export function ProofSection() {
  const proofPillars = [
    {
      icon: FileText,
      title: "Evidence with citations",
      description: "Every claim links to a real source you can open and share.",
    },
    {
      icon: CheckCircle2,
      title: "Confidence made explicit",
      description: "See what's strongly supported vs. what's still directional.",
    },
    {
      icon: ArrowRight,
      title: "Next steps built in",
      description: "Clear recommendations — plus what would change the call.",
    },
  ]

  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary">
              Why Plinth decisions hold up under scrutiny
            </h2>
            <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto">
              Not dashboards. Not summaries. Decisions built from inspectable evidence.
            </p>
          </div>
        </Reveal>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column: Compact Proof Pillars */}
          <Reveal delay={60}>
            <div className="panel p-6 md:p-8 rounded-2xl border border-border-subtle bg-surface">
              <Stagger>
                {proofPillars.map((pillar, index) => (
                  <ProofRow
                    key={index}
                    icon={pillar.icon}
                    title={pillar.title}
                    description={pillar.description}
                  />
                ))}
              </Stagger>
            </div>
          </Reveal>

          {/* Right Column: Concrete Visual Proof */}
          <Reveal delay={120}>
            <PreviewArtifact
              title="Decision Receipt"
              subtitle="One page. Defensible call. Sources included."
              callouts={[
                { label: "Evidence-backed" },
                { label: "Confidence shown" },
                { label: "Boundaries defined" },
              ]}
            >
              <DecidePreview />
            </PreviewArtifact>
          </Reveal>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

