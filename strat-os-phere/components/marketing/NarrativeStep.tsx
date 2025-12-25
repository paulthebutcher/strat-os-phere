/**
 * NarrativeStep
 * 
 * Reusable component for narrative sections in the homepage.
 * Supports left/right image alignment for visual rhythm.
 * Now includes artifact headers and receipt callouts via PreviewArtifact.
 */
"use client"

import { ReactNode } from "react"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { PreviewArtifact } from "./PreviewArtifact"
import { cn } from "@/lib/utils"

interface ReceiptCallout {
  label: string
}

interface NarrativeStepProps {
  title: string
  copy: string | ReactNode
  image: ReactNode
  alignment?: "left" | "right"
  id?: string
  framingLine?: string
  /** Artifact title for the preview (e.g., "Decision Receipt", "Ranked Opportunities") */
  artifactTitle?: string
  /** Artifact subtitle (e.g., "One page. Defensible call. Sources included.") */
  artifactSubtitle?: string
  /** Receipt callouts (max 3) - chips that highlight key proof points */
  receiptCallouts?: ReceiptCallout[]
}

export function NarrativeStep({
  title,
  copy,
  image,
  alignment = "right",
  id,
  framingLine,
  artifactTitle,
  artifactSubtitle,
  receiptCallouts = [],
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

          {/* Image/Preview with Artifact wrapper */}
          <div
            className={cn(
              "space-y-3",
              !isImageRight && "lg:col-start-1"
            )}
          >
            {framingLine && (
              <Reveal delay={75}>
                <p className="text-sm text-text-secondary font-medium">
                  {framingLine}
                </p>
              </Reveal>
            )}
            <Reveal delay={90}>
              {artifactTitle && artifactSubtitle ? (
                <PreviewArtifact
                  title={artifactTitle}
                  subtitle={artifactSubtitle}
                  callouts={receiptCallouts}
                >
                  {image}
                </PreviewArtifact>
              ) : (
                <div className="relative rounded-xl border-2 border-border-subtle shadow-xl overflow-hidden bg-white">
                  {image}
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

