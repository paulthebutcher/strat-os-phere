/**
 * Hero Section
 * 
 * Design tokens used:
 * - text-text-primary: Main headline color (dark gray, not pure black)
 * - text-text-secondary: Subhead color (medium gray for readability)
 * - accent-primary: Primary CTA button color (desaturated blue)
 * - surface-muted: Placeholder background (very light gray)
 * - background: Base background with subtle gradient overlay
 * 
 * Typography scale: text-4xl → text-5xl → text-6xl (mobile → tablet → desktop)
 * Spacing: py-24 → py-32 (increased vertical rhythm)
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, FileText, Target } from "lucide-react"

export function Hero() {
  return (
    <section className="relative mx-auto max-w-[1200px] px-4 py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Text content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold tracking-tight text-text-primary md:text-6xl lg:text-7xl">
              <span className="marketing-gradient-text">Plinth</span>: decision engine for competitive strategy
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-secondary md:text-xl lg:text-2xl">
              Turn live market signals into defensible strategic bets. Get Jobs-to-be-Done, scorecards, opportunities, and Strategic Bets—all backed by up-to-date public evidence with citations.
            </p>
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-center gap-3 text-base text-text-secondary lg:justify-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-primary/10">
                  <Zap className="h-5 w-5 text-accent-primary" />
                </div>
                <span className="font-medium">Live signals from pricing, changelogs, reviews, docs</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-base text-text-secondary lg:justify-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-primary/10">
                  <FileText className="h-5 w-5 text-accent-primary" />
                </div>
                <span className="font-medium">Every insight includes citations you can validate</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-base text-text-secondary lg:justify-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-primary/10">
                  <Target className="h-5 w-5 text-accent-primary" />
                </div>
                <span className="font-medium">Actionable experiments and bets, not just research</span>
              </div>
            </div>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow hover:scale-105">
                  Generate an analysis
                </Button>
              </Link>
              <Link href="#sample-output">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-accent-primary/5">
                  See a sample analysis
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-text-muted">
              Built for VP+ Product & UX. No busywork inputs.
            </p>
          </div>
          
          {/* Product proof visual */}
          <div className="hidden lg:block">
            <div className="panel overflow-hidden border-2 border-border-subtle shadow-sm bg-surface">
              <div className="p-6 bg-surface-muted border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-danger"></div>
                  <div className="h-2 w-2 rounded-full bg-warning"></div>
                  <div className="h-2 w-2 rounded-full bg-success"></div>
                  <span className="ml-4 text-xs font-medium text-text-muted">Results</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Results tiles preview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="panel p-4 bg-surface border border-border-subtle">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-text-primary">Jobs-to-be-Done</h4>
                      <span className="text-xs text-text-muted">8 jobs</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 bg-accent-primary/20 rounded-full">
                        <div className="h-2 bg-accent-primary rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <p className="text-xs text-text-secondary">"Help me validate pricing..."</p>
                    </div>
                  </div>
                  <div className="panel p-4 bg-surface border border-border-subtle">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-text-primary">Scorecard</h4>
                      <span className="text-xs text-text-muted">5 competitors</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-accent-primary/20 rounded-full">
                          <div className="h-1.5 bg-accent-primary rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-xs text-text-muted">8.5</span>
                      </div>
                      <p className="text-xs text-text-secondary">Weighted across criteria</p>
                    </div>
                  </div>
                  <div className="panel p-4 bg-surface border border-border-subtle">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-text-primary">Opportunities</h4>
                      <span className="text-xs text-text-muted">3 ranked</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-accent-primary">1.</span>
                        <p className="text-xs text-text-secondary">Pricing transparency gap</p>
                      </div>
                      <p className="text-xs text-text-muted">First experiment: pricing page</p>
                    </div>
                  </div>
                  <div className="panel p-4 bg-surface border border-border-subtle">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-text-primary">Strategic Bets</h4>
                      <span className="text-xs text-text-muted">2 bets</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-text-secondary">"Say no to enterprise..."</p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-text-muted">3 citations</span>
                        <span className="text-xs text-text-muted">•</span>
                        <span className="text-xs text-text-muted">Defensible</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-border-subtle">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>All outputs include evidence citations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile: Product proof visual */}
        <div className="mt-16 lg:hidden">
          <div className="panel mx-auto max-w-4xl overflow-hidden border-2 border-border-subtle shadow-sm bg-surface">
            <div className="p-4 bg-surface-muted border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-danger"></div>
                <div className="h-2 w-2 rounded-full bg-warning"></div>
                <div className="h-2 w-2 rounded-full bg-success"></div>
                <span className="ml-4 text-xs font-medium text-text-muted">Results Preview</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="panel p-3 bg-surface border border-border-subtle">
                  <h4 className="text-xs font-semibold text-text-primary mb-1">JTBD</h4>
                  <p className="text-xs text-text-secondary">8 jobs scored</p>
                </div>
                <div className="panel p-3 bg-surface border border-border-subtle">
                  <h4 className="text-xs font-semibold text-text-primary mb-1">Scorecard</h4>
                  <p className="text-xs text-text-secondary">5 competitors</p>
                </div>
                <div className="panel p-3 bg-surface border border-border-subtle">
                  <h4 className="text-xs font-semibold text-text-primary mb-1">Opportunities</h4>
                  <p className="text-xs text-text-secondary">3 ranked</p>
                </div>
                <div className="panel p-3 bg-surface border border-border-subtle">
                  <h4 className="text-xs font-semibold text-text-primary mb-1">Strategic Bets</h4>
                  <p className="text-xs text-text-secondary">2 bets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

