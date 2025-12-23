"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EvidenceBadge } from "@/components/ui/EvidenceBadge"
import { TrustChips } from "@/components/ui/TrustChips"
import { Badge } from "@/components/ui/badge"
import { brand } from "@/lib/ui/brand"
import { cn } from "@/lib/utils"
import { FileText, ExternalLink, X, ChevronRight, Search, TrendingUp } from "lucide-react"
import { Backdrop, CompetitiveLandscapeIllustration, ConfidenceBadgeIcon, RecencyBadgeIcon, CitationsBadgeIcon } from "@/components/graphics"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

// Mock data for Incident Management / On-call industry
const MOCK_SAMPLE = {
  opportunities: [
    {
      id: "1",
      title: "Launch 'Autopilot incident summaries' that ship in Slack in <60s",
      score: 8.7,
      confidence: "High" as const,
      recencyLabel: "Last 30 days",
      sourceCount: 12,
      why: "PagerDuty and Opsgenie both highlight 'time to resolution' as a key differentiator. Your users spend 5-10 minutes manually summarizing incidents for stakeholders. Automating this creates immediate value and reduces cognitive load during high-stress moments.",
      defensibility: "High. Requires deep integration with your incident workflow, Slack API, and real-time event processing. Competitors can't easily copy without rebuilding their entire notification pipeline.",
      nextStep: "Build a prototype that hooks into your existing incident webhooks. Test with 3-5 on-call engineers for 2 weeks. Measure time saved and stakeholder satisfaction.",
      citations: [
        { type: "Pricing", title: "PagerDuty Pricing", url: "https://pagerduty.com/pricing", dateLabel: "Updated 2 weeks ago" },
        { type: "Changelog", title: "Opsgenie Incident Timeline", url: "https://opsgenie.com/changelog", dateLabel: "Last month" },
        { type: "Docs", title: "Incident Response Best Practices", url: "https://atlassian.com/docs/incident-response", dateLabel: "3 months ago" },
      ],
    },
    {
      id: "2",
      title: "Add 'Incident severity prediction' using historical patterns",
      score: 7.9,
      confidence: "High" as const,
      recencyLabel: "Last 45 days",
      sourceCount: 8,
      why: "Incident.io's blog post on 'Reducing false alarms' shows 40% of incidents are misclassified. Your users waste time escalating low-severity issues. Predictive classification reduces noise and improves response times.",
      defensibility: "Medium. Requires historical data and ML models. Competitors could build similar features, but your unique incident patterns and user behavior create a moat.",
      nextStep: "Analyze your last 100 incidents. Build a simple severity classifier using 3-5 features (time of day, service type, error rate). A/B test with one on-call team.",
      citations: [
        { type: "Blog", title: "Reducing False Alarms", url: "https://incident.io/blog/false-alarms", dateLabel: "6 weeks ago" },
        { type: "Reviews", title: "G2 Reviews - Incident Management", url: "https://g2.com/products/incident-management", dateLabel: "Last month" },
        { type: "Docs", title: "Severity Classification Guide", url: "https://atlassian.com/docs/severity", dateLabel: "2 months ago" },
      ],
    },
    {
      id: "3",
      title: "Create 'On-call handoff notes' template that auto-populates from runbooks",
      score: 7.2,
      confidence: "Medium" as const,
      recencyLabel: "Last 60 days",
      sourceCount: 6,
      why: "Statuspage and VictorOps emphasize 'context preservation' during handoffs. Your engineers spend 15-20 minutes writing handoff notes. Auto-populating from runbooks and recent activity reduces friction and improves continuity.",
      defensibility: "Medium-High. Requires deep integration with your runbook system and activity logs. Competitors would need similar infrastructure to match.",
      nextStep: "Map your existing runbook structure. Build a template engine that pulls relevant sections based on incident type. Test with 2 on-call rotations.",
      citations: [
        { type: "Pricing", title: "Statuspage Features", url: "https://statuspage.io/features", dateLabel: "Updated 3 weeks ago" },
        { type: "Changelog", title: "VictorOps Handoff Improvements", url: "https://victorops.com/changelog", dateLabel: "Last month" },
        { type: "Docs", title: "Runbook Best Practices", url: "https://atlassian.com/docs/runbooks", dateLabel: "4 months ago" },
      ],
    },
    {
      id: "4",
      title: "Build 'Incident timeline visualization' with automatic correlation",
      score: 6.8,
      confidence: "Medium" as const,
      recencyLabel: "Last 90 days",
      sourceCount: 5,
      why: "PagerDuty's timeline view is consistently praised in reviews. Your users struggle to correlate events across services during complex incidents. Visual correlation reduces debugging time and improves root cause analysis.",
      defensibility: "Low-Medium. Visualization is easier to copy, but your event correlation logic and data sources create differentiation.",
      nextStep: "Prototype a timeline view using your existing event stream. Focus on automatic correlation of related events. Get feedback from 5 engineers.",
      citations: [
        { type: "Reviews", title: "G2 - PagerDuty Timeline", url: "https://g2.com/products/pagerduty", dateLabel: "Last month" },
        { type: "Docs", title: "Event Correlation Guide", url: "https://atlassian.com/docs/correlation", dateLabel: "5 months ago" },
      ],
    },
    {
      id: "5",
      title: "Add 'Post-incident learning' prompts that surface similar past incidents",
      score: 6.4,
      confidence: "Medium" as const,
      recencyLabel: "Last 90 days",
      sourceCount: 4,
      why: "Incident.io's postmortem automation shows teams want to learn from past incidents. Your users rarely reference historical incidents during postmortems. Surfacing similar incidents improves learning and prevents repeat issues.",
      defensibility: "Medium. Requires good search/indexing and incident tagging. Your unique incident data creates value, but the feature itself is replicable.",
      nextStep: "Build a simple similarity search using incident titles and tags. Test with 3 postmortems. Measure if teams reference past incidents more often.",
      citations: [
        { type: "Blog", title: "Postmortem Automation", url: "https://incident.io/blog/postmortems", dateLabel: "2 months ago" },
        { type: "Docs", title: "Incident Learning", url: "https://atlassian.com/docs/learning", dateLabel: "6 months ago" },
      ],
    },
  ],
}

