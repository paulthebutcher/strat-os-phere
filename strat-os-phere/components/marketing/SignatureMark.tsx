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
    // Subtle imperfection: minor offset to reinforce physicality
    const offsetX = 0.5 // Small horizontal offset
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
            "absolute top-1/2 -translate-y-1/2 w-[2px] h-4",
            "bg-accent-primary",
            "origin-center",
            "transition-transform duration-[150ms] ease-out",
            isVisible ? "scale-y-100" : "scale-y-0"
          )}
          style={{
            left: `${offsetX}px`,
            transitionDelay: `${delay}ms`,
          }}
        />
      </span>
    )
  }

  // Underline variant - horizontal line that draws in
  if (variant === "underline") {
    // Subtle imperfection: minor vertical offset to reinforce physicality
    const offsetY = -0.5 // Small vertical offset
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
            "absolute left-0 right-0 h-[2px]",
            "bg-gradient-to-r from-accent-primary via-accent-primary/80 to-transparent",
            "origin-left",
            "transition-transform duration-[150ms] ease-out",
            isVisible ? "scale-x-100" : "scale-x-0"
          )}
          style={{
            bottom: `${offsetY}px`,
            transitionDelay: `${delay}ms`,
          }}
        />
      </span>
    )
  }

  // Punch variant - receipt-style dots on an edge
  if (variant === "punch") {
    // Subtle imperfection: minor offsets based on position
    const offsets = {
      top: { x: 0, y: 0.5 },
      bottom: { x: 0, y: -0.5 },
      left: { x: 0.5, y: 0 },
      right: { x: -0.5, y: 0 },
    }
    const offset = offsets[punchPosition]
    
    const positionClasses = {
      top: "absolute left-1/2 -translate-x-1/2 flex gap-1",
      bottom: "absolute left-1/2 -translate-x-1/2 flex gap-1",
      left: "absolute top-1/2 -translate-y-1/2 flex flex-col gap-1",
      right: "absolute top-1/2 -translate-y-1/2 flex flex-col gap-1",
    }

    const positionStyles = {
      top: { top: `${offset.y}px` },
      bottom: { bottom: `${-offset.y}px` },
      left: { left: `${offset.x}px` },
      right: { right: `${-offset.x}px` },
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
            ...positionStyles[punchPosition],
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
    // Subtle imperfection: minor offsets based on corner position
    const cornerOffsets = {
      "top-left": { x: 0.5, y: 0.5 },
      "top-right": { x: -0.5, y: 0.5 },
      "bottom-left": { x: 0.5, y: -0.5 },
      "bottom-right": { x: -0.5, y: -0.5 },
    }
    const offset = cornerOffsets[cornerPosition]
    
    const cornerClasses = {
      "top-left": "border-t border-l",
      "top-right": "border-t border-r",
      "bottom-left": "border-b border-l",
      "bottom-right": "border-b border-r",
    }

    const cornerStyles = {
      "top-left": { top: `${offset.y}px`, left: `${offset.x}px` },
      "top-right": { top: `${offset.y}px`, right: `${-offset.x}px` },
      "bottom-left": { bottom: `${-offset.y}px`, left: `${offset.x}px` },
      "bottom-right": { bottom: `${-offset.y}px`, right: `${-offset.x}px` },
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
            ...cornerStyles[cornerPosition],
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

