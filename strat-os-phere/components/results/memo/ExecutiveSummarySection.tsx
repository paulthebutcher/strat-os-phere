'use client'

import { SectionCard } from '@/components/results/SectionCard'
import type { StrategicBetsArtifactContent } from '@/lib/schemas/strategicBet'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'

interface ExecutiveSummarySectionProps {
  bets: StrategicBetsArtifactContent | null
  opportunities: OpportunityV3ArtifactContent | OpportunitiesArtifactContent | null
}

/**
 * Executive Summary section for Results Memo
 * 
 * Provides a short "What Plinth recommends" paragraph and 3 key bullets:
 * - What to do
 * - What to say no to
 * - Why this is defensible
 */
export function ExecutiveSummarySection({
  bets,
  opportunities,
}: ExecutiveSummarySectionProps) {
  // Generate recommendation text from top bets/opportunities
  let recommendationText = ''
  let whatToDo: string[] = []
  let whatToSayNoTo: string[] = []
  let whyDefensible = ''
  
  if (bets?.bets && bets.bets.length > 0) {
    // Use top 2 bets to generate summary
    const topBets = bets.bets.slice(0, 2)
    recommendationText = topBets
      .map((bet) => bet.summary)
      .join(' ')
      .substring(0, 300)
    whatToDo = topBets.flatMap((bet) => bet.title ? [bet.title] : [])
    whatToSayNoTo = topBets.flatMap((bet) => bet.what_we_say_no_to ?? []).slice(0, 3)
    whyDefensible = topBets[0]?.why_competitors_wont_follow ?? 
                    'Competitive differentiation is built on structural advantages and capability gaps.'
  } else if (opportunities) {
    // Fallback to opportunities if bets not available
    const oppsList = 'opportunities' in opportunities ? opportunities.opportunities : []
    const topOpps = oppsList.slice(0, 2)
    
    if (topOpps.length > 0) {
      recommendationText = topOpps
        .map((opp) => {
          if ('one_liner' in opp) {
            return opp.one_liner
          }
          return opp.title + ': ' + (opp.who_it_serves ?? '')
        })
        .join(' ')
        .substring(0, 300)
      
      whatToDo = topOpps.map((opp) => opp.title).slice(0, 2)
      
      // Extract "say no to" from tradeoffs if available
      if ('tradeoffs' in topOpps[0] && topOpps[0].tradeoffs) {
        whatToSayNoTo = topOpps[0].tradeoffs.what_we_say_no_to?.slice(0, 3) ?? []
      } else if ('what_competitors_do_today' in topOpps[0] && topOpps[0].what_competitors_do_today) {
        whatToSayNoTo = ['Continue with current competitive positioning']
      }
      
      whyDefensible = ('why_they_cant_easily_copy' in topOpps[0] && topOpps[0].why_they_cant_easily_copy) ||
                      ('tradeoffs' in topOpps[0] && topOpps[0].tradeoffs?.why_competitors_wont_follow?.[0]) ||
                      'Competitive moat is built through unique capabilities and market positioning.'
    }
  }
  
  // If still no content, show empty state
  if (!recommendationText) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Executive Summary</h2>
        <SectionCard className="py-12">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Executive summary will appear here after strategic bets or opportunities are generated.
            </p>
          </div>
        </SectionCard>
      </section>
    )
  }
  
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">What we recommend</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Summary of key strategic recommendations based on competitive analysis
        </p>
      </div>
      
      <SectionCard className="space-y-6">
        {/* Recommendation paragraph */}
        <div>
          <p className="text-base text-foreground leading-relaxed">
            {recommendationText}
            {recommendationText.length >= 300 && '...'}
          </p>
        </div>
        
        {/* Three bullets */}
        <div className="grid gap-6 md:grid-cols-3 pt-4 border-t border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">What to do</h3>
            <ul className="space-y-1.5">
              {whatToDo.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground leading-relaxed">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">What to say no to</h3>
            <ul className="space-y-1.5">
              {whatToSayNoTo.length > 0 ? (
                whatToSayNoTo.map((item, index) => (
                  <li key={index} className="text-sm text-muted-foreground leading-relaxed">
                    • {item}
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground leading-relaxed">
                  • Continue with current approach
                </li>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Why this is defensible</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {whyDefensible}
            </p>
          </div>
        </div>
        
        {/* Trust callout */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground italic">
            Based on publicly available signals; see evidence & confidence below.
          </p>
        </div>
      </SectionCard>
    </section>
  )
}

