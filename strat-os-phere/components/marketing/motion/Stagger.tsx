/**
 * Stagger Component
 * 
 * Applies staggered reveal animations to a list of children.
 * Each child receives an incremental delay based on stagger timing.
 * 
 * Usage:
 *   <Stagger stagger={60}>
 *     {items.map(item => <Card key={item.id}>{item.content}</Card>)}
 *   </Stagger>
 */
"use client"

import { type ReactNode, Children, isValidElement, cloneElement } from "react"
import { Reveal, type RevealProps } from "./Reveal"
import { stagger } from "@/lib/motion/tokens"

export interface StaggerProps {
  children: ReactNode
  stagger?: number // Delay between items in milliseconds (defaults to stagger.base)
  y?: number // TranslateY distance for reveals
  once?: boolean // Only animate once
  className?: string
  childClassName?: string // Applied to each wrapped child
  threshold?: number // IntersectionObserver threshold
}

export function Stagger({
  children,
  stagger: staggerDelay = stagger.base,
  y,
  once = true,
  className,
  childClassName,
  threshold,
}: StaggerProps) {
  const childrenArray = Children.toArray(children)

  return (
    <div className={className}>
      {childrenArray.map((child, index) => {
        if (!isValidElement(child)) return child

        // Calculate delay for this child
        const delay = index * staggerDelay

        // If child is already a Reveal, extract its props and merge
        if (child.type === Reveal) {
          const revealProps = child.props as RevealProps
          return cloneElement(child, {
            ...revealProps,
            delay: (revealProps.delay || 0) + delay,
            y: y !== undefined ? y : revealProps.y,
            once,
            threshold: threshold !== undefined ? threshold : revealProps.threshold,
            className: childClassName
              ? `${revealProps.className || ""} ${childClassName}`.trim()
              : revealProps.className,
          } as any)
        }

        // Otherwise wrap in Reveal
        return (
          <Reveal
            key={child.key || index}
            delay={delay}
            y={y}
            once={once}
            threshold={threshold}
            className={childClassName}
          >
            {child}
          </Reveal>
        )
      })}
    </div>
  )
}

