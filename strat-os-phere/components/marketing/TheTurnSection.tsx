/**
 * "The Turn: What Changes with Plinth" Section
 * 
 * Shows the transformation - clean decision readout with highlighted sources and confidence indicators.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { PreviewArtifact } from "./PreviewArtifact"
import { DecisionBriefPreview } from "./previews/DecisionBriefPreview"
import { cn } from "@/lib/utils"

export function TheTurnSection() {
  return (
    <MarketingSection variant="default">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              Same question. Different outcome.
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-2xl mx-auto">
              Plinth turns public signals into something you can actually stand behind.
            </p>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <div className="max-w-5xl mx-auto">
            <PreviewArtifact
              title=""
              subtitle=""
              callouts={[
                { label: "Clean readout" },
                { label: "Sources included" },
                { label: "Confidence shown" }
              ]}
            >
              <DecisionBriefPreview />
            </PreviewArtifact>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

