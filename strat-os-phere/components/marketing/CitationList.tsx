/**
 * CitationList
 * 
 * Displays a list of evidence citations in a compact table/list format.
 * Used on marketing pages to show example evidence sources.
 */
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Citation {
  domain: string
  type: "pricing" | "docs" | "changelog" | "reviews" | "jobs" | "status" | string
  excerpt: string
  url: string
}

interface CitationListProps {
  citations: Citation[]
  className?: string
}

const typeLabels: Record<string, string> = {
  pricing: "Pricing",
  docs: "Documentation",
  changelog: "Changelog",
  reviews: "Reviews",
  jobs: "Jobs",
  status: "Status",
}

export function CitationList({ citations, className }: CitationListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {citations.map((citation, index) => (
        <div
          key={index}
          className="border border-border-subtle rounded-lg p-4 hover:border-primary/20 transition-colors"
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-text-primary">
                  {citation.domain}
                </span>
                <span className="text-xs text-text-muted px-2 py-0.5 bg-slate-100 rounded">
                  {typeLabels[citation.type] || citation.type}
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {citation.excerpt}
              </p>
            </div>
            <Link
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:text-accent-primary transition-colors shrink-0"
            >
              Open source
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

