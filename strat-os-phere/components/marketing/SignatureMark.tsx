/**
 * SignatureMark
 * 
 * Subtle underline or mark that reveals on load.
 * Used sparingly for emphasis on key statements.
 * 
 * Motion: Draws in left → right (120-180ms, ease-out)
 */
"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

interface SignatureMarkProps {
  /** Variant: underline or accent */
  variant?: "underline" | "accent"
  /** Delay before animation starts (ms) */
  delay?: number
  className?: string
}

export function SignatureMark({
  variant = "underline",
  delay = 0,
  className,
}: SignatureMarkProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (variant === "underline") {
    return (
      <span
        ref={ref}
        className={cn(
          "relative inline-block",
          className
        )}
      >
        <span
          className={cn(
            "absolute bottom-0 left-0 right-0 h-[2px]",
            "bg-gradient-to-r from-accent-primary via-accent-primary/80 to-transparent",
            "origin-left",
            "transition-transform duration-[150ms] ease-out",
            isVisible ? "scale-x-100" : "scale-x-0"
          )}
          style={{
            transitionDelay: `${delay}ms`,
          }}
        />
      </span>
    )
  }

  // Accent variant - small left border mark
  return (
    <span
      ref={ref}
      className={cn(
        "relative inline-block pl-3",
        className
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[2px]",
          "bg-accent-primary",
          "origin-top",
          "transition-transform duration-[150ms] ease-out",
          isVisible ? "scale-y-100" : "scale-y-0"
        )}
        style={{
          transitionDelay: `${delay}ms`,
        }}
      />
    </span>
  )
}

