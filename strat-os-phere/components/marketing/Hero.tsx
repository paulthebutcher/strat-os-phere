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
import { MarketingContainer } from "./MarketingContainer"
import { GlassPanel } from "./GlassPanel"
import { HeroPreview } from "./previews/HeroPreview"
import { microcopy } from "@/lib/copy/microcopy"
import { Reveal, Stagger, HoverLift } from "./motion"

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[80vh] pt-24 md:pt-32 lg:pt-40">
      {/* Subtle radial spotlight background effect */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] opacity-20"
          style={{
            background: "radial-gradient(ellipse 1200px 800px at 50% -200px, hsl(var(--accent-primary) / 0.08) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* Top: Centered text & CTAs */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-10 pb-10 text-center">
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Hero headline: delay 0 */}
            <Reveal delay={0}>
              <h1 className={cn(
                "text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight"
              )}>
                {microcopy.marketing.heroHeadline}
              </h1>
            </Reveal>
            
            {/* Subhead: delay 60ms */}
            <Reveal delay={60}>
              <p className={cn(
                "text-lg md:text-xl leading-relaxed text-text-secondary max-w-2xl mx-auto"
              )}>
                {microcopy.marketing.heroSubhead}
              </p>
            </Reveal>
            
            {/* Tagline: delay 60ms (same as subhead for smooth flow) */}
            <Reveal delay={60}>
              <p className={cn(
                "text-sm md:text-base text-text-muted italic max-w-xl mx-auto"
              )}>
                {microcopy.marketing.heroTagline}
              </p>
            </Reveal>
          </div>
          
          {/* CTAs: delay 120ms with stagger within */}
          <Reveal delay={120}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-2">
              <Link href="#how">
                <Button 
                  size="lg" 
                  className={cn(
                    "w-full sm:w-auto text-base px-6 py-6 shadow-lg",
                    HoverLift.className
                  )}
                >
                  {microcopy.marketing.primaryCTA}
                </Button>
              </Link>
              <Link href="#example">
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
          
          {/* Proof chips: delay 180ms with stagger */}
          <Reveal delay={180}>
            <Stagger stagger={40} className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {microcopy.marketing.trustBadges.map((badge) => (
                <Badge key={badge} variant="secondary" className="text-xs px-3 py-1">
                  {badge}
                </Badge>
              ))}
            </Stagger>
          </Reveal>
        </div>
      </div>

      {/* Bottom: Large preview that overlaps next section */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-0">
        <Reveal delay={240} y={12}>
          <div className="translate-y-[24px] md:translate-y-[48px]">
            <GlassPanel variant="strong" className="overflow-hidden shadow-xl">
              {/* Inner white app surface */}
              <div className="bg-white rounded-lg overflow-hidden border border-border-subtle">
                <HeroPreview />
              </div>
            </GlassPanel>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
