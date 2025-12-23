'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { GenerateResultsV2Button } from '@/components/results/GenerateResultsV2Button'
import { SectionCard } from '@/components/results/SectionCard'
import { CopySectionButton } from '@/components/results/CopySectionButton'
import { formatScoringMatrixToMarkdown } from '@/lib/results/normalizeArtifacts'
import type { ScoringMatrixArtifactContent } from '@/lib/schemas/scoring'
import { computeScoreFromScoringMatrix } from '@/lib/scoring/computeScoreFromScoringMatrix'
import { ScorePill } from '@/components/ui/ScorePill'
import { extractCitationsFromArtifact, normalizeCitation, type NormalizedCitation } from '@/lib/results/evidence'
import type { CitationInput } from '@/lib/scoring/extractEvidenceFromArtifacts'
import { CoverageScoreBadge } from '@/components/trust/CoverageScoreBadge'
import type { NormalizedEvidenceBundle } from '@/lib/evidence/types'

interface ScorecardContentProps {
  projectId: string
  scoring: ScoringMatrixArtifactContent | null | undefined
  evidenceBundle?: NormalizedEvidenceBundle | null
  competitorDomains?: string[]
}

export function ScorecardContent({ 
  projectId, 
  scoring,
  evidenceBundle,
  competitorDomains = [],
}: ScorecardContentProps) {
  if (!scoring) {
    return (
      <section className="space-y-6">
        <SectionCard className="py-16">
          <div className="w-full max-w-md space-y-6 text-center mx-auto">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                Scorecard not yet generated
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Once analysis is complete, Plinth will generate a competitive scorecard evaluating competitors on key criteria.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <GenerateResultsV2Button
                projectId={projectId}
                label="Generate Analysis"
              />
              <Button asChild variant="outline" type="button">
                <Link href={`/projects/${projectId}/competitors`}>
                  Review inputs
                </Link>
              </Button>
            </div>
          </div>
        </SectionCard>
      </section>
    )
  }

  const copyContent = formatScoringMatrixToMarkdown(scoring)

  // Use summary if available, otherwise calculate from scores
  const sortedSummary = scoring.summary && scoring.summary.length > 0
    ? [...scoring.summary].sort((a, b) => b.total_weighted_score - a.total_weighted_score)
    : []

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Scorecard</h1>
          <p className="text-sm text-muted-foreground">
            Competitive evaluation on key criteria weighted by importance.
          </p>
        </div>
        <CopySectionButton content={copyContent} label="Copy all" />
      </div>

      {/* Evidence Coverage Score */}
      {evidenceBundle !== undefined && (
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Evidence Coverage</h2>
              <p className="text-sm text-muted-foreground">
                Overall quality and completeness of evidence used for scoring
              </p>
            </div>
            <CoverageScoreBadge
              bundle={evidenceBundle}
              competitorDomains={competitorDomains}
              variant="default"
            />
          </div>
        </SectionCard>
      )}

      {scoring.criteria && scoring.criteria.length > 0 && (
        <SectionCard>
          <h2 className="text-xl font-semibold text-foreground mb-6">Criteria</h2>
          <div className="space-y-6">
            {scoring.criteria.map((criterion) => {
              // Find scores for this criterion
              const criterionScores = scoring.scores?.filter(s => s.criteria_id === criterion.id) || []
              
              // Extract citations for this criterion (from criterion-specific evidence or fallback to overall)
              const allCitations = extractCitationsFromArtifact(scoring)
              
              // Compute evidence-backed scores
              const scoresWithComputed = criterionScores.map(s => {
                const computedScore = computeScoreFromScoringMatrix(
                  scoring,
                  s.competitor_name,
                  criterion.id
                )
                
                // Try to extract citations from the evidence field for this specific score
                let citationsForScore: CitationInput[] = []
                if (s.evidence) {
                  try {
                    const evidenceObj = typeof s.evidence === 'string' 
                      ? JSON.parse(s.evidence) 
                      : s.evidence
                    
                    if (Array.isArray(evidenceObj)) {
                      const normalized = evidenceObj
                        .map(normalizeCitation)
                        .filter((c): c is NormalizedCitation => c !== null)
                      citationsForScore = normalized.map(c => ({
                        url: c.url,
                        sourceType: c.sourceType,
                        date: c.date?.toISOString(),
                      }))
                    } else if (evidenceObj && typeof evidenceObj === 'object') {
                      const citations = (evidenceObj as any).citations || (evidenceObj as any).sources || []
                      if (Array.isArray(citations)) {
                        const normalized = citations
                          .map(normalizeCitation)
                          .filter((c): c is NormalizedCitation => c !== null)
                        citationsForScore = normalized.map(c => ({
                          url: c.url,
                          sourceType: c.sourceType,
                          date: c.date?.toISOString(),
                        }))
                      }
                    }
                  } catch {
                    // Evidence field is not JSON, skip
                  }
                }
                
                // Fallback to overall citations if no criterion-specific citations
                if (citationsForScore.length === 0 && allCitations.length > 0) {
                  citationsForScore = allCitations.map(c => ({
                    url: c.url,
                    sourceType: c.sourceType,
                    date: c.date?.toISOString(),
                  }))
                }
                
                return {
                  competitor: s.competitor_name,
                  computedScore,
                  citations: citationsForScore,
                }
              })
              
              return (
                <div key={criterion.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">{criterion.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      Weight: {criterion.weight ?? 1}
                    </Badge>
                  </div>
                  {scoresWithComputed.length > 0 && (
                    <div className="space-y-2">
                      {scoresWithComputed.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span>{s.competitor}</span>
                          <ScorePill score={s.computedScore} citations={s.citations} showTooltip={true} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </SectionCard>
      )}

      {sortedSummary.length > 0 && (
        <SectionCard>
          <h2 className="text-xl font-semibold text-foreground mb-6">Competitor breakdown</h2>
          <div className="space-y-6">
            {sortedSummary.map((summary, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-foreground">{summary.competitor_name}</h3>
                  <Badge variant="primary">
                    {summary.total_weighted_score.toFixed(1)}/100
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {summary.strengths.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {summary.strengths.map((strength, strengthIndex) => (
                          <li key={strengthIndex} className="text-sm text-foreground leading-relaxed">{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summary.weaknesses.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Weaknesses
                      </h4>
                      <ul className="space-y-2">
                        {summary.weaknesses.map((weakness, weaknessIndex) => (
                          <li key={weaknessIndex} className="text-sm text-foreground leading-relaxed">{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {scoring.notes && (
        <SectionCard>
          <h2 className="text-xl font-semibold text-foreground mb-4">Notes</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">{scoring.notes}</p>
        </SectionCard>
      )}
    </section>
  )
}

