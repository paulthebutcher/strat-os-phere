'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExecutiveSummarySection } from './memo/ExecutiveSummarySection'
import { StrategicBetsSection } from './memo/StrategicBetsSection'
import { OpportunitiesSection } from './memo/OpportunitiesSection'
import { EvidenceConfidencePanel } from './EvidenceConfidencePanel'
import { extractCitationsFromArtifact } from '@/lib/results/evidence'
import type { StrategicBetsArtifactContent } from '@/lib/schemas/strategicBet'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'

interface ResultsMemoProps {
  bets: StrategicBetsArtifactContent | null
  opportunities: OpportunityV3ArtifactContent | OpportunitiesArtifactContent | null
  projectId: string
  projectName: string
  generatedAt: string | null
  competitorCount: number
}

/**
 * Results Memo - VP-ready narrative experience
 * 
 * Single default narrative page that:
 * 1. Leads with Strategic Bets (the main event)
 * 2. Summarizes top opportunities as inputs to bets
 * 3. Shows an Evidence & Confidence trust layer prominently
 * 4. Keeps tabs as an Appendix / Deep Dive, not the primary experience
 */
export function ResultsMemo({
  bets,
  opportunities,
  projectId,
  projectName,
  generatedAt,
  competitorCount,
}: ResultsMemoProps) {
  const [copiedExecSummary, setCopiedExecSummary] = useState(false)
  
  // Extract citations for evidence panel
  const citations = extractCitationsFromArtifact(bets ?? opportunities ?? null)
  
  // Format metadata
  const formattedGeneratedAt = generatedAt
    ? new Date(generatedAt).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null
  
  // Generate executive summary markdown for copy
  const handleCopyExecutiveSummary = async () => {
    const lines: string[] = ['# Executive Summary', '']
    
    if (bets?.bets && bets.bets.length > 0) {
      const topBets = bets.bets.slice(0, 2)
      lines.push('## What we recommend', '')
      lines.push(topBets.map((bet) => bet.summary).join(' '), '')
      lines.push('')
      
      if (topBets[0]?.what_we_say_no_to) {
        lines.push('### What to say no to', '')
        topBets[0].what_we_say_no_to.forEach((item) => {
          lines.push(`- ${item}`)
        })
        lines.push('')
      }
      
      if (topBets[0]?.why_competitors_wont_follow) {
        lines.push('### Why this is defensible', '')
        lines.push(topBets[0].why_competitors_wont_follow, '')
        lines.push('')
      }
    } else if (opportunities) {
      const oppsList = 'opportunities' in opportunities ? opportunities.opportunities : []
      const topOpp = oppsList[0]
      if (topOpp) {
        lines.push('## What we recommend', '')
        if ('one_liner' in topOpp) {
          lines.push(topOpp.one_liner, '')
        } else {
          lines.push(topOpp.title, '')
        }
      }
    }
    
    const markdown = lines.join('\n')
    
    try {
      await navigator.clipboard.writeText(markdown)
      setCopiedExecSummary(true)
      setTimeout(() => setCopiedExecSummary(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header block */}
      <header className="space-y-4 pb-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">
              Results
            </h1>
            <div className="mt-2 space-y-1">
              <p className="text-base text-muted-foreground">
                {projectName}
              </p>
              {formattedGeneratedAt && (
                <p className="text-sm text-muted-foreground">
                  Generated {formattedGeneratedAt} · {competitorCount} competitor{competitorCount !== 1 ? 's' : ''} analyzed
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyExecutiveSummary}
          >
            {copiedExecSummary ? 'Copied!' : 'Copy executive summary'}
          </Button>
        </div>
      </header>
      
      {/* Executive Summary */}
      <ExecutiveSummarySection bets={bets} opportunities={opportunities} />
      
      {/* Evidence & Confidence panel (prominent) */}
      <EvidenceConfidencePanel
        citations={citations}
        title="Evidence & Confidence"
      />
      
      {/* Strategic Bets (primary section) */}
      <StrategicBetsSection
        bets={bets}
        opportunities={opportunities}
        projectId={projectId}
      />
      
      {/* Opportunities (inputs section) */}
      <OpportunitiesSection opportunities={opportunities} />
    </div>
  )
}

