"use client"

import { useState } from "react"
import { TrendingUp, Target, FileText, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// Mock data matching product schemas
const MOCK_OPPORTUNITIES = [
  {
    id: "1",
    title: "Launch 'Autopilot incident summaries' that ship in Slack in <60s",
    score: 8.6,
    confidence: "High",
    recencyLabel: "Last 30 days",
    sourceCount: 12,
    citation: { type: "Pricing", title: "PagerDuty Pricing", url: "#" },
  },
  {
    id: "2",
    title: "Add 'Incident severity prediction' using historical patterns",
    score: 7.8,
    confidence: "High",
    recencyLabel: "Last 45 days",
    sourceCount: 8,
    citation: { type: "Blog", title: "Reducing False Alarms", url: "#" },
  },
  {
    id: "3",
    title: "Create 'On-call handoff notes' template that auto-populates from runbooks",
    score: 7.1,
    confidence: "Medium",
    recencyLabel: "Last 60 days",
    sourceCount: 6,
    citation: { type: "Docs", title: "Handoff Best Practices", url: "#" },
  },
]

const MOCK_STRATEGIC_BET = {
  id: "1",
  title: "Become the fastest incident response platform",
  summary: "Focus on sub-60-second incident summaries delivered directly to stakeholders, reducing cognitive load during high-stress moments.",
  whatWeSayNoTo: [
    "Building generic incident dashboards",
    "Complex workflow automation beyond summaries",
    "Multi-channel notification systems",
  ],
  forcedCapabilities: [
    "Real-time event processing pipeline",
    "Slack API deep integration",
    "Incident context extraction",
  ],
  whyCompetitorsWontFollow: "Requires rebuilding entire notification infrastructure. PagerDuty and Opsgenie are built around multi-channel flexibility, making them structurally unable to optimize for single-channel speed.",
}

const MOCK_EVIDENCE = [
  {
    type: "Pricing",
    title: "PagerDuty Pricing",
    url: "#",
    dateLabel: "Updated 2 weeks ago",
  },
  {
    type: "Changelog",
    title: "Opsgenie Incident Timeline",
    url: "#",
    dateLabel: "Last month",
  },
  {
    type: "Reviews",
    title: "G2 Reviews - Incident Management",
    url: "#",
    dateLabel: "Last month",
  },
]

export function InteractivePreview() {
  const [activeTab, setActiveTab] = useState("opportunities")

  return (
    <div className="w-full">
      <div className="panel border-2 border-border-subtle shadow-xl bg-surface rounded-2xl overflow-hidden">
        {/* Header with tabs */}
        <div className="p-4 bg-surface-muted border-b border-border-subtle">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start bg-transparent p-0 border-0 h-auto">
              <TabsTrigger value="opportunities" className="px-4 py-2">
                <TrendingUp className="h-4 w-4 mr-2" />
                Opportunities
              </TabsTrigger>
              <TabsTrigger value="bets" className="px-4 py-2">
                <Target className="h-4 w-4 mr-2" />
                Strategic Bets
              </TabsTrigger>
              <TabsTrigger value="evidence" className="px-4 py-2">
                <FileText className="h-4 w-4 mr-2" />
                Evidence
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content panels */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Opportunities view */}
            <TabsContent value="opportunities" className="mt-0">
              <div className="space-y-4">
                <p className="text-sm text-text-muted mb-4">
                  Top ranked opportunities with scores and citations
                </p>
                {MOCK_OPPORTUNITIES.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-4 rounded-lg border border-border-subtle bg-surface-muted/50 hover:border-accent-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="primary" className="text-xs font-semibold">
                            {opp.score.toFixed(1)}
                          </Badge>
                          <Badge variant={opp.confidence === "High" ? "success" : "warning"} className="text-xs">
                            {opp.confidence}
                          </Badge>
                          <span className="text-xs text-text-muted">{opp.recencyLabel}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-text-primary mb-1">
                          {opp.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-text-muted">
                            {opp.sourceCount} {opp.sourceCount === 1 ? "source" : "sources"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border-subtle">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {opp.citation.type}
                        </Badge>
                        <a
                          href={opp.citation.url}
                          className="text-xs font-medium text-accent-primary hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                        >
                          {opp.citation.title}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Strategic Bets view */}
            <TabsContent value="bets" className="mt-0">
              <div className="space-y-6">
                <p className="text-sm text-text-muted mb-4">
                  Decision-ready strategic bets with clear constraints
                </p>
                <div className="p-6 rounded-lg border border-border-subtle bg-surface-muted/50">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    {MOCK_STRATEGIC_BET.title}
                  </h3>
                  <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                    {MOCK_STRATEGIC_BET.summary}
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-2">
                        What we say no to
                      </h3>
                      <ul className="space-y-1">
                        {MOCK_STRATEGIC_BET.whatWeSayNoTo.map((item, idx) => (
                          <li key={idx} className="text-sm text-text-secondary flex items-start gap-2">
                            <span className="text-text-muted mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-2">
                        Required capabilities
                      </h3>
                      <ul className="space-y-1">
                        {MOCK_STRATEGIC_BET.forcedCapabilities.map((item, idx) => (
                          <li key={idx} className="text-sm text-text-secondary flex items-start gap-2">
                            <span className="text-text-muted mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-2">
                        Why competitors won't follow
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {MOCK_STRATEGIC_BET.whyCompetitorsWontFollow}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Evidence view */}
            <TabsContent value="evidence" className="mt-0">
              <div className="space-y-4">
                <p className="text-sm text-text-muted mb-4">
                  Organized evidence by source type with recency signals
                </p>
                {MOCK_EVIDENCE.map((evidence, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border-subtle bg-surface-muted/50 hover:border-accent-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {evidence.type}
                          </Badge>
                        </div>
                        <a
                          href={evidence.url}
                          className="text-sm font-medium text-accent-primary hover:underline flex items-center gap-2 mb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                        >
                          {evidence.title}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <span className="text-xs text-text-muted">{evidence.dateLabel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <p className="text-center text-xs text-text-muted mt-4">
        Interactive preview using sample data. Your actual analysis includes real citations and evidence.
      </p>
    </div>
  )
}

