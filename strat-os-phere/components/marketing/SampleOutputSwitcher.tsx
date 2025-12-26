"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { OpportunityCard } from "@/components/opportunities/OpportunityCard"
import { Surface } from "@/components/ui/surface"
import { CardShell } from "@/components/ui/surface"

// Mock sample opportunities for interactive display
const SAMPLE_OPPORTUNITIES = [
  {
    id: "1",
    title: "Launch 'Autopilot incident summaries' that ship in Slack in <60s",
    description: "PagerDuty and Opsgenie both highlight 'time to resolution' as a key differentiator. Your users spend 5-10 minutes manually summarizing incidents for stakeholders.",
    score: 8.6,
    citationsCount: 12,
    badges: [
      { label: "High confidence", tone: "success" as const },
      { label: "Last 30 days", tone: "info" as const },
    ],
    evidenceLine: "PagerDuty pricing page updated 2 weeks ago emphasizes 'faster resolution times'. Opsgenie changelog from last month highlights incident timeline improvements. 23 reviews mention 'slow incident summaries' in last 90 days.",
  },
  {
    id: "2",
    title: "Add 'Incident severity prediction' using historical patterns",
    description: "Incident.io's blog post on 'Reducing false alarms' shows 40% of incidents are misclassified. Your users waste time escalating low-severity issues.",
    score: 7.8,
    citationsCount: 8,
    badges: [
      { label: "High confidence", tone: "success" as const },
      { label: "Last 45 days", tone: "info" as const },
    ],
    evidenceLine: "Incident.io blog post from 6 weeks ago: 'Reducing False Alarms' highlights 40% misclassification rate. G2 reviews show consistent complaints about false alarms. Documentation updates emphasize severity classification.",
  },
  {
    id: "3",
    title: "Create 'On-call handoff notes' template that auto-populates from runbooks",
    description: "Statuspage and VictorOps emphasize 'context preservation' during handoffs. Your engineers spend 15-20 minutes writing handoff notes.",
    score: 7.1,
    citationsCount: 6,
    badges: [
      { label: "Medium confidence", tone: "warning" as const },
      { label: "Last 60 days", tone: "info" as const },
    ],
    evidenceLine: "Statuspage features page updated 3 weeks ago highlights 'seamless handoffs'. VictorOps changelog from last month shows handoff improvements. Runbook documentation emphasizes context preservation.",
  },
]

export function SampleOutputSwitcher() {
  const [selectedId, setSelectedId] = useState(SAMPLE_OPPORTUNITIES[0].id)

  const selected = SAMPLE_OPPORTUNITIES.find((o) => o.id === selectedId) || SAMPLE_OPPORTUNITIES[0]

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SAMPLE_OPPORTUNITIES.map((opp, index) => (
          <button
            key={opp.id}
            onClick={() => setSelectedId(opp.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              "border-2",
              selectedId === opp.id
                ? "border-accent-primary bg-accent-primary/10 text-accent-primary shadow-sm"
                : "border-border-subtle bg-surface hover:border-accent-primary/50 hover:bg-surface-muted text-text-secondary"
            )}
          >
            Example {index + 1}
          </button>
        ))}
      </div>

      {/* Selected opportunity card */}
      <Surface glow className="p-8 md:p-12">
        <CardShell>
          <OpportunityCard
            title={selected.title}
            description={selected.description}
            score={selected.score}
            citationsCount={selected.citationsCount}
            badges={selected.badges}
            evidenceLine={selected.evidenceLine}
          />
        </CardShell>
      </Surface>

      <p className="text-center text-sm text-text-muted">
        This is a sample output. Your actual analysis will include Jobs-to-be-Done, Scorecard, 
        Opportunities, and Strategic Bets—all with full citations you can validate.
      </p>
    </div>
  )
}

