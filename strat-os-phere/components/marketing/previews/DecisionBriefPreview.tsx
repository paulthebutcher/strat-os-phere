/**
 * DecisionBriefPreview
 * 
 * Hero preview showing the Decision Brief (the output artifact).
 * Full-width "Decision Canvas" that shows recommendation, evidence categories,
 * scoring breakdown, and confidence logic - all inline. No sidebar.
 */
"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { ConfidencePill } from "@/components/marketing/ConfidencePill"

// Hero proof asset — single investment-ready recommendation only
const primaryOpportunity = {
  title: "Introduce a constrained free tier to unlock mid-market adoption",
  confidence: "investment_ready" as const,
  overallScore: 81.4,
  citationsCount: 11,
  evidenceTypes: ["pricing", "docs", "reviews"]
}

// Evidence categories with scores and sources
const evidenceCategories = [
  {
    category: "Competitive Norms",
    insight: "4 of 5 competitors offer free tiers with usage-based limits; StatusFlow and PagerGrid expanded theirs in the past 6 months",
    score: 8.6,
    maxScore: 10,
    sourceTypes: ["Pricing"]
  },
  {
    category: "Customer Friction",
    insight: "Enterprise reviews mention evaluation friction and security review delays before purchase; mid-market buyers cite trial time limits as adoption blockers",
    score: 7.9,
    maxScore: 10,
    sourceTypes: ["Reviews", "G2"]
  },
  {
    category: "Market Maturity",
    insight: "Incident management buyers expect hands-on evaluation periods and reliability proof before committing; free tiers have become table stakes in this category",
    score: 7.1,
    maxScore: 10,
    sourceTypes: ["Docs", "Positioning"]
  },
  {
    category: "Business Risk",
    insight: "Cannibalization risk appears manageable given hard caps on team size and retention windows; upgrade conversion data from competitors supports this",
    score: 6.4,
    maxScore: 10,
    sourceTypes: ["Pricing"]
  }
]

// Scoring weights
const scoringWeights = [
  { factor: "Market Norms", weight: "30%" },
  { factor: "Customer Signals", weight: "30%" },
  { factor: "Risk", weight: "20%" },
  { factor: "Strategic Fit", weight: "20%" }
]

const guardrails = [
  "Two competitors introduce equivalent free tiers with usage parity (5+ seats, 14+ days retention) within 90 days",
  "Trial-to-paid conversion improves to above 18% without pricing or feature changes, indicating reduced friction"
]

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function DecisionBriefPreview() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setIsVisible(true)
      return
    }
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div 
      className={cn(
        "flex flex-col bg-white min-h-[600px] md:min-h-[680px] rounded-lg shadow-lg border border-border-subtle",
        "transition-opacity duration-500 ease-out",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Decision Header */}
      <div className="p-6 md:p-8 border-b border-border-subtle">
        <h3 className="text-lg md:text-xl font-semibold text-text-primary leading-snug mb-4">
          {primaryOpportunity.title}
        </h3>
        
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <ConfidencePill level={primaryOpportunity.confidence} className="text-xs" />
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
        </div>
      </div>

      {/* Evidence Grid */}
      <div className="p-6 md:p-8 flex-1">
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

        {/* Scoring & Confidence Logic */}
        <div className="mt-6 p-4 rounded-lg bg-surface-muted/20 border border-border-subtle">
          <h4 className="text-sm font-semibold text-text-primary mb-3">
            How this was scored
          </h4>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3 text-xs">
            {scoringWeights.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-text-secondary">{item.factor}</span>
                <span className="text-text-muted">{item.weight}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            This recommendation exceeds the investment threshold due to strong competitive norms and consistent customer friction signals.
          </p>
        </div>
      </div>

      {/* What would change this call - Inline callout bar */}
      <div className="p-6 md:p-8 border-t border-border-subtle bg-surface-muted/30">
        <p className="text-sm font-semibold text-text-primary mb-3">
          What would change this call?
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
    </div>
  )
}

