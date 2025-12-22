'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionCard } from '@/components/results/SectionCard'
import { Collapsible } from '@/components/ui/collapsible'
import type { StrategicBetsArtifactContent } from '@/lib/schemas/strategicBet'
import { formatStrategicBetsToMarkdown } from '@/lib/results/normalizeArtifacts'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'

interface StrategicBetsSectionProps {
  bets: StrategicBetsArtifactContent | null
  opportunities: OpportunityV3ArtifactContent | OpportunitiesArtifactContent | null
  projectId: string
}

/**
 * Strategic Bets section for Results Memo
 * 
 * Renders 2-5 bets maximum, ranked. Each bet includes:
 * - Recommendation headline
 * - What we'd have to say no to
 * - Capability this forces us to build
 * - Why competitors won't follow easily
 * - First experiment
 * - Signals (optional)
 */
export function StrategicBetsSection({
  bets,
  opportunities,
  projectId,
}: StrategicBetsSectionProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [expandedBets, setExpandedBets] = useState<Set<number>>(new Set())
  
  if (!bets || !bets.bets || bets.bets.length === 0) {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Strategic Bets</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A bet is a commitment: tradeoffs, capability, and defensibility.
          </p>
        </div>
        
        <SectionCard className="py-12">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              No Strategic Bets yet. Regenerate analysis to create them.
            </p>
            <Button asChild variant="outline">
              <a href={`/projects/${projectId}/results?tab=strategic_bets`}>
                Generate Strategic Bets
              </a>
            </Button>
          </div>
        </SectionCard>
      </section>
    )
  }
  
  // Limit to 5 bets maximum
  const displayBets = bets.bets.slice(0, 5)
  
  const handleCopyBet = async (betIndex: number) => {
    const bet = displayBets[betIndex]
    if (!bet) return
    
    // Create a single-bet markdown
    const betMarkdown = formatStrategicBetsToMarkdown({
      meta: bets.meta,
      bets: [bet],
    })
    
    try {
      await navigator.clipboard.writeText(betMarkdown)
      setCopiedIndex(betIndex)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedBets)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedBets(newExpanded)
  }
  
  // Helper to find linked opportunities
  const findLinkedOpportunities = (bet: typeof displayBets[0]) => {
    if (!opportunities || !bet.opportunity_source_ids?.length) {
      return []
    }
    
    const oppsList = 'opportunities' in opportunities ? opportunities.opportunities : []
    return oppsList.filter((opp) => {
      const oppId = 'id' in opp ? opp.id : opp.title.toLowerCase().replace(/\s+/g, '-')
      return bet.opportunity_source_ids.includes(oppId)
    })
  }
  
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Strategic Bets</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A bet is a commitment: tradeoffs, capability, and defensibility.
        </p>
      </div>
      
      <div className="space-y-6">
        {displayBets.map((bet, index) => {
          const isExpanded = expandedBets.has(index)
          const linkedOpps = findLinkedOpportunities(bet)
          
          // Generate single-bet markdown for copy
          const betMarkdown = formatStrategicBetsToMarkdown({
            meta: bets.meta,
            bets: [bet],
          })
          
          return (
            <SectionCard key={bet.id || index} className="space-y-6">
              <header className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold text-foreground leading-tight flex-1">
                    {bet.title}
                  </h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyBet(index)}
                      className="text-xs"
                    >
                      {copiedIndex === index ? 'Copied!' : 'Copy bet'}
                    </Button>
                    <Badge
                      variant={
                        bet.confidence_score >= 70
                          ? 'success'
                          : bet.confidence_score >= 50
                          ? 'warning'
                          : 'default'
                      }
                      className="text-xs"
                    >
                      {bet.confidence_score}/100
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{bet.summary}</p>
              </header>
              
              {/* Three-column emphasis row */}
              <div className="grid gap-6 md:grid-cols-3 pt-4 border-t border-border">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    What we'd have to say no to
                  </h4>
                  <ul className="space-y-1.5">
                    {bet.what_we_say_no_to?.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-foreground leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Capability this forces us to build
                  </h4>
                  <ul className="space-y-1.5">
                    {bet.forced_capabilities?.map((capability, capabilityIndex) => (
                      <li key={capabilityIndex} className="text-sm text-foreground leading-relaxed">
                        • {capability}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Why competitors won't follow easily
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {bet.why_competitors_wont_follow}
                  </p>
                </div>
              </div>
              
              {/* First experiment */}
              {bet.first_real_world_proof && (
                <div className="pt-4 border-t border-border">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    First experiment ({bet.first_real_world_proof.timeframe_weeks} weeks)
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed mb-2">
                    {bet.first_real_world_proof.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Success signal:</span>{' '}
                    {bet.first_real_world_proof.success_signal}
                  </p>
                </div>
              )}
              
              {/* Signals (collapsible) */}
              {bet.supporting_signals && bet.supporting_signals.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <Collapsible title="Signals" defaultOpen={false}>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {bet.supporting_signals.map((signal, signalIndex) => (
                        <Badge key={signalIndex} variant="secondary" className="text-xs">
                          {signal.source_type} ({signal.citation_count})
                        </Badge>
                      ))}
                    </div>
                  </Collapsible>
                </div>
              )}
              
              {/* Supporting opportunities (expandable) */}
              {linkedOpps.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => toggleExpand(index)}
                    className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                  >
                    {isExpanded ? 'Hide' : 'View'} supporting opportunities ({linkedOpps.length})
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-3 space-y-2">
                      {linkedOpps.map((opp) => {
                        const title = opp.title
                        const description = 'one_liner' in opp 
                          ? opp.one_liner 
                          : ('who_it_serves' in opp ? opp.who_it_serves : '') ?? ''
                        const oppKey = 'id' in opp ? opp.id : title
                        return (
                          <div key={oppKey} className="text-sm p-3 bg-muted/50 rounded-md">
                            <div className="font-medium text-foreground">{title}</div>
                            {description && (
                              <div className="text-muted-foreground mt-1">{description}</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </SectionCard>
          )
        })}
      </div>
    </section>
  )
}

