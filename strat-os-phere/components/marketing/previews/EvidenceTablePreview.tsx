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
  { domain: "competitor-a.com/pricing", type: "Pricing" },
  { domain: "G2 Enterprise review", type: "Reviews" },
  { domain: "competitor-b.com/docs", type: "Docs" },
]

const sourcePills = [
  { label: "Pricing page", type: "Pricing" },
  { label: "Docs", type: "Docs" },
  { label: "Reviews", type: "Reviews" },
]

export function EvidenceTablePreview() {
  return (
    <div className="bg-white p-5 md:p-6 min-h-[280px] flex flex-col">
      {/* Proof-first: Focus on sources being inspectable */}
      <div className="space-y-3">
        {/* Evidence sources list - the proof */}
        <div className="space-y-2">
          {evidence.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface-muted/30"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="text-sm font-medium text-text-primary truncate">
                  {item.domain}
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 shrink-0">
                  {item.type}
                </Badge>
              </div>
              <ExternalLink className="w-4 h-4 text-accent-primary shrink-0" />
            </div>
          ))}
        </div>
        
        {/* Compact source type indicators */}
        <div className="flex flex-wrap gap-2 pt-2">
          {sourcePills.map((pill, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-[10px] px-2 py-0.5 bg-surface-muted/50"
            >
              {pill.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

