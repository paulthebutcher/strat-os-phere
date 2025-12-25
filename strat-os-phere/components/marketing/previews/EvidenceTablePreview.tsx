/**
 * EvidenceTablePreview
 * 
 * Preview showing evidence drawer/table with sources visible.
 * Demonstrates that every claim has a source you can open and share.
 */
"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"

const evidence = [
  { domain: "pagerduty.com", type: "Pricing", url: "/pricing" },
  { domain: "atlassian.com", type: "Docs", url: "/docs/sso" },
  { domain: "trustpilot.com", type: "Reviews", url: "/reviews" },
]

const sourcePills = [
  { label: "Pricing page", type: "Pricing" },
  { label: "Docs", type: "Docs" },
  { label: "Reviews", type: "Reviews" },
]

export function EvidenceTablePreview() {
  return (
    <div className="bg-white p-6 md:p-8 min-h-[300px] flex flex-col">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-2">
            Evidence
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            Every claim has a source you can open and share
          </p>
        </div>

        {/* Source pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {sourcePills.map((pill, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-xs px-2.5 py-1 bg-surface-muted/50"
            >
              {pill.label}
            </Badge>
          ))}
        </div>

        {/* Evidence table */}
        <div className="space-y-2">
          {evidence.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface-muted/30 hover:bg-surface-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-sm font-medium text-text-primary truncate">
                  {item.domain}
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 shrink-0">
                  {item.type}
                </Badge>
              </div>
              <ExternalLink className="w-4 h-4 text-text-muted shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

