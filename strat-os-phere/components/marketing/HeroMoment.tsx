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

// Hero proof asset — single investment-ready recommendation
const primaryOpportunity = {
  title: "Introduce a constrained free tier to unlock mid-market adoption",
  confidence: "investment_ready" as const,
  overallScore: 82,
  citationsCount: 8,
  evidenceTypes: ["pricing", "docs", "reviews"]
}

// Evidence categories with scores and sources
const evidenceCategories = [
  {
    category: "Competitive Norms",
    insight: "4 / 5 competitors offer capped free tiers",
    score: 9,
    maxScore: 10,
    sourceTypes: ["Pricing"]
  },
  {
    category: "Customer Friction",
    insight: "Reviews cite trial friction as adoption blocker",
    score: 8,
    maxScore: 10,
    sourceTypes: ["Reviews", "G2"]
  },
  {
    category: "Market Maturity",
    insight: "Incident management buyers expect hands-on evaluation",
    score: 7,
    maxScore: 10,
    sourceTypes: ["Docs", "Positioning"]
  },
  {
    category: "Business Risk",
    insight: "Cannibalization risk limited by usage caps",
    score: 6,
    maxScore: 10,
    sourceTypes: ["Pricing"]
  }
]

// Sample cited sources
const citedSources = [
  { domain: "competitor-a.com", type: "Pricing", path: "/pricing" },
  { domain: "competitor-b.com", type: "Docs", path: "/docs/getting-started" },
  { domain: "reviews-site.com", type: "Reviews", path: "/reviews" },
]

const guardrails = [
  "Two competitors launch equivalent free tiers",
  "Trial-to-paid conversion improves materially without pricing changes"
]

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

interface HeroMomentProps {
  /** Show callout highlights (for "Zoom In" section) */
  showCallouts?: boolean
  /** Variant: full, cropped-recommendation, cropped-evidence, cropped-confidence */
  variant?: "full" | "cropped-recommendation" | "cropped-evidence" | "cropped-confidence"
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
  const showGuardrails = variant === "full"
  
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
          <h3 className="text-lg md:text-xl font-semibold text-text-primary leading-snug mb-4">
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
                  <span className="font-semibold text-text-primary">
                    {primaryOpportunity.overallScore} / 100
                  </span>
                  <span className="text-text-secondary">Overall score</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-text-secondary">
                    {primaryOpportunity.citationsCount} sources
                  </span>
                  <span className="text-text-muted">·</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {primaryOpportunity.evidenceTypes.map((type, idx) => (
                      <span key={idx} className="text-text-secondary capitalize">
                        {type}
                        {idx < primaryOpportunity.evidenceTypes.length - 1 && (
                          <span className="text-text-muted ml-1.5">·</span>
                        )}
                      </span>
                    ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {evidenceCategories.map((category, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-lg border border-border-subtle bg-surface-muted/30 space-y-3"
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
                
                <div className="flex flex-wrap gap-1.5">
                  {category.sourceTypes.map((type, typeIdx) => (
                    <Badge 
                      key={typeIdx} 
                      variant="secondary" 
                      className="text-xs px-2 py-0.5"
                    >
                      {type}
                    </Badge>
                  ))}
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

