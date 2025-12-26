/**
 * ArtifactSettle
 * 
 * Subtle "settling" animation for decision artifacts.
 * Elements "settle" into place with a 2-3px easing.
 * 
 * Duration: 120-180ms
 * Easing: ease-out only
 * No spring physics
 */
"use client"

import { ReactNode, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { prefersReducedMotion } from "@/lib/motion/tokens"

interface ArtifactSettleProps {
  children: ReactNode
  delay?: number
  className?: string
  as?: keyof React.JSX.IntrinsicElements
}

export function ArtifactSettle({
  children,
  delay = 0,
  className,
  as: Component = "div",
}: ArtifactSettleProps) {
  const [isSettled, setIsSettled] = useState(false)
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setIsSettled(true)
      return
    }

    const timer = setTimeout(() => {
      setIsSettled(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const componentProps = {
    ref,
    className: cn(className),
    style: {
      transform: isSettled ? "translateY(0)" : "translateY(2px)",
      opacity: isSettled ? 1 : 0.95,
      transition: prefersReducedMotion()
        ? "none"
        : `transform 150ms ease-out ${delay}ms, opacity 150ms ease-out ${delay}ms`,
    } as React.CSSProperties,
  } as any

  return (
    <Component {...componentProps}>
      {children}
    </Component>
  )
}

