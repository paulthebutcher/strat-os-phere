/**
 * NarrativeStep
 * 
 * Reusable component for narrative sections in the homepage.
 * Supports left/right image alignment for visual rhythm.
 */
"use client"

import { ReactNode } from "react"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { cn } from "@/lib/utils"

interface NarrativeStepProps {
  title: string
  copy: string | ReactNode
  image: ReactNode
  alignment?: "left" | "right"
  id?: string
}

export function NarrativeStep({
  title,
  copy,
  image,
  alignment = "right",
  id,
}: NarrativeStepProps) {
  const isImageRight = alignment === "right"

  return (
    <MarketingSection variant="default" id={id}>
      <MarketingContainer maxWidth="7xl">
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center",
            !isImageRight && "lg:grid-flow-dense"
          )}
        >
          {/* Text Content */}
          <div
            className={cn(
              "space-y-4",
              !isImageRight && "lg:col-start-2"
            )}
          >
            <Reveal>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
                {title}
              </h2>
            </Reveal>
            <Reveal delay={60}>
              <div className="text-base sm:text-lg leading-relaxed text-text-secondary">
                {typeof copy === "string" ? <p>{copy}</p> : copy}
              </div>
            </Reveal>
          </div>

          {/* Image/Preview */}
          <div
            className={cn(
              !isImageRight && "lg:col-start-1"
            )}
          >
            <Reveal delay={90}>
              <div className="relative rounded-xl border-2 border-border-subtle shadow-xl overflow-hidden bg-white">
                {image}
              </div>
            </Reveal>
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

