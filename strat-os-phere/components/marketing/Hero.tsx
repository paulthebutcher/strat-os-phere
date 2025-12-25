/**
 * Hero Section
 * 
 * Redesigned hero with centered text/CTAs on top, large preview below that overlaps next section.
 * Visual-first design with prominent preview and animation-ready structure.
 */
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { HeroPreview } from "./previews/HeroPreview"
import { microcopy } from "@/lib/copy/microcopy"
import { Reveal, Stagger, HoverLift } from "./motion"

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[85vh] pt-32 md:pt-40 lg:pt-48">
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1000px] opacity-[0.08]"
          style={{
            background: "radial-gradient(ellipse 1200px 1000px at 50% 0%, hsl(var(--accent-primary) / 0.1) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Main content: two-column on desktop, stacked on mobile */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy + CTAs */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Hero headline */}
            <Reveal delay={0}>
              <h1 className={cn(
                "text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight"
              )}>
                {microcopy.marketing.heroHeadline.split('\n').map((line, idx) => (
                  <span key={idx}>
                    {line}
                    {idx === 0 && <br />}
                  </span>
                ))}
              </h1>
            </Reveal>
            
            {/* Subhead */}
            <Reveal delay={60}>
              <p className={cn(
                "text-base md:text-lg leading-relaxed text-text-secondary max-w-xl lg:max-w-none"
              )}>
                {microcopy.marketing.heroSubhead}
              </p>
            </Reveal>
            
            {/* Proof line */}
            <Reveal delay={90}>
              <p className={cn(
                "text-sm text-text-muted"
              )}>
                {microcopy.marketing.proofLine}
              </p>
            </Reveal>
            
            {/* CTAs */}
            <Reveal delay={120}>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 lg:justify-start justify-center">
                <Link href="/new">
                  <Button 
                    size="lg" 
                    variant="brand"
                    className={cn(
                      "w-full sm:w-auto text-base px-8 py-6",
                      HoverLift.className
                    )}
                  >
                    {microcopy.marketing.primaryCTA}
                  </Button>
                </Link>
                <Link href="/example">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className={cn(
                      "w-full sm:w-auto border-2 hover:bg-accent-primary/5",
                      HoverLift.subtle
                    )}
                  >
                    {microcopy.marketing.secondaryCTA}
                  </Button>
                </Link>
              </div>
            </Reveal>
            
            {/* Tagline */}
            <Reveal delay={150}>
              <p className={cn(
                "text-xs md:text-sm text-text-muted"
              )}>
                {microcopy.marketing.heroTagline}
              </p>
            </Reveal>
          </div>

          {/* Right: Preview artifact */}
          <div className="relative">
            <Reveal delay={180} y={12}>
              <div className="relative">
                {/* Label */}
                <div className="absolute -top-6 left-0 text-xs text-text-muted font-medium">
                  Example output (static)
                </div>
                {/* Preview */}
                <div className="bg-white rounded-xl border border-border-subtle shadow-xl overflow-hidden">
                  <HeroPreview />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
