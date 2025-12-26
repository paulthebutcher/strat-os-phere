/**
 * TypographicMoment
 * 
 * Full-bleed typographic section where type itself is the visual.
 * These are not headlines above content — they are the content.
 * 
 * Characteristics:
 * - Large, confident, single-line statements
 * - Generous margins
 * - No cards, no visuals, no UI
 * - Optional subtle mark or underline for emphasis
 * 
 * Used sparingly, this is incredibly powerful.
 */
"use client"

import { ReactNode, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Reveal } from "./motion"

interface TypographicMomentProps {
  children: ReactNode
  /** Optional mark/underline variant */
  mark?: "underline" | "none"
  /** Vertical spacing */
  spacing?: "tight" | "normal" | "spacious"
  /** Optional subtle background tint */
  tint?: boolean
  className?: string
}

export function TypographicMoment({
  children,
  mark = "underline",
  spacing = "normal",
  tint = false,
  className,
}: TypographicMomentProps) {
  const [underlineVisible, setUnderlineVisible] = useState(false)
  const spacingClasses = {
    tight: "py-16 sm:py-20 md:py-24",
    normal: "py-20 sm:py-24 md:py-32",
    spacious: "py-24 sm:py-32 md:py-40",
  }

  useEffect(() => {
    if (mark === "underline") {
      const timer = setTimeout(() => {
        setUnderlineVisible(true)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [mark])

  return (
    <section
      className={cn(
        "w-full relative",
        spacingClasses[spacing],
        tint && "bg-slate-50/30",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal delay={0}>
          <div className="text-center">
            <div
              className={cn(
                "editorial-headline mx-auto",
                "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
                "font-semibold tracking-tight",
                "leading-[1.1]",
                mark === "underline" && "relative inline-block"
              )}
            >
              {children}
              {mark === "underline" && (
                <span
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-[3px]",
                    "bg-gradient-to-r from-accent-primary via-accent-primary/80 to-transparent",
                    "origin-left transition-transform duration-[400ms] ease-out",
                    underlineVisible ? "scale-x-100" : "scale-x-0"
                  )}
                />
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

