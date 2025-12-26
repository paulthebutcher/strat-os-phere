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
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { SectionHeader } from "./SectionHeader"
import { Reveal } from "./motion"
import { ConfidencePill } from "./ConfidencePill"
import { sampleAnalysis } from "./sampleReadoutData"
import { Play, Pause } from "lucide-react"

type AnnotationId = "recommendation" | "evidence" | "confidence" | "scorecard" | "what-would-change"

interface Annotation {
  id: AnnotationId
  label: string
  explanation: string
  targetSelector: string // CSS selector for the element to highlight
}

const annotations: Annotation[] = [
  {
    id: "recommendation",
    label: "Recommendation",
    explanation: "One call, not a list. Clear enough to act on.",
    targetSelector: "[data-annotation='recommendation']",
  },
  {
    id: "evidence",
    label: "Evidence",
    explanation: "Every claim links to a source you can open.",
    targetSelector: "[data-annotation='evidence']",
  },
  {
    id: "confidence",
    label: "Confidence",
    explanation: "Bounded by coverage, not vibes.",
    targetSelector: "[data-annotation='confidence']",
  },
  {
    id: "scorecard",
    label: "Scorecard",
    explanation: "Why this ranks above other bets.",
    targetSelector: "[data-annotation='scorecard']",
  },
  {
    id: "what-would-change",
    label: "What would change",
    explanation: "Signals that could strengthen or erase the edge.",
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

  // Update highlight overlay position
  useEffect(() => {
    if (!activeAnnotation || !readoutRef.current || !highlightOverlayRef.current) {
      if (highlightOverlayRef.current) {
        highlightOverlayRef.current.style.display = "none"
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

    const overlay = highlightOverlayRef.current
    overlay.style.display = "block"
    overlay.style.top = `${targetRect.top - containerRect.top + container.scrollTop}px`
    overlay.style.left = `${targetRect.left - containerRect.left}px`
    overlay.style.width = `${targetRect.width}px`
    overlay.style.height = `${targetRect.height}px`
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
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Desktop: Annotation Rail (Left) */}
            <div className="hidden lg:flex flex-col gap-3 w-64 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-text-primary">Annotations</h3>
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
                    <p className="text-sm font-medium text-text-primary">{annotation.label}</p>
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
                {/* Highlight Overlay */}
                <div
                  ref={highlightOverlayRef}
                  className="absolute pointer-events-none z-10 rounded-md border-2 border-accent-primary bg-accent-primary/5 shadow-[0_0_0_4px_rgba(var(--accent-primary)/0.1)] transition-all duration-300"
                  style={{ display: "none" }}
                />

                {/* Readout Content */}
                <div className="p-6 md:p-8">
                  {/* Recommendation Section */}
                  <div
                    data-annotation="recommendation"
                    className={cn(
                      "pb-6 border-b border-border-subtle transition-all duration-300",
                      activeAnnotation === "recommendation" && "bg-accent-primary/5 -mx-6 md:-mx-8 px-6 md:px-8 pt-6 rounded-t-lg"
                    )}
                  >
                    <h3 className="text-lg md:text-xl font-semibold text-text-primary leading-snug mb-4">
                      {sampleAnalysis.recommendation.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <ConfidencePill level={sampleAnalysis.recommendation.confidenceLevel} />
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
                    className={cn(
                      "py-6 border-b border-border-subtle transition-all duration-300",
                      activeAnnotation === "confidence" && "bg-accent-primary/5 -mx-6 md:-mx-8 px-6 md:px-8 rounded-lg"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <ConfidencePill level={sampleAnalysis.recommendation.confidenceLevel} />
                      <span className="text-sm text-text-secondary">
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
                    className={cn(
                      "py-6 border-b border-border-subtle transition-all duration-300",
                      activeAnnotation === "scorecard" && "bg-accent-primary/5 -mx-6 md:-mx-8 px-6 md:px-8 rounded-lg"
                    )}
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
                    className={cn(
                      "py-6 border-b border-border-subtle transition-all duration-300",
                      activeAnnotation === "evidence" && "bg-accent-primary/5 -mx-6 md:-mx-8 px-6 md:px-8 rounded-lg"
                    )}
                  >
                    <h4 className="text-sm font-semibold text-text-primary mb-4">Evidence</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {sampleAnalysis.evidence.types.map((type, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                          {type.type} ({type.count})
                        </Badge>
                      ))}
                    </div>
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
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                            {source.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What Would Change Section */}
                  <div
                    data-annotation="what-would-change"
                    className={cn(
                      "pt-6 transition-all duration-300",
                      activeAnnotation === "what-would-change" && "bg-accent-primary/5 -mx-6 md:-mx-8 px-6 md:px-8 pb-6 rounded-b-lg"
                    )}
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

              {/* Explanation Panel */}
              {activeAnnotationData && (
                <div className="mt-4 p-4 rounded-lg border border-border-subtle bg-surface-muted/30">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {activeAnnotationData.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Mobile: Annotation Chips (Horizontal Row) */}
            <div className="lg:hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary">Annotations</h3>
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
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                      activeAnnotation === annotation.id
                        ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                        : "border-border-subtle bg-white text-text-secondary hover:border-accent-primary/30 hover:text-text-primary"
                    )}
                  >
                    {annotation.label}
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
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

