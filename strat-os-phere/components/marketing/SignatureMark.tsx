/**
 * SignatureMark
 * 
 * Subtle marks that "sign" the layout - used sparingly for emphasis.
 * All variants use simple HTML/CSS (no heavy SVG library required).
 * 
 * Motion: 120-180ms ease-out micro-motion
 * 
 * Variants:
 * - tick: Small vertical tick mark (left side)
 * - underline: Horizontal underline that draws in
 * - punch: Receipt-style punch dots on an edge
 * - cornerCut: Subtle corner notch detail
 */
"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

interface SignatureMarkProps {
  /** Variant: tick, underline, punch, or cornerCut */
  variant?: "tick" | "underline" | "punch" | "cornerCut"
  /** Delay before animation starts (ms) */
  delay?: number
  /** Position for punch variant: "top" | "bottom" | "left" | "right" */
  punchPosition?: "top" | "bottom" | "left" | "right"
  /** Position for cornerCut variant: "top-left" | "top-right" | "bottom-left" | "bottom-right" */
  cornerPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  className?: string
}

export function SignatureMark({
  variant = "underline",
  delay = 0,
  punchPosition = "left",
  cornerPosition = "top-left",
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

  // Tick variant - small vertical mark on left
  if (variant === "tick") {
    return (
      <span
        ref={ref}
        className={cn(
          "relative inline-block pl-2",
          className
        )}
      >
        <span
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4",
            "bg-accent-primary",
            "origin-center",
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

  // Underline variant - horizontal line that draws in
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

  // Punch variant - receipt-style dots on an edge
  if (variant === "punch") {
    const positionClasses = {
      top: "absolute top-0 left-1/2 -translate-x-1/2 flex gap-1",
      bottom: "absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1",
      left: "absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-1",
      right: "absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1",
    }

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
            positionClasses[punchPosition],
            "transition-opacity duration-[150ms] ease-out",
            isVisible ? "opacity-100" : "opacity-0"
          )}
          style={{
            transitionDelay: `${delay}ms`,
          }}
        >
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className={cn(
                punchPosition === "top" || punchPosition === "bottom"
                  ? "w-1 h-1"
                  : "w-1 h-1",
                "rounded-full",
                "bg-[hsl(var(--hairline))]"
              )}
            />
          ))}
        </span>
      </span>
    )
  }

  // CornerCut variant - subtle corner notch
  if (variant === "cornerCut") {
    const cornerClasses = {
      "top-left": "top-0 left-0 border-t border-l",
      "top-right": "top-0 right-0 border-t border-r",
      "bottom-left": "bottom-0 left-0 border-b border-l",
      "bottom-right": "bottom-0 right-0 border-b border-r",
    }

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
            "absolute w-3 h-3",
            cornerClasses[cornerPosition],
            "border-[hsl(var(--hairline))]",
            "transition-opacity duration-[150ms] ease-out",
            isVisible ? "opacity-100" : "opacity-0"
          )}
          style={{
            transitionDelay: `${delay}ms`,
            clipPath: cornerPosition === "top-left" 
              ? "polygon(0 0, 0 100%, 100% 0)"
              : cornerPosition === "top-right"
              ? "polygon(100% 0, 0 0, 100% 100%)"
              : cornerPosition === "bottom-left"
              ? "polygon(0 0, 0 100%, 100% 100%)"
              : "polygon(100% 0, 100% 100%, 0 100%)",
          }}
        />
      </span>
    )
  }

  return null
}

