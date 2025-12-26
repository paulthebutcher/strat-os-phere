/**
 * EditorialBreak
 * 
 * Full-bleed typographic moment where type itself is the visual.
 * Single line on desktop, with optional small caption rail text.
 * 
 * Used sparingly to break up sections and create editorial rhythm.
 * No cards, no visuals - just confident typography.
 */
"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Reveal } from "../motion"

interface EditorialBreakProps {
  /** The main typographic statement */
  children: ReactNode
  /** Optional small caption text below */
  caption?: string
  /** Additional className */
  className?: string
}

export function EditorialBreak({
  children,
  caption,
  className,
}: EditorialBreakProps) {
  return (
    <section
      className={cn(
        "w-full py-20 sm:py-24 md:py-32",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal delay={0}>
          <div className="text-center space-y-4">
            <h2
              className={cn(
                "editorial-headline mx-auto",
                "font-semibold tracking-tight leading-[1.1]",
                "whitespace-normal sm:whitespace-normal md:whitespace-nowrap lg:whitespace-nowrap",
                "max-w-full",
                "overflow-hidden"
              )}
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
              }}
            >
              {children}
            </h2>
            {caption && (
              <p className="editorial-meta text-center max-w-[65ch] mx-auto">
                {caption}
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

