/**
 * SampleOpportunityPreview
 * 
 * Read-only reference component that renders the canonical Opportunity model.
 * Used for design alignment and reference only - no hooks, no server calls.
 * 
 * This component displays the sample opportunity from /docs/examples/sample_opportunity.json
 * to demonstrate the canonical Opportunity artifact shape.
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Citation {
  url: string
  title?: string
  source_type: string
  published_at?: string
  source_kind?: string
  domain?: string
}

interface Opportunity {
  id: string
  title: string
  problem_statement: string
  proposed_action: string
  why_now: string
  evidence_summary: string
  citations: Citation[]
  confidence: {
    coverage_score: number
    evidence_strength: number
  }
  risks_and_assumptions: string[]
  competitors_impacted: string[]
  last_updated: string
}

// Sample opportunity data
// Note: In a real implementation, this would be loaded from a data file or passed as props
const sampleOpportunity: Opportunity = {
  id: "real-time-collaboration-editors",
  title: "Add real-time collaborative editing to code editors",
  problem_statement: "When developers need to pair program or review code together, they struggle to see changes in real-time and must rely on screen sharing or async comments, which slows down decision-making and creates context-switching overhead.",
  proposed_action: "Build a real-time collaborative editing feature that shows live cursors, edits, and comments synchronized across all participants, with conflict resolution for simultaneous edits.",
  why_now: "Three major competitors (GitHub Codespaces, Gitpod, and Replit) launched collaborative editing features in the last 90 days. User reviews show 40% of teams with 5+ developers are actively seeking this capability, and job postings indicate competitors are hiring specifically for real-time collaboration infrastructure.",
  evidence_summary: "Analysis of competitor changelogs, pricing pages, and user reviews shows a clear trend toward real-time collaboration. 12 of 15 competitors now offer this feature, and review sentiment indicates strong demand among teams of 5+ developers. Recent competitor job postings specifically mention 'operational transform' and 'CRDT' technologies, suggesting this is a strategic investment area. Pricing pages show collaboration features as premium differentiators.",
  citations: [
    {
      url: "https://github.blog/2024-01-10-introducing-codespaces-collaboration",
      title: "Introducing Codespaces Collaboration",
      source_type: "changelog",
      published_at: "2024-01-10T00:00:00Z",
      source_kind: "first_party",
      domain: "github.com"
    },
    {
      url: "https://www.gitpod.io/changelog/real-time-collaboration",
      title: "Real-time Collaboration Now Available",
      source_type: "changelog",
      published_at: "2024-01-15T00:00:00Z",
      source_kind: "first_party",
      domain: "gitpod.io"
    },
    {
      url: "https://www.g2.com/products/vscode/reviews",
      title: "VS Code Reviews - G2",
      source_type: "reviews",
      published_at: "2024-01-20T00:00:00Z",
      source_kind: "third_party",
      domain: "g2.com"
    },
    {
      url: "https://replit.com/pricing",
      title: "Replit Pricing - Collaboration Features",
      source_type: "pricing",
      published_at: "2024-01-05T00:00:00Z",
      source_kind: "first_party",
      domain: "replit.com"
    },
    {
      url: "https://github.com/careers/backend-engineer-collaboration",
      title: "Backend Engineer - Collaboration Infrastructure",
      source_type: "jobs",
      published_at: "2024-01-12T00:00:00Z",
      source_kind: "first_party",
      domain: "github.com"
    }
  ],
  confidence: {
    coverage_score: 85,
    evidence_strength: 78
  },
  risks_and_assumptions: [
    "Assumes teams want synchronous collaboration over async workflows",
    "Risk: May conflict with existing workflow tools (Jira, Linear) that teams already use",
    "Assumes infrastructure can handle real-time sync at scale without performance degradation",
    "Assumes users will adopt the feature (some teams may prefer async code review)",
    "Risk: Operational complexity of conflict resolution may create support burden"
  ],
  competitors_impacted: [
    "github.com",
    "gitpod.io",
    "replit.com",
    "codesandbox.io",
    "stackblitz.com"
  ],
  last_updated: "2024-01-22T14:30:00Z"
}

interface SampleOpportunityPreviewProps {
  className?: string
}

/**
 * Get confidence badge variant based on score
 */
function getConfidenceVariant(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 70) return 'success'
  if (score >= 50) return 'warning'
  return 'danger'
}

/**
 * Format confidence score label
 */
function formatConfidenceLabel(score: number): string {
  if (score >= 80) return 'High'
  if (score >= 60) return 'Moderate'
  if (score >= 40) return 'Low'
  return 'Very Low'
}

/**
 * Format date for display
 */
function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return isoString
  }
}

/**
 * Get source type badge color
 */
function getSourceTypeColor(sourceType: string): string {
  const colors: Record<string, string> = {
    changelog: 'bg-blue-50 text-blue-700 border-blue-200',
    pricing: 'bg-purple-50 text-purple-700 border-purple-200',
    reviews: 'bg-green-50 text-green-700 border-green-200',
    jobs: 'bg-orange-50 text-orange-700 border-orange-200',
    marketing_site: 'bg-gray-50 text-gray-700 border-gray-200',
    docs: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    status: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  }
  return colors[sourceType] || 'bg-gray-50 text-gray-700 border-gray-200'
}

