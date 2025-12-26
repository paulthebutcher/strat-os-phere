/**
 * HeroMoment
 * 
 * The canonical "hero moment" screenshot - a single, definitive visual that anchors the entire marketing page.
 * Shows a real Decision/Readout view with:
 * - Clear recommendation at the top
 * - Confidence level/score visible
 * - Evidence categories (Pricing, Docs, Reviews)
 * - At least 1-2 cited sources
 * - "What would change this call" visible
 * 
 * This is the visual spine of the page. Everything else explains why this moment matters.
 */
"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { ConfidencePill } from "@/components/marketing/ConfidencePill"
import { sampleAnalysis } from "./sampleReadoutData"

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

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

interface HeroMomentProps {
  /** Show callout highlights (for "Zoom In" section) */
  showCallouts?: boolean
  /** Variant: full, cropped-recommendation, cropped-evidence, cropped-confidence, cropped-guardrails */
  variant?: "full" | "cropped-recommendation" | "cropped-evidence" | "cropped-confidence" | "cropped-guardrails"
  /** Optional className */
  className?: string
}

export function HeroMoment({ 
  showCallouts = false, 
  variant = "full",
  className 
}: HeroMomentProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setIsVisible(true)
      return
    }
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Determine which parts to show based on variant
  const showRecommendation = variant === "full" || variant === "cropped-recommendation" || variant === "cropped-confidence"
  const showEvidence = variant === "full" || variant === "cropped-evidence"
  const showConfidence = variant === "full" || variant === "cropped-confidence"
  const showGuardrails = variant === "full" || variant === "cropped-guardrails"
  
  // For cropped variants, adjust min-height
  const isCropped = variant !== "full"

  return (
    <div 
      className={cn(
        "flex flex-col bg-white rounded-lg shadow-lg border border-border-subtle",
        isCropped ? "min-h-[200px]" : "min-h-[600px] md:min-h-[680px]",
        "transition-opacity duration-500 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {/* Decision Header */}
      {showRecommendation && (
        <div className="p-6 md:p-8 border-b border-border-subtle relative">
          {showCallouts && (
            <div className="absolute -top-2 -right-2 bg-accent-primary text-white text-[10px] px-2 py-1 rounded-full font-medium shadow-lg z-10">
              Recommendation
            </div>
          )}
          <h3 className="text-lg md:text-xl font-semibold text-text-primary leading-snug mb-4 line-clamp-2">
            {primaryOpportunity.title}
          </h3>
          
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {showConfidence && (
              <>
                <ConfidencePill level={primaryOpportunity.confidence} className="text-xs" />
                {showCallouts && variant === "full" && (
                  <div className="absolute top-6 right-6 bg-accent-primary text-white text-[10px] px-2 py-1 rounded-full font-medium shadow-lg z-10">
                    Confidence
                  </div>
                )}
              </>
            )}
            {variant === "full" && (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary text-base">
                    {primaryOpportunity.overallScore}/100
                  </span>
                  <span className="text-text-secondary">Overall score</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-text-secondary">
                    {primaryOpportunity.citationsCount} sources
                  </span>
                  <span className="text-text-muted">·</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {primaryOpportunity.evidenceTypes.slice(0, 3).map((type, idx) => (
                      <span key={idx} className="text-text-secondary capitalize">
                        {type}
                        {idx < Math.min(primaryOpportunity.evidenceTypes.length, 3) - 1 && (
                          <span className="text-text-muted ml-1.5">·</span>
                        )}
                      </span>
                    ))}
                    {primaryOpportunity.evidenceTypes.length > 3 && (
                      <>
                        <span className="text-text-muted ml-1.5">·</span>
                        <span className="text-text-secondary">+{primaryOpportunity.evidenceTypes.length - 3}</span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Evidence Grid */}
      {showEvidence && (
        <div className="p-6 md:p-8 flex-1 relative">
          {showCallouts && (
            <div className="absolute top-4 right-4 bg-accent-primary text-white text-[10px] px-2 py-1 rounded-full font-medium shadow-lg z-10">
              Source links
            </div>
          )}
          {/* Evidence row with chips */}
          {variant === "full" && (
            <div className="mb-4 pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">Evidence:</span>
                {primaryOpportunity.evidenceTypes.slice(0, 3).map((type, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="text-[10px] px-2 py-0.5"
                  >
                    {type}
                  </Badge>
                ))}
                {primaryOpportunity.evidenceTypes.length > 3 && (
                  <Badge 
                    variant="secondary" 
                    className="text-[10px] px-2 py-0.5"
                  >
                    +{primaryOpportunity.evidenceTypes.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {evidenceCategories.map((category, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-lg border border-border-subtle bg-surface-muted/30 space-y-2"
              >
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-text-primary line-clamp-1">
                    {category.category}
                  </h4>
                  <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">
                    {category.insight}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-1.5 border-t border-border-subtle">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-text-primary">
                      {category.score}/{category.maxScore}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {category.sourceTypes.slice(0, 3).map((type, typeIdx) => (
                    <Badge 
                      key={typeIdx} 
                      variant="secondary" 
                      className="text-[10px] px-1.5 py-0.5"
                    >
                      {type}
                    </Badge>
                  ))}
                  {category.sourceTypes.length > 3 && (
                    <Badge 
                      variant="secondary" 
                      className="text-[10px] px-1.5 py-0.5"
                    >
                      +{category.sourceTypes.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cited Sources */}
          {variant === "full" && (
            <div className="mt-6 p-4 rounded-lg bg-surface-muted/20 border border-border-subtle">
              <h4 className="text-sm font-semibold text-text-primary mb-3">
                Cited Sources
              </h4>
              <div className="space-y-2">
                {citedSources.map((source, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
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
        <div className="p-6 md:p-8 border-t border-border-subtle bg-surface-muted/30 relative">
          {showCallouts && (
            <div className="absolute -top-2 left-4 bg-accent-primary text-white text-[10px] px-2 py-1 rounded-full font-medium shadow-lg z-10">
              What would change this
            </div>
          )}
          <p className="text-sm font-semibold text-text-primary mb-3">
            What would change this decision?
          </p>
          <ul className="space-y-1.5">
            {guardrails.map((guardrail, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
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

