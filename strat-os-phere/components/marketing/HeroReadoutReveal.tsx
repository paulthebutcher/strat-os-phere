/**
 * HeroReadoutReveal
 * 
 * A calm, intentional animation that reveals the decision readout as a narrative device.
 * The animation mirrors how understanding builds:
 * 1. The question appears
 * 2. Evidence accumulates
 * 3. Confidence resolves
 * 4. The recommendation lands
 * 
 * This makes the hero moment felt, not just seen.
 */
"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
import { prefersReducedMotion } from "@/lib/motion/tokens"
import { sampleAnalysis } from "./sampleReadoutData"
import { AlertTriangle } from "lucide-react"

// Helper to get score color based on confidence range
function getScoreColor(score: number): string {
  if (score >= 80) return "text-[hsl(var(--readout-score-high))]"
  if (score >= 60) return "text-[hsl(var(--readout-score-medium))]"
  return "text-[hsl(var(--readout-score-low))]"
}

// Helper to get evidence type background color
function getEvidenceTypeBgColor(type: string): string {
  const normalizedType = type.toLowerCase()
  if (normalizedType === "pricing") return "bg-[hsl(var(--readout-evidence-pricing))]"
  if (normalizedType === "docs") return "bg-[hsl(var(--readout-evidence-docs))]"
  if (normalizedType === "reviews") return "bg-[hsl(var(--readout-evidence-reviews))]"
  if (normalizedType === "changelog") return "bg-[hsl(var(--readout-evidence-changelog))]"
  return "bg-surface-muted/30"
}

// Helper to get score bar color and intensity for factor cards
function getScoreBarColor(score: number, maxScore: number): { color: string; opacity: number } {
  const percentage = (score / maxScore) * 100
  if (percentage >= 80) return { color: "hsl(var(--readout-score-high))", opacity: 0.4 }
  if (percentage >= 60) return { color: "hsl(var(--readout-score-medium))", opacity: 0.35 }
  return { color: "hsl(var(--readout-score-low))", opacity: 0.3 }
}

// Hero proof asset — single investment-ready recommendation
const primaryOpportunity = {
  title: sampleAnalysis.recommendation.title,
  confidence: sampleAnalysis.recommendation.confidenceLevel,
  overallScore: sampleAnalysis.recommendation.score,
  citationsCount: sampleAnalysis.evidence.totalSources - 7,
  evidenceTypes: sampleAnalysis.evidence.types.slice(0, 3).map(et => et.type.toLowerCase())
}

// Evidence categories with scores and sources
const evidenceCategories = [
  {
    category: sampleAnalysis.recommendation.scoreBreakdown.competitiveNorms.label,
    insight: sampleAnalysis.recommendation.scoreBreakdown.competitiveNorms.reasoning,
    score: sampleAnalysis.recommendation.scoreBreakdown.competitiveNorms.score,
    maxScore: sampleAnalysis.recommendation.scoreBreakdown.competitiveNorms.max,
    sourceTypes: ["Pricing"]
  },
  {
    category: sampleAnalysis.recommendation.scoreBreakdown.customerFriction.label,
    insight: sampleAnalysis.recommendation.scoreBreakdown.customerFriction.reasoning,
    score: sampleAnalysis.recommendation.scoreBreakdown.customerFriction.score,
    maxScore: sampleAnalysis.recommendation.scoreBreakdown.customerFriction.max,
    sourceTypes: ["Reviews"]
  },
  {
    category: sampleAnalysis.recommendation.scoreBreakdown.marketMaturity.label,
    insight: sampleAnalysis.recommendation.scoreBreakdown.marketMaturity.reasoning,
    score: sampleAnalysis.recommendation.scoreBreakdown.marketMaturity.score,
    maxScore: sampleAnalysis.recommendation.scoreBreakdown.marketMaturity.max,
    sourceTypes: ["Docs"]
  },
  {
    category: sampleAnalysis.recommendation.scoreBreakdown.businessRisk.label,
    insight: sampleAnalysis.recommendation.scoreBreakdown.businessRisk.reasoning,
    score: sampleAnalysis.recommendation.scoreBreakdown.businessRisk.score,
    maxScore: sampleAnalysis.recommendation.scoreBreakdown.businessRisk.max,
    sourceTypes: ["Pricing"]
  }
]

// Sample cited sources
const citedSources = sampleAnalysis.evidence.sources.slice(0, 3).map(source => ({
  domain: source.domain,
  type: source.type,
  path: source.path
}))

const guardrails = sampleAnalysis.whatWouldChange.slice(0, 2).map(trigger => trigger.event)

interface HeroReadoutRevealProps {
  /** Variant: full, cropped-recommendation, cropped-evidence, cropped-confidence */
  variant?: "full" | "cropped-recommendation" | "cropped-evidence" | "cropped-confidence"
  /** Optional className */
  className?: string
}

