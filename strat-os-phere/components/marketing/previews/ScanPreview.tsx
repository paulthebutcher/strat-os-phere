/**
 * ScanPreview
 * 
 * Preview showing evidence sources panel.
 * Emphasizes breadth of source types and inspectability.
 */
"use client"

import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

const evidence = [
  { domain: "competitor-a.com/pricing", type: "Pricing" },
  { domain: "competitor-b.com/docs/api", type: "Docs" },
  { domain: "G2 Enterprise review", type: "Reviews" },
  { domain: "competitor-c.com/changelog", type: "Changelog" },
  { domain: "competitor-d.com/about", type: "Positioning" },
]

const sourceTypes = [
  { label: "Pricing", count: 12 },
  { label: "Docs", count: 8 },
  { label: "Reviews", count: 15 },
  { label: "Changelog", count: 6 },
]

export function ScanPreview() {
  return (
    <div className="bg-white p-5 md:p-6 min-h-[400px] flex flex-col">
      <div className="space-y-4">
        {/* Source type summary */}
        <div className="flex flex-wrap gap-2 pb-3 border-b border-border-subtle">
          {sourceTypes.map((type, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-xs px-2.5 py-1 bg-surface-muted/50"
            >
              {type.label} ({type.count})
            </Badge>
          ))}
        </div>

        {/* Evidence sources list */}
        <div className="space-y-2">
          {evidence.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface-muted/30 hover:bg-surface-muted/50 transition-colors"
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

        {/* Caption */}
        <div className="pt-4 border-t border-border-subtle">
          <p className="text-xs text-text-muted italic">
            Every claim is grounded in something you can open and inspect
          </p>
        </div>
      </div>
    </div>
  )
}

