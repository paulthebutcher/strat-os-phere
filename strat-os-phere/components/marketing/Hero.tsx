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
                Find your unfair advantage
              </h1>
              <p className={cn(
                "text-lg md:text-xl leading-relaxed text-text-secondary max-w-prose",
                "mx-auto lg:mx-0"
              )}>
                Plinth turns public market evidence into ranked strategic bets — with citations, confidence, and VP-ready framing.
              </p>
              <p className={cn(
                "text-sm md:text-base text-text-muted italic max-w-prose",
                "mx-auto lg:mx-0"
              )}>
                Decision credibility over AI novelty.
              </p>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start pt-2">
              <Link href="/new">
                <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow">
                  Start a new analysis
                </Button>
              </Link>
              <Link href="#example-output">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-accent-primary/5">
                  See example output
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
              <div className="p-3 bg-surface-muted border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-danger"></div>
                  <div className="h-2 w-2 rounded-full bg-warning"></div>
                  <div className="h-2 w-2 rounded-full bg-success"></div>
                  <span className="ml-4 text-xs font-medium text-text-muted">Plinth Analysis</span>
                </div>
              </div>
              
              {/* Evidence sources bar */}
              <div className="px-4 py-2.5 bg-surface-muted/50 border-b border-border-subtle">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-medium text-text-muted">Evidence sources:</span>
                  <Badge variant="secondary" className="text-xs">Pricing</Badge>
                  <Badge variant="secondary" className="text-xs">Docs</Badge>
                  <Badge variant="secondary" className="text-xs">Changelog</Badge>
                  <Badge variant="secondary" className="text-xs">Reviews</Badge>
                </div>
              </div>
              
              {/* Mock product preview - Opportunity card with details */}
              <div className="p-5 space-y-4 bg-surface">
                {/* Main opportunity card */}
                <div className="p-4 rounded-lg border border-border-subtle bg-surface-muted/50">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="primary" className="text-xs font-semibold">8.7</Badge>
                        <span className="text-xs text-text-muted">High confidence</span>
                      </div>
                      <h4 className="text-sm font-semibold text-text-primary mb-2">
                        Launch enterprise SSO to match competitor positioning
                      </h4>
                    </div>
                  </div>
                  
                  {/* Top evidence citations */}
                  <div className="mb-3 space-y-1.5">
                    <p className="text-xs font-medium text-text-muted mb-1.5">Top evidence:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span className="w-1 h-1 rounded-full bg-accent-primary"></span>
                        <span>Competitor A pricing page — Enterprise tier</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span className="w-1 h-1 rounded-full bg-accent-primary"></span>
                        <span>Competitor B docs — SSO integration guide</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span className="w-1 h-1 rounded-full bg-accent-primary"></span>
                        <span>Review site — Feature request thread</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Scoring breakdown */}
                  <div className="pt-3 border-t border-border-subtle">
                    <p className="text-xs font-medium text-text-muted mb-2">Scoring drivers:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">Evidence strength</span>
                        <span className="font-medium text-text-primary">8.9</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">Defensibility</span>
                        <span className="font-medium text-text-primary">8.5</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">Market timing</span>
                        <span className="font-medium text-text-primary">8.2</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">Strategic fit</span>
                        <span className="font-medium text-text-primary">9.1</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Secondary opportunity (smaller) */}
                <div className="p-3 rounded-lg border border-border-subtle bg-surface-muted/30">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="primary" className="text-xs font-semibold">7.9</Badge>
                    <span className="text-xs text-text-muted">High confidence</span>
                  </div>
                  <h4 className="text-xs font-semibold text-text-primary mb-1">
                    Improve API rate limits based on competitor signals
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    8 sources • Docs, changelog
                  </p>
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
