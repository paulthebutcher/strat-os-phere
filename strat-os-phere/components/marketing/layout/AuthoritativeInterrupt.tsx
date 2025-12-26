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

interface AuthoritativeInterruptProps {
  /** The authoritative statement - single line */
  children: ReactNode
  /** Additional className */
  className?: string
}

export function AuthoritativeInterrupt({
  children,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal delay={0}>
          <div className="text-center">
            <h2
              className={cn(
                "mx-auto",
                "font-bold tracking-tight leading-[1.05]",
                "text-text-primary",
                "whitespace-normal sm:whitespace-normal md:whitespace-nowrap lg:whitespace-nowrap",
                "max-w-full",
                "overflow-hidden"
              )}
              style={{
                fontSize: "clamp(2.25rem, 6vw, 4rem)",
              }}
            >
              {children}
            </h2>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

