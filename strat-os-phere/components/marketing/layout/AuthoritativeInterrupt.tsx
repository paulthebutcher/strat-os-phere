/**
 * AuthoritativeInterrupt
 * 
 * Full-bleed, single-line authoritative statements that create hard scroll stops.
 * Heavier typographic presence than EditorialBreak - no supporting imagery or UI previews.
 * Purpose: assert point of view and break SaaS-like flow.
 * 
 * Used between major sections to create deliberate pauses and tension.
 */
"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Reveal } from "../motion"
import { MarketingContainer } from "../MarketingContainer"

interface AuthoritativeInterruptProps {
  /** The authoritative statement - single line */
  children: ReactNode
  /** Optional subhead text */
  subhead?: string
  /** Additional className */
  className?: string
}

export function AuthoritativeInterrupt({
  children,
  subhead,
  className,
}: AuthoritativeInterruptProps) {
  return (
    <section
      className={cn(
        "w-full py-16 sm:py-20 md:py-24",
        "bg-transparent",
        className
      )}
    >
      <MarketingContainer maxWidth="6xl">
        <Reveal delay={0}>
          <div className="text-center space-y-4">
            <h2
              className={cn(
                "mx-auto",
                "font-bold tracking-tight",
                "text-text-primary",
                "whitespace-normal sm:whitespace-normal md:whitespace-nowrap lg:whitespace-nowrap",
                "max-w-full",
                "leading-[1.08] pb-[0.08em]",
                "overflow-visible"
              )}
              style={{
                fontSize: "clamp(2.25rem, 6vw, 4rem)",
              }}
            >
              {children}
            </h2>
            {subhead && (
              <p className="editorial-body text-text-secondary max-w-2xl mx-auto mt-6">
                {subhead}
              </p>
            )}
          </div>
        </Reveal>
      </MarketingContainer>
    </section>
  )
}