export function HeroReadoutReveal({ 
  variant = "full",
  className 
}: HeroReadoutRevealProps) {
  const [animationPhase, setAnimationPhase] = useState<0 | 1 | 2 | 3 | 4>(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useRef(false)

  useEffect(() => {
    // Check reduced motion preference
    reduceMotion.current = prefersReducedMotion()
    
    if (reduceMotion.current) {
      // Skip animation, show final state immediately
      setAnimationPhase(4)
      return
    }

    // Set up IntersectionObserver to trigger on first viewport entry
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true)
            startAnimation()
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -10% 0px",
      }
    )

    const currentRef = containerRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasAnimated])

  const startAnimation = () => {
    // Step 1: Frame appears (0-300ms)
    setAnimationPhase(1)
    
    // Step 2: Evidence signals populate (300-1200ms)
    setTimeout(() => setAnimationPhase(2), 300)
    
    // Step 3: Confidence indicator resolves (1200-1800ms)
    setTimeout(() => setAnimationPhase(3), 1200)
    
    // Step 4: Recommendation locks in (1800-2600ms)
    setTimeout(() => setAnimationPhase(4), 1800)
  }

  // Determine which parts to show based on variant
  const showRecommendation = variant === "full" || variant === "cropped-recommendation" || variant === "cropped-confidence"
  const showEvidence = variant === "full" || variant === "cropped-evidence"
  const showConfidence = variant === "full" || variant === "cropped-confidence"
  const showGuardrails = variant === "full"
  
  // For cropped variants, adjust min-height
  const isCropped = variant !== "full"

  // Animation states
  const frameVisible = animationPhase >= 1
  const evidenceVisible = animationPhase >= 2
  const confidenceVisible = animationPhase >= 3
  const recommendationHighlighted = animationPhase >= 4

  // Calculate stagger delays for evidence items (100-150ms between items)
  const getEvidenceDelay = (index: number) => {
    if (!evidenceVisible) return 0
    // Start at 300ms, stagger by 120ms
    return 300 + (index * 120)
  }

  // Calculate delay for confidence score (appears at 1200ms)
  const confidenceDelay = confidenceVisible ? 1200 : 0

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col bg-white rounded-lg shadow-lg border border-border-subtle",
        isCropped ? "min-h-[200px]" : "min-h-[600px] md:min-h-[680px]",
        className
      )}
      style={{
        opacity: frameVisible ? 1 : 0,
        transform: frameVisible ? "translateY(0)" : "translateY(6px)",
        transition: reduceMotion.current 
          ? "none" 
          : "opacity 300ms cubic-bezier(0, 0, 0.2, 1), transform 300ms cubic-bezier(0, 0, 0.2, 1)",
      }}
    >
      {/* Decision Header */}
      {showRecommendation && (
        <div 
          className={cn(
            "p-6 md:p-8 border-b border-border-subtle relative border-l-4",
            recommendationHighlighted && !reduceMotion.current
              ? "bg-surface-muted/10 border-l-[hsl(var(--readout-primary-300))]"
              : "bg-transparent border-l-[hsl(var(--readout-primary-300))]"
          )}
          style={{
            transition: reduceMotion.current 
              ? "none" 
              : "background-color 400ms cubic-bezier(0, 0, 0.2, 1) 1800ms, border-color 400ms cubic-bezier(0, 0, 0.2, 1) 1800ms",
          }}
        >
          <h3 className="text-lg md:text-xl font-semibold text-text-primary leading-snug mb-4">
            {primaryOpportunity.title}
          </h3>
          
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {variant === "full" && (
              <>
                <div 
                  className="flex items-center gap-2"
                  style={{
                    opacity: confidenceVisible ? 1 : 0,
                    transition: reduceMotion.current 
                      ? "none" 
                      : `opacity 200ms cubic-bezier(0, 0, 0.2, 1) ${confidenceDelay}ms`,
                  }}
                >
                  <span className={cn("font-semibold", getScoreColor(primaryOpportunity.overallScore))}>
                    {primaryOpportunity.overallScore}
                  </span>
                  <span className="text-text-primary">/ 100 overall</span>
                </div>
                <div 
                  className="flex items-center gap-2 flex-wrap"
                  style={{
                    opacity: evidenceVisible ? 1 : 0,
                    transition: reduceMotion.current 
                      ? "none" 
                      : `opacity 200ms cubic-bezier(0, 0, 0.2, 1) ${getEvidenceDelay(0)}ms`,
                  }}
                >
                  <span className="text-text-secondary">
                    {primaryOpportunity.citationsCount} verifiable sources
                  </span>
                </div>
                <div 
                  className="flex items-center gap-1.5 flex-wrap text-text-secondary text-sm"
                  style={{
                    opacity: evidenceVisible ? 1 : 0,
                    transition: reduceMotion.current 
                      ? "none" 
                      : `opacity 200ms cubic-bezier(0, 0, 0.2, 1) ${getEvidenceDelay(1)}ms`,
                  }}
                >
                  {primaryOpportunity.evidenceTypes.map((type, idx) => (
                    <span 
                      key={idx} 
                      className="capitalize"
                      style={{
                        opacity: evidenceVisible ? 1 : 0,
                        transition: reduceMotion.current 
                          ? "none" 
                          : `opacity 200ms cubic-bezier(0, 0, 0.2, 1) ${getEvidenceDelay(idx + 2)}ms`,
                      }}
                    >
                      {type}
                      {idx < primaryOpportunity.evidenceTypes.length - 1 && (
                        <span className="text-text-muted ml-1.5">·</span>
                      )}
                    </span>
                  ))}
                  <span className="text-text-muted ml-1.5">included</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Evidence Grid */}
      {showEvidence && (
        <div className="p-6 md:p-8 flex-1 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {evidenceCategories.map((category, idx) => {
              const delay = getEvidenceDelay(idx)
              return (
                <div 
                  key={idx}
                  className="p-4 rounded-lg border border-border-subtle bg-surface-muted/30 space-y-3 relative"
                  style={{
                    opacity: evidenceVisible ? 1 : 0,
                    transition: reduceMotion.current 
                      ? "none" 
                      : `opacity 200ms cubic-bezier(0, 0, 0.2, 1) ${delay}ms`,
                  }}
                >
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-text-primary">
                      {category.category}
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {category.insight}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {category.score} / {category.maxScore}
                      </span>
                      <span className="text-xs text-text-secondary">Score</span>
                    </div>
                  </div>
                  
                  {/* Color bar at bottom */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg"
                    style={{
                      backgroundColor: getScoreBarColor(category.score, category.maxScore).color,
                      opacity: getScoreBarColor(category.score, category.maxScore).opacity,
                    }}
                  />
                  
                  <div className="flex flex-wrap gap-1.5">
                    {category.sourceTypes.map((type, typeIdx) => (
                      <Badge 
                        key={typeIdx} 
                        variant="secondary" 
                        className={cn(
                          "text-xs px-2 py-0.5 border-0",
                          getEvidenceTypeBgColor(type)
                        )}
                        style={{
                          opacity: evidenceVisible ? 1 : 0,
                          transition: reduceMotion.current 
                            ? "none" 
                            : `opacity 150ms cubic-bezier(0, 0, 0.2, 1) ${delay + 50 + (typeIdx * 50)}ms`,
                        }}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Cited Sources */}
          {variant === "full" && (
            <div 
              className="mt-6 p-4 rounded-lg bg-surface-muted/20 border border-border-subtle"
              style={{
                opacity: evidenceVisible ? 1 : 0,
                transition: reduceMotion.current 
                  ? "none" 
                  : `opacity 200ms cubic-bezier(0, 0, 0.2, 1) ${getEvidenceDelay(evidenceCategories.length)}ms`,
              }}
            >
              <h4 className="text-sm font-semibold text-text-primary mb-3">
                Cited Sources
              </h4>
              <div className="space-y-0">
                {citedSources.map((source, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex items-center justify-between text-xs py-2",
                      idx < citedSources.length - 1 && "border-b border-border-subtle"
                    )}
                    style={{
                      opacity: evidenceVisible ? 1 : 0,
                      transition: reduceMotion.current 
                        ? "none" 
                        : `opacity 150ms cubic-bezier(0, 0, 0.2, 1) ${getEvidenceDelay(evidenceCategories.length) + 100 + (idx * 80)}ms`,
                    }}
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
          )}
        </div>
      )}

      {/* What would change this call - Inline callout bar */}
      {showGuardrails && (
        <div 
          className="p-6 md:p-8 border-t border-border-subtle bg-[hsl(var(--readout-uncertainty-bg))] relative"
          style={{
            opacity: evidenceVisible ? 1 : 0,
            transition: reduceMotion.current 
              ? "none" 
              : `opacity 200ms cubic-bezier(0, 0, 0.2, 1) ${getEvidenceDelay(evidenceCategories.length + 1)}ms`,
          }}
        >
          <p className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[hsl(var(--readout-score-low))] opacity-60" />
            What would change this call?
          </p>
          <ul className="space-y-1.5">
            {guardrails.map((guardrail, idx) => (
              <li 
                key={idx} 
                className="flex items-start gap-2 text-xs text-text-secondary"
                style={{
                  opacity: evidenceVisible ? 1 : 0,
                  transition: reduceMotion.current 
                    ? "none" 
                    : `opacity 150ms cubic-bezier(0, 0, 0.2, 1) ${getEvidenceDelay(evidenceCategories.length + 1) + 50 + (idx * 60)}ms`,
                }}
              >
                <span className="text-text-muted mt-0.5">•</span>
                <span>{guardrail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

