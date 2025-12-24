/**
 * Opportunity Artifact Preview
 * 
 * Static, polished preview of the Opportunity artifact structure.
 * Shows a complete opportunity with all key elements: title, JTBD, why now, evidence, citations, confidence, assumptions.
 * Uses sample data only - no server calls.
 */
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Static sample data for the preview
const sampleOpportunity = {
  title: "Launch enterprise SSO to match competitor positioning",
  oneLiner: "Three competitors now offer SSO in their enterprise tiers. This is a table-stakes feature for B2B positioning.",
  customer: "Enterprise customers evaluating security and compliance requirements",
  whyNow: "Three major competitors added SSO to enterprise tiers in the last 6 months. Customer support requests for SSO increased 40% in Q4.",
  evidenceSummary: "Strong evidence from pricing pages, documentation, and feature requests. All sources are recent (within last 90 days).",
  citations: [
    {
      source_type: "pricing",
      domain: "competitor-a.com",
      title: "Enterprise tier pricing",
      note: "SSO included in Enterprise plan",
    },
    {
      source_type: "docs",
      domain: "competitor-b.com",
      title: "SSO integration guide",
      note: "Published 2 months ago",
    },
    {
      source_type: "reviews",
      domain: "review-site.com",
      title: "Feature request: Enterprise SSO",
      note: "47 upvotes, top request",
    },
    {
      source_type: "changelog",
      domain: "competitor-c.com",
      title: "Product updates",
      note: "SSO launched 3 months ago",
    },
    {
      source_type: "pricing",
      domain: "competitor-d.com",
      title: "Enterprise features",
      note: "SSO available in Enterprise+",
    },
  ],
  confidence: {
    coverage: "High",
    evidenceStrength: "8.9",
    totalScore: "8.7",
  },
  assumptions: [
    "Enterprise customers prioritize SSO for security compliance",
    "Competitor positioning indicates market expectation",
    "Implementation complexity is manageable for our team",
  ],
  risks: [
    "May require significant engineering resources",
    "Market may shift before we launch",
  ],
}

const sourceTypeLabels: Record<string, string> = {
  pricing: "Pricing",
  docs: "Docs",
  reviews: "Reviews",
  changelog: "Changelog",
  marketing_site: "Marketing",
  jobs: "Jobs",
  status: "Status",
}

export function OpportunityArtifactPreview() {
  return (
    <div className="bg-white rounded-xl border-2 border-border-subtle shadow-lg overflow-hidden">
      {/* Header with score */}
      <div className="p-6 bg-surface-muted/50 border-b border-border-subtle">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Badge variant="primary" className="text-base font-semibold px-4 py-1.5">
              {sampleOpportunity.confidence.totalScore}
            </Badge>
            <span className="text-sm font-medium text-text-primary">
              {sampleOpportunity.confidence.coverage} confidence
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {sampleOpportunity.citations.length} sources
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Evidence strength: {sampleOpportunity.confidence.evidenceStrength}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-8 space-y-6">
        {/* Title */}
        <div>
          <h3 className="text-2xl font-semibold text-text-primary mb-3 leading-tight">
            {sampleOpportunity.title}
          </h3>
          <p className="text-base leading-relaxed text-text-secondary">
            {sampleOpportunity.oneLiner}
          </p>
        </div>

        {/* Customer / JTBD */}
        <div className="pt-4 border-t border-border-subtle">
          <h4 className="text-sm font-semibold text-text-primary mb-2">For</h4>
          <p className="text-sm leading-relaxed text-text-secondary">
            {sampleOpportunity.customer}
          </p>
        </div>

        {/* Why now */}
        <div className="pt-4 border-t border-border-subtle">
          <h4 className="text-sm font-semibold text-text-primary mb-2">Why now</h4>
          <p className="text-sm leading-relaxed text-text-secondary">
            {sampleOpportunity.whyNow}
          </p>
        </div>

        {/* Evidence summary */}
        <div className="pt-4 border-t border-border-subtle">
          <h4 className="text-sm font-semibold text-text-primary mb-2">Evidence summary</h4>
          <p className="text-sm leading-relaxed text-text-secondary">
            {sampleOpportunity.evidenceSummary}
          </p>
        </div>

        {/* Citations */}
        <div className="pt-4 border-t border-border-subtle">
          <h4 className="text-sm font-semibold text-text-primary mb-3">Citations</h4>
          <div className="space-y-2">
            {sampleOpportunity.citations.map((citation, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle bg-surface-muted/30"
              >
                <Badge
                  variant="secondary"
                  className="text-xs shrink-0 mt-0.5"
                >
                  {sourceTypeLabels[citation.source_type] || citation.source_type}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {citation.domain} • {citation.title}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {citation.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence block */}
        <div className="pt-4 border-t border-border-subtle">
          <h4 className="text-sm font-semibold text-text-primary mb-3">Confidence</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-muted mb-1">Coverage</p>
              <p className="text-base font-semibold text-text-primary">
                {sampleOpportunity.confidence.coverage}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Evidence strength</p>
              <p className="text-base font-semibold text-text-primary">
                {sampleOpportunity.confidence.evidenceStrength}
              </p>
            </div>
          </div>
        </div>

        {/* Assumptions & risks */}
        <div className="pt-4 border-t border-border-subtle">
          <h4 className="text-sm font-semibold text-text-primary mb-3">Assumptions & risks</h4>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium text-text-muted mb-1.5">Assumptions</p>
              <ul className="space-y-1.5">
                {sampleOpportunity.assumptions.map((assumption, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-text-secondary text-sm">•</span>
                    <span className="text-sm leading-relaxed text-text-secondary">
                      {assumption}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-2">
              <p className="text-xs font-medium text-text-muted mb-1.5">Risks</p>
              <ul className="space-y-1.5">
                {sampleOpportunity.risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-text-secondary text-sm">•</span>
                    <span className="text-sm leading-relaxed text-text-secondary">
                      {risk}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

