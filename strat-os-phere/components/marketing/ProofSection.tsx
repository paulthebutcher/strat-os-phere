/**
 * Proof → What You Actually Get Section
 * 
 * Two-column proof-first layout: compact proof pillars on left, concrete visual proof on right.
 * Shows how principles manifest in real outputs.
 */
"use client"

import Link from "next/link"
import { FileText, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
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
      "flex items-start gap-3 py-3 border-b border-border-subtle last:border-0",
      "group transition-colors"
    )}>
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-primary/10 shrink-0 group-hover:bg-accent-primary/15 transition-colors">
        <Icon className="h-4 w-4 text-accent-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-text-primary mb-1">
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
          <div className="text-center mb-8 sm:mb-12 space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight lg:whitespace-nowrap">
              Why decisions hold up
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-2xl mx-auto line-clamp-2 sm:line-clamp-none">
              Not dashboards. Not summaries. Decisions built from inspectable evidence.
            </p>
          </div>
        </Reveal>
        
        {/* Proof section with unified frame */}
        <div className="rounded-2xl border border-border-subtle bg-surface-muted/30 p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-6 sm:gap-8 lg:gap-8 items-start">
            {/* Mobile: Visual first, then pillars */}
            {/* Right Column: Concrete Visual Proof */}
            <Reveal delay={60} className="order-1 lg:order-2">
              <PreviewArtifact
                title="Decision Receipt"
                subtitle=""
                callouts={[
                  { label: "One page" },
                  { label: "Defensible" },
                  { label: "Sources included" }
                ]}
              >
                <DecidePreview />
              </PreviewArtifact>
            </Reveal>

            {/* Left Column: Compact Proof Pillars */}
            <Reveal delay={120} className="order-2 lg:order-1">
              <div className="p-4">
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
          </div>
        </div>

        {/* Mobile CTA */}
        <Reveal delay={180}>
          <div className="mt-8 sm:mt-12 text-center lg:hidden">
            <Link href="/new" className="inline-block">
              <Button 
                size="lg" 
                variant="brand"
                className="w-full sm:w-auto"
              >
                Try Plinth
              </Button>
            </Link>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

