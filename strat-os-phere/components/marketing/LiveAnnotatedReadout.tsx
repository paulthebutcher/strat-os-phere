/**
 * Live Annotated Readout Section
 * 
 * Interactive readout demonstration with clickable annotations that highlight
 * specific regions and show explanations. Includes a "Play tour" feature that
 * auto-steps through annotations.
 * 
 * Marketing-only, client-side only, no backend dependencies.
 */
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { SectionHeader } from "./SectionHeader"
import { Reveal } from "./motion"
import { sampleAnalysis } from "./sampleReadoutData"
import { Play, Pause } from "lucide-react"

type AnnotationId = "recommendation" | "evidence" | "confidence" | "scorecard" | "what-would-change"

interface Annotation {
  id: AnnotationId
  number: number
  caption: string
  explanation: string
  targetSelector: string // CSS selector for the element to highlight
}

const annotations: Annotation[] = [
  {
    id: "recommendation",
    number: 1,
    caption: "The call",
    explanation: "One recommendation, clearly stated.",
    targetSelector: "[data-annotation='recommendation']",
  },
  {
    id: "evidence",
    number: 2,
    caption: "The proof",
    explanation: "Sources you can open and share.",
    targetSelector: "[data-annotation='evidence']",
  },
  {
    id: "confidence",
    number: 3,
    caption: "The bounds",
    explanation: "Confidence is tied to coverage.",
    targetSelector: "[data-annotation='confidence']",
  },
  {
    id: "scorecard",
    number: 4,
    caption: "The score",
    explanation: "Why this outranks other bets.",
    targetSelector: "[data-annotation='scorecard']",
  },
  {
    id: "what-would-change",
    number: 5,
    caption: "The trigger",
    explanation: "What would change the conclusion.",
    targetSelector: "[data-annotation='what-would-change']",
  },
]