export function SampleOpportunityPreview({ className }: SampleOpportunityPreviewProps) {
  const opportunity = sampleOpportunity as Opportunity

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold text-[rgb(var(--plinth-text))]">
            {opportunity.title}
          </h2>
          <div className="flex shrink-0 gap-2">
            <Badge variant={getConfidenceVariant(opportunity.confidence.coverage_score)}>
              Coverage: {opportunity.confidence.coverage_score}%
            </Badge>
            <Badge variant={getConfidenceVariant(opportunity.confidence.evidence_strength)}>
              Evidence: {opportunity.confidence.evidence_strength}%
            </Badge>
          </div>
        </div>
        <p className="text-sm text-[rgb(var(--plinth-muted))]">
          Last updated: {formatDate(opportunity.last_updated)}
        </p>
      </div>

      {/* Problem Statement */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[rgb(var(--plinth-text))] uppercase tracking-wide">
          Problem Statement
        </h3>
        <p className="text-base text-[rgb(var(--plinth-text))] leading-relaxed">
          {opportunity.problem_statement}
        </p>
      </div>

      {/* Proposed Action */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[rgb(var(--plinth-text))] uppercase tracking-wide">
          Proposed Action
        </h3>
        <p className="text-base text-[rgb(var(--plinth-text))] leading-relaxed">
          {opportunity.proposed_action}
        </p>
      </div>

      {/* Why Now */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[rgb(var(--plinth-text))] uppercase tracking-wide">
          Why Now
        </h3>
        <p className="text-base text-[rgb(var(--plinth-text))] leading-relaxed">
          {opportunity.why_now}
        </p>
      </div>

      {/* Evidence Summary */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[rgb(var(--plinth-text))] uppercase tracking-wide">
          Evidence Summary
        </h3>
        <p className="text-base text-[rgb(var(--plinth-text))] leading-relaxed">
          {opportunity.evidence_summary}
        </p>
      </div>

      {/* Competitors Impacted */}
      {opportunity.competitors_impacted.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[rgb(var(--plinth-text))] uppercase tracking-wide">
            Competitors Impacted
          </h3>
          <div className="flex flex-wrap gap-2">
            {opportunity.competitors_impacted.map((competitor, idx) => (
              <Badge key={idx} variant="outline">
                {competitor}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Risks and Assumptions */}
      {opportunity.risks_and_assumptions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[rgb(var(--plinth-text))] uppercase tracking-wide">
            Risks & Assumptions
          </h3>
          <ul className="list-disc list-inside space-y-1 text-base text-[rgb(var(--plinth-text))]">
            {opportunity.risks_and_assumptions.map((risk, idx) => (
              <li key={idx} className="leading-relaxed">
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Citations */}
      {opportunity.citations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[rgb(var(--plinth-text))] uppercase tracking-wide">
            Citations ({opportunity.citations.length})
          </h3>
          <div className="space-y-2">
            {opportunity.citations.map((citation, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-[rgba(var(--plinth-border))] p-3 space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[rgb(var(--plinth-accent))] hover:underline flex-1"
                  >
                    {citation.title || citation.url}
                  </a>
                  <Badge
                    variant="outline"
                    className={cn('text-xs shrink-0', getSourceTypeColor(citation.source_type))}
                  >
                    {citation.source_type.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-[rgb(var(--plinth-muted))]">
                  {citation.domain && (
                    <span className="font-mono">{citation.domain}</span>
                  )}
                  {citation.published_at && (
                    <span>{formatDate(citation.published_at)}</span>
                  )}
                  {citation.source_kind && (
                    <span className="capitalize">{citation.source_kind.replace('_', ' ')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Scores Detail */}
      <div className="rounded-lg border border-[rgba(var(--plinth-border))] bg-[rgba(var(--plinth-surface))] p-4 space-y-3">
        <h3 className="text-sm font-semibold text-[rgb(var(--plinth-text))] uppercase tracking-wide">
          Confidence Breakdown
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[rgb(var(--plinth-muted))]">Coverage Score</span>
              <span className="text-sm font-semibold text-[rgb(var(--plinth-text))]">
                {opportunity.confidence.coverage_score}%
              </span>
            </div>
            <div className="h-2 bg-[rgba(var(--plinth-border))] rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  getConfidenceVariant(opportunity.confidence.coverage_score) === 'success'
                    ? 'bg-green-500'
                    : getConfidenceVariant(opportunity.confidence.coverage_score) === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                )}
                style={{ width: `${opportunity.confidence.coverage_score}%` }}
              />
            </div>
            <p className="text-xs text-[rgb(var(--plinth-muted))]">
              {formatConfidenceLabel(opportunity.confidence.coverage_score)} coverage
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[rgb(var(--plinth-muted))]">Evidence Strength</span>
              <span className="text-sm font-semibold text-[rgb(var(--plinth-text))]">
                {opportunity.confidence.evidence_strength}%
              </span>
            </div>
            <div className="h-2 bg-[rgba(var(--plinth-border))] rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  getConfidenceVariant(opportunity.confidence.evidence_strength) === 'success'
                    ? 'bg-green-500'
                    : getConfidenceVariant(opportunity.confidence.evidence_strength) === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                )}
                style={{ width: `${opportunity.confidence.evidence_strength}%` }}
              />
            </div>
            <p className="text-xs text-[rgb(var(--plinth-muted))]">
              {formatConfidenceLabel(opportunity.confidence.evidence_strength)} strength
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
