/**
 * Hero Section
 * 
 * Clean hero with headline, subhead, CTAs, and product preview mock.
 * Calm, exec-ready copy with proof chips.
 */
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

export function Hero() {
  return (
    <MarketingSection variant="gradient" className="relative overflow-hidden border-t-0 pt-20 md:pt-24 lg:pt-32">
      <MarketingContainer maxWidth="7xl" className="relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Left: Headline, subhead, CTAs */}
          <div className="text-center lg:text-left space-y-6">
            <div className="space-y-4">
              <h1 className={cn(
                "text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-text-primary",
                "leading-tight"
              )}>
                Competitive strategy, grounded in evidence.
              </h1>
              <p className={cn(
                "text-lg md:text-xl leading-relaxed text-text-secondary max-w-prose",
                "mx-auto lg:mx-0"
              )}>
                Plinth turns public market signals—pricing, docs, changelogs, reviews—into ranked strategic opportunities with citations and confidence.
              </p>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start pt-2">
              <Link href="/try">
                <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow">
                  Start a new analysis
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-accent-primary/5">
                  See how it works
                </Button>
              </Link>
            </div>
            
            {/* Proof chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start pt-2">
              <Badge variant="secondary" className="text-xs px-3 py-1">
                Citations included
              </Badge>
              <Badge variant="secondary" className="text-xs px-3 py-1">
                Deterministic scoring
              </Badge>
              <Badge variant="secondary" className="text-xs px-3 py-1">
                Exec-ready output
              </Badge>
            </div>
          </div>

          {/* Right: Product preview mock */}
          <div className="relative">
            <div className="relative rounded-2xl border-2 border-border-subtle shadow-xl bg-surface overflow-hidden">
              {/* Mock browser chrome */}
              <div className="p-4 bg-surface-muted border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-danger"></div>
                  <div className="h-2 w-2 rounded-full bg-warning"></div>
                  <div className="h-2 w-2 rounded-full bg-success"></div>
                  <span className="ml-4 text-xs font-medium text-text-muted">Ranked Opportunities</span>
                </div>
              </div>
              
              {/* Mock product preview */}
              <div className="p-6 space-y-4 bg-surface">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-border-subtle bg-surface-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="primary" className="text-xs font-semibold">8.7</Badge>
                        <span className="text-xs text-text-muted">High confidence</span>
                      </div>
                      <h4 className="text-sm font-semibold text-text-primary mb-1">
                        Launch feature X that addresses gap Y
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Evidence from 12 sources across pricing, docs, and reviews...
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-border-subtle bg-surface-muted/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="primary" className="text-xs font-semibold">7.9</Badge>
                        <span className="text-xs text-text-muted">High confidence</span>
                      </div>
                      <h4 className="text-sm font-semibold text-text-primary mb-1">
                        Improve capability Z based on competitor signals
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Evidence from 8 sources...
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-border-subtle bg-surface-muted/20">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="primary" className="text-xs font-semibold">7.2</Badge>
                        <span className="text-xs text-text-muted">Medium confidence</span>
                      </div>
                      <h4 className="text-sm font-semibold text-text-primary mb-1">
                        Strategic opportunity with citations
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Evidence from 6 sources...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -right-8 -top-8 w-32 h-32 opacity-10 pointer-events-none">
              <div className="w-full h-full rounded-full bg-accent-primary blur-3xl"></div>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}