type Opportunity = typeof MOCK_SAMPLE.opportunities[0]

export function ArtifactPreviewHero() {
  const [selectedId, setSelectedId] = useState<string>(MOCK_SAMPLE.opportunities[0].id)
  const [showCitations, setShowCitations] = useState(false)

  const selected = MOCK_SAMPLE.opportunities.find((o) => o.id === selectedId) || MOCK_SAMPLE.opportunities[0]

  // Group citations by type
  const citationsByType = selected.citations.reduce(
    (acc, citation) => {
      if (!acc[citation.type]) {
        acc[citation.type] = []
      }
      acc[citation.type].push(citation)
      return acc
    },
    {} as Record<string, typeof selected.citations>
  )

  return (
    <MarketingSection variant="gradient" className="relative overflow-hidden border-t-0 pt-20 md:pt-24 lg:pt-32">
      <Backdrop variant="hero" density="subtle" />
      <MarketingContainer maxWidth="7xl" className="relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Left side: Headline, subhead, bullets, CTAs */}
          <div className="text-center lg:text-left space-y-6">
            <div className="space-y-4">
              <h1 className={cn("text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-text-primary")}>
                Turn competitor noise into{" "}
                <span className="marketing-gradient-text">defensible opportunities</span>.
              </h1>
              <p className={cn("text-lg md:text-xl leading-relaxed text-text-secondary max-w-prose", "mx-auto lg:mx-0")}>
                Plinth reads the market for you—pricing, docs, reviews, and changelogs—then turns it into ranked opportunities with citations you can trust.
              </p>
            </div>
            
            {/* 3 key bullets */}
            <div className="space-y-4">
              <div className="flex items-start justify-center gap-3 text-base text-text-secondary lg:justify-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-primary/10">
                  <TrendingUp className="h-5 w-5 text-accent-primary" />
                </div>
                <span className="font-medium">Ranked opportunities, not dashboards</span>
              </div>
              <div className="flex items-start justify-center gap-3 text-base text-text-secondary lg:justify-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-primary/10">
                  <FileText className="h-5 w-5 text-accent-primary" />
                </div>
                <span className="font-medium">Citations + recency, built in</span>
              </div>
              <div className="flex items-start justify-center gap-3 text-base text-text-secondary lg:justify-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-primary/10">
                  <Search className="h-5 w-5 text-accent-primary" />
                </div>
                <span className="font-medium">Shareable, exec-ready readout</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start pt-2">
              <Link href="/try">
                <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow hover:scale-105">
                  Try Plinth
                </Button>
              </Link>
              <Link href="#sample-output">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-accent-primary/5">
                  View sample output
                </Button>
              </Link>
            </div>
            
            {/* Microcopy */}
            <p className="text-sm text-text-muted text-center lg:text-left pt-2">
              No sign-up required to start. We only ask for email when you're ready to save and view results.
            </p>
          </div>

          {/* Right side: Product output preview */}
          <div className="relative">
            <div className="hidden lg:block absolute -right-8 top-8 w-32 h-24 opacity-30 pointer-events-none">
              <CompetitiveLandscapeIllustration />
            </div>
            <div className="panel overflow-hidden border-2 border-border-subtle shadow-xl bg-surface relative z-10 rounded-2xl">
              {/* Header */}
              <div className="p-4 bg-surface-muted border-b border-border-subtle">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-danger"></div>
                    <div className="h-2 w-2 rounded-full bg-warning"></div>
                    <div className="h-2 w-2 rounded-full bg-success"></div>
                    <span className="ml-4 text-xs font-medium text-text-muted">Ranked Opportunities</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCitations(!showCitations)}
                    className="text-xs"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Citations
                  </Button>
                </div>
              </div>

              <div className="grid lg:grid-cols-2">
                {/* Opportunities list */}
                <div className="border-r border-border-subtle p-4 space-y-2 max-h-[600px] overflow-y-auto">
                  {MOCK_SAMPLE.opportunities.map((opp) => (
                    <button
                      key={opp.id}
                      onClick={() => setSelectedId(opp.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        selectedId === opp.id
                          ? "border-accent-primary bg-accent-primary/5 shadow-sm"
                          : "border-border-subtle hover:border-accent-primary/50 hover:bg-surface-muted"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="primary" className="text-xs font-semibold">
                              {opp.score.toFixed(1)}
                            </Badge>
                            <TrustChips
                              items={[
                                { label: opp.confidence, tone: opp.confidence === "High" ? "good" : "neutral" },
                                { label: opp.recencyLabel, tone: "neutral" },
                              ]}
                              className="flex-shrink-0"
                            />
                          </div>
                          <h4 className="text-sm font-semibold text-text-primary leading-tight">
                            {opp.title}
                          </h4>
                        </div>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 flex-shrink-0 mt-1 transition-transform",
                            selectedId === opp.id ? "text-accent-primary" : "text-text-muted"
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-text-muted">
                          {opp.sourceCount} {opp.sourceCount === 1 ? "source" : "sources"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Detail panel */}
                <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-2">Why this matters</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{selected.why}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-2">Defensibility</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{selected.defensibility}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-2">Next step</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{selected.nextStep}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-2">Top sources</h3>
                    <div className="space-y-2">
                      {selected.citations.slice(0, 3).map((citation, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 rounded border border-border-subtle bg-surface-muted">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {citation.type}
                              </Badge>
                              <a
                                href={citation.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-accent-primary hover:underline flex items-center gap-1"
                              >
                                {citation.title}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                            <span className="text-xs text-text-muted">{citation.dateLabel}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Citations drawer (overlay) */}
            {showCitations && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCitations(false)}>
                <div
                  className="panel max-w-2xl w-full max-h-[80vh] overflow-hidden bg-surface shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4 bg-surface-muted border-b border-border-subtle flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-text-primary">Citations</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowCitations(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)] space-y-4">
                    {Object.entries(citationsByType).map(([type, citations]) => (
                      <div key={type}>
                        <h4 className="text-sm font-semibold text-text-primary mb-2">{type}</h4>
                        <div className="space-y-2">
                          {citations.map((citation, idx) => (
                            <div key={idx} className="p-3 rounded border border-border-subtle bg-surface-muted">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <a
                                    href={citation.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-accent-primary hover:underline flex items-center gap-1 mb-1"
                                  >
                                    {citation.title}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                  <span className="text-xs text-text-muted">{citation.dateLabel}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border-subtle">
                      <p className="text-xs text-text-muted italic">
                        Example sources shown for demonstration. Actual analysis includes real-time citations from public sources.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