export function LiveAnnotatedReadout() {
  const [activeAnnotation, setActiveAnnotation] = useState<AnnotationId | null>(null)
  const [isTourPlaying, setIsTourPlaying] = useState(false)
  const [tourIndex, setTourIndex] = useState(0)
  const readoutRef = useRef<HTMLDivElement>(null)
  const highlightOverlayRef = useRef<HTMLDivElement>(null)
  const tourTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle annotation click
  const handleAnnotationClick = (annotationId: AnnotationId, stopTour = true) => {
    setActiveAnnotation(annotationId)
    if (stopTour) {
      setIsTourPlaying(false)
      if (tourTimeoutRef.current) {
        clearTimeout(tourTimeoutRef.current)
      }
    }
    scrollToAnnotation(annotationId)
  }

  // Scroll to annotation target
  const scrollToAnnotation = (annotationId: AnnotationId) => {
    const annotation = annotations.find((a) => a.id === annotationId)
    if (!annotation || !readoutRef.current) return

    const target = readoutRef.current.querySelector(annotation.targetSelector) as HTMLElement
    if (target) {
      const container = readoutRef.current
      const containerRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const scrollTop = container.scrollTop + (targetRect.top - containerRect.top) - 20

      container.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      })
    }
  }

  // Update highlight overlay position with percentage-based positioning
  useEffect(() => {
    if (!activeAnnotation || !readoutRef.current || !highlightOverlayRef.current) {
      if (highlightOverlayRef.current) {
        highlightOverlayRef.current.style.display = "none"
      }
      // Hide spotlight mask
      const spotlightMask = readoutRef.current?.querySelector('[data-spotlight-mask]') as HTMLElement
      if (spotlightMask) {
        spotlightMask.style.display = "none"
      }
      return
    }

    const annotation = annotations.find((a) => a.id === activeAnnotation)
    if (!annotation) return

    const target = readoutRef.current.querySelector(annotation.targetSelector) as HTMLElement
    if (!target) return

    const container = readoutRef.current
    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()

    // Calculate positions in pixels (absolute positioning within container)
    const top = targetRect.top - containerRect.top + container.scrollTop
    const left = targetRect.left - containerRect.left
    const width = targetRect.width
    const height = targetRect.height

    const overlay = highlightOverlayRef.current
    overlay.style.display = "block"
    overlay.style.top = `${top}px`
    overlay.style.left = `${left}px`
    overlay.style.width = `${width}px`
    overlay.style.height = `${height}px`

    // Update spotlight mask position - subtle dimming effect
    const spotlightMask = readoutRef.current?.querySelector('[data-spotlight-mask]') as HTMLElement
    if (spotlightMask) {
      const centerX = (left + width / 2) / containerRect.width
      const centerY = (top + height / 2) / container.scrollHeight
      const radius = Math.max(width, height) * 1.5
      const maxRadius = Math.sqrt(containerRect.width ** 2 + container.scrollHeight ** 2)
      const radiusPercent = (radius / maxRadius) * 100
      
      spotlightMask.style.display = "block"
      // Use inline style with calculated values for radial gradient
      const gradient = `radial-gradient(ellipse ${radiusPercent * 2}% ${radiusPercent * 2}% at ${centerX * 100}% ${centerY * 100}%, transparent 0%, transparent 30%, rgba(0, 0, 0, 0.04) 100%)`
      spotlightMask.style.background = gradient
    }
  }, [activeAnnotation])

  // Handle tour playback
  const startTour = () => {
    setIsTourPlaying(true)
    setTourIndex(0)
    handleAnnotationClick(annotations[0].id, false)
  }

  const stopTour = () => {
    setIsTourPlaying(false)
    if (tourTimeoutRef.current) {
      clearTimeout(tourTimeoutRef.current)
    }
  }

  useEffect(() => {
    if (!isTourPlaying) return

    tourTimeoutRef.current = setTimeout(() => {
      const nextIndex = (tourIndex + 1) % annotations.length
      setTourIndex(nextIndex)
      handleAnnotationClick(annotations[nextIndex].id, false)
    }, 1500) // 1.5s per step

    return () => {
      if (tourTimeoutRef.current) {
        clearTimeout(tourTimeoutRef.current)
      }
    }
  }, [isTourPlaying, tourIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeAnnotationData = activeAnnotation
    ? annotations.find((a) => a.id === activeAnnotation)
    : null

  return (
    <MarketingSection variant="default" id="live-readout">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <SectionHeader
            title="A readout you can take into the meeting"
            subhead="Annotated to show what matters, where it came from, and what would change the call."
            align="center"
            className="mb-8 sm:mb-12"
          />
        </Reveal>

        <Reveal delay={60}>
          {/* Mobile: Annotation Rail (Top) */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary">Steps</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={isTourPlaying ? stopTour : startTour}
                className="text-xs h-8"
              >
                {isTourPlaying ? (
                  <>
                    <Pause className="w-3 h-3 mr-1.5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-1.5" />
                    Play tour
                  </>
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {annotations.map((annotation) => (
                <button
                  key={annotation.id}
                  onClick={() => handleAnnotationClick(annotation.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200",
                    activeAnnotation === annotation.id
                      ? "border-accent-primary bg-accent-primary/5 shadow-sm"
                      : "border-border-subtle bg-white hover:border-accent-primary/30 hover:bg-surface-muted/50"
                  )}
                >
                  <span className="text-xs font-semibold text-text-muted">{annotation.number}.</span>
                  <span className="text-xs font-medium text-text-primary">{annotation.caption}</span>
                </button>
              ))}
            </div>
            {activeAnnotationData && (
              <div className="mt-3 p-3 rounded-lg border border-border-subtle bg-surface-muted/30">
                <p className="text-xs text-text-secondary leading-relaxed">
                  {activeAnnotationData.explanation}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Desktop: Annotation Rail (Left) */}
            <div className="hidden lg:flex flex-col gap-3 w-64 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-text-primary">Steps</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isTourPlaying ? stopTour : startTour}
                  className="text-xs h-8"
                >
                  {isTourPlaying ? (
                    <>
                      <Pause className="w-3 h-3 mr-1.5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-1.5" />
                      Play tour
                    </>
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                {annotations.map((annotation) => (
                  <button
                    key={annotation.id}
                    onClick={() => handleAnnotationClick(annotation.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all duration-200",
                      activeAnnotation === annotation.id
                        ? "border-accent-primary bg-accent-primary/5 shadow-sm"
                        : "border-border-subtle bg-white hover:border-accent-primary/30 hover:bg-surface-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-text-muted">{annotation.number}.</span>
                      <p className="text-sm font-medium text-text-primary">{annotation.caption}</p>
                    </div>
                    {activeAnnotation === annotation.id && (
                      <p className="text-xs text-text-secondary leading-relaxed mt-1">
                        {annotation.explanation}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Readout Card (Right on desktop, top on mobile) */}
            <div className="flex-1 relative">
              <div
                ref={readoutRef}
                className="relative bg-white rounded-lg shadow-lg border border-border-subtle overflow-auto max-h-[800px]"
              >
                {/* Spotlight mask overlay - dims everything except active region */}
                <div
                  data-spotlight-mask
                  className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
                  style={{
                    display: "none",
                  }}
                />
                
                {/* Highlight Overlay - thin outline with mild glow */}
                <div
                  ref={highlightOverlayRef}
                  className="absolute pointer-events-none z-20 rounded-md border border-accent-primary/40 bg-transparent shadow-[0_0_0_1px_rgba(79,70,229,0.15),0_0_12px_rgba(79,70,229,0.1)] transition-all duration-300"
                  style={{ display: "none" }}
                />

                {/* Readout Content */}
                <div className="p-6 md:p-8">
                  {/* Recommendation Section */}
                  <div
                    data-annotation="recommendation"
                    className="pb-6 border-b border-border-subtle"
                  >
                    <h3 className="text-lg md:text-xl font-semibold text-text-primary leading-snug mb-4">
                      {sampleAnalysis.recommendation.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">
                          {sampleAnalysis.recommendation.score} / 100
                        </span>
                        <span className="text-text-secondary">Overall score</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-text-secondary">
                          {sampleAnalysis.evidence.totalSources} sources
                        </span>
                        <span className="text-text-muted">·</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {sampleAnalysis.evidence.types.slice(0, 5).map((type, idx) => (
                            <span key={idx} className="text-text-secondary capitalize">
                              {type.type}
                              {idx < sampleAnalysis.evidence.types.slice(0, 5).length - 1 && (
                                <span className="text-text-muted ml-1.5">·</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Why This Matters */}
                  <div className="py-6 border-b border-border-subtle">
                    <h4 className="text-sm font-semibold text-text-primary mb-2">Why this matters</h4>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Mid-market teams evaluating reliability tooling need hands-on proof before committing budget. 
                      A constrained free tier removes the trial friction that's blocking conversions, while competitive 
                      norms show this is an expected entry point in the market.
                    </p>
                  </div>

                  {/* Confidence Section */}
                  <div
                    data-annotation="confidence"
                    className="py-6 border-b border-border-subtle"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm font-semibold text-text-primary">
                        {sampleAnalysis.recommendation.confidence}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Confidence is based on evidence coverage across {sampleAnalysis.evidence.totalSources} sources 
                      from {sampleAnalysis.competitors.length} competitors, not subjective assessment.
                    </p>
                  </div>

                  {/* Scorecard Section */}
                  <div
                    data-annotation="scorecard"
                    className="py-6 border-b border-border-subtle"
                  >
                    <h4 className="text-sm font-semibold text-text-primary mb-4">Scorecard</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.values(sampleAnalysis.recommendation.scoreBreakdown).map((breakdown, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg border border-border-subtle bg-surface-muted/30 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-semibold text-text-primary">
                              {breakdown.label}
                            </h5>
                            <span className="text-sm font-semibold text-accent-primary">
                              {breakdown.score} / {breakdown.max}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {breakdown.reasoning}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evidence Section */}
                  <div
                    data-annotation="evidence"
                    className="py-6 border-b border-border-subtle"
                  >
                    <h4 className="text-sm font-semibold text-text-primary mb-4">Evidence</h4>
                    <div className="space-y-2">
                      {sampleAnalysis.evidence.sources.slice(0, 5).map((source, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-2 rounded border border-border-subtle bg-surface-muted/20"
                        >
                          <a
                            href={`https://${source.domain}${source.path}`}
                            className="text-accent-primary hover:underline flex items-center gap-2"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span>{source.domain}{source.path}</span>
                          </a>
                          <span className="text-text-muted text-[10px]">
                            {source.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What Would Change Section */}
                  <div
                    data-annotation="what-would-change"
                    className="pt-6"
                  >
                    <h4 className="text-sm font-semibold text-text-primary mb-3">
                      What would change this decision?
                    </h4>
                    <ul className="space-y-2">
                      {sampleAnalysis.whatWouldChange.map((trigger, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
                          <span className="text-text-muted mt-0.5">•</span>
                          <span>{trigger.event}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

