'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { OpportunityV3Item } from '@/lib/schemas/opportunityV3'

interface ScoringFactor {
  name: string
  weight: number
  score: number | null
}

/**
 * Extract scoring factors from opportunity scoring breakdown
 */
function extractScoringFactors(opportunity: OpportunityV3Item, totalScore: number | null): ScoringFactor[] {
  const factors: ScoringFactor[] = []
  
  // Check if scoring breakdown exists
  if (opportunity.scoring && typeof opportunity.scoring === 'object' && 'breakdown' in opportunity.scoring) {
    const breakdown = opportunity.scoring.breakdown as Record<string, number>
    
    // Default weights (can be overridden if weights are provided)
    const defaultWeights: Record<string, number> = {
      customer_pain: 0.20,
      willingness_to_pay: 0.15,
      strategic_fit: 0.20,
      feasibility: 0.15,
      defensibility: 0.15,
      competitor_gap: 0.10,
      recencyConfidence: 0.05,
    }
    
    // Get weights from scoring object if available
    let weights: Record<string, number> = defaultWeights
    if ('weights' in opportunity.scoring && 
        opportunity.scoring.weights && 
        typeof opportunity.scoring.weights === 'object') {
      weights = opportunity.scoring.weights as Record<string, number>
    }
    
    // Map breakdown to factors
    const factorNames: Record<string, string> = {
      customer_pain: 'Customer',
      willingness_to_pay: 'Market',
      strategic_fit: 'Fit',
      feasibility: 'Risk',
      defensibility: 'Defensibility',
      competitor_gap: 'Competitive Gap',
      recencyConfidence: 'Recency',
    }
    
    for (const [key, score] of Object.entries(breakdown)) {
      if (typeof score === 'number' && key in factorNames) {
        const weight = weights[key] || 0
        factors.push({
          name: factorNames[key],
          weight: weight * 100, // Convert to percentage
          score,
        })
      }
    }
  }
  
  // If no breakdown, use generic factors based on common patterns
  if (factors.length === 0 && totalScore !== null) {
    factors.push(
      { name: 'Market', weight: 30, score: null },
      { name: 'Customer', weight: 30, score: null },
      { name: 'Risk', weight: 20, score: null },
      { name: 'Fit', weight: 20, score: null }
    )
  }
  
  return factors
}

/**
 * Get confidence threshold explanation
 */
function getConfidenceThreshold(score: number | null): string {
  if (score === null) {
    return 'Score not available'
  }
  
  if (score >= 70) {
    return 'Investment-ready (70+)'
  } else if (score >= 50) {
    return 'Directional (50-69)'
  } else {
    return 'Exploratory (<50)'
  }
}

/**
 * Scoring Logic - Explicit, minimal scoring explanation
 */
export function ScoringLogic({ 
  opportunity, 
  score 
}: { 
  opportunity: OpportunityV3Item
  score: number | null 
}) {
  const factors = extractScoringFactors(opportunity, score)
  const threshold = getConfidenceThreshold(score)
  
  if (factors.length === 0) {
    return null
  }
  
  return (
    <section className="space-y-4 pt-6 border-t border-border">
      <h2 className="text-lg font-semibold text-foreground">Scoring Logic</h2>
      
      <div className="space-y-3">
        {/* Weighted factors */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Weighted Factors</h3>
          <div className="space-y-2">
            {factors.map((factor, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{factor.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {factor.weight.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${factor.weight}%` }}
                    />
                  </div>
                </div>
                {factor.score !== null && (
                  <div className="text-xs font-medium text-muted-foreground shrink-0">
                    {factor.score.toFixed(1)}/10
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Confidence threshold */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Confidence Threshold</span>
            <span className="text-xs text-muted-foreground">{threshold}</span>
          </div>
        </div>
        
        {/* Score to verdict explanation */}
        {score !== null && (
          <p className="text-sm text-muted-foreground leading-relaxed pt-2">
            {score >= 70
              ? 'This score indicates strong evidence across multiple dimensions, making this an investment-ready decision.'
              : score >= 50
              ? 'This score suggests directional evidence, with room for additional validation to strengthen the call.'
              : 'This score reflects early signals that warrant exploration and further validation.'}
          </p>
        )}
      </div>
    </section>
  )
}

