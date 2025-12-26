/**
 * Evidence Preview Grid Section
 * 
 * Masonry-style grid showing evidence drawer, citation list, and competitor source preview.
 * Visual-first proof that every claim is backed by something you can open, share, and inspect.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal, Stagger } from "./motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { FileText, ExternalLink, CheckCircle2 } from "lucide-react"
import { sampleAnalysis } from "./sampleReadoutData"

// Evidence drawer preview
function EvidenceDrawerPreview() {
  const evidence = sampleAnalysis.evidence.sources.slice(0, 4).map(source => ({
    domain: source.domain,
    type: source.type,
    status: source.updated.includes("week") || source.updated.includes("day") ? "Fresh" : null
  }))

  return (
    <div className="bg-white rounded-lg border border-border-subtle p-4 sm:p-5 space-y-3 h-full">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-accent-primary" />
        <p className="text-xs font-semibold text-text-primary">Evidence drawer</p>
      </div>
      <div className="space-y-2">
        {evidence.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded border border-border-subtle bg-surface-muted/30">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs text-text-primary truncate">{item.domain}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 shrink-0">
                {item.type}
              </Badge>
            </div>
            {item.status && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 shrink-0 bg-green-50 text-green-700 border-green-200">
                {item.status}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Citation list preview
function CitationListPreview() {
  const citations = sampleAnalysis.evidence.sources.slice(0, 3).map(source => ({
    domain: source.domain,
    quote: source.title,
    type: source.type
  }))

  return (
    <div className="bg-white rounded-lg border border-border-subtle p-4 sm:p-5 space-y-3 h-full">
      <div className="flex items-center gap-2 mb-3">
        <ExternalLink className="w-4 h-4 text-accent-primary" />
        <p className="text-xs font-semibold text-text-primary">Citations</p>
      </div>
      <div className="space-y-2">
        {citations.map((citation, idx) => (
          <div key={idx} className="space-y-1 p-2 rounded border border-border-subtle bg-surface-muted/30">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-text-primary truncate">
                {citation.domain}
              </p>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 shrink-0 ml-2">
                {citation.type}
              </Badge>
            </div>
            <p className="text-[10px] text-text-secondary line-clamp-2">
              {citation.quote}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Competitor source preview
function CompetitorSourcePreview() {
  const competitors = sampleAnalysis.competitors.slice(0, 3).map(comp => {
    const sources = sampleAnalysis.evidence.sources.filter(s => s.domain === comp.domain)
    return {
      name: comp.name,
      domain: comp.domain,
      sources: sources.length,
      verified: sources.length >= 2
    }
  })

  return (
    <div className="bg-white rounded-lg border border-border-subtle p-4 sm:p-5 space-y-3 h-full">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-accent-primary" />
        <p className="text-xs font-semibold text-text-primary">Competitor sources</p>
      </div>
      <div className="space-y-2">
        {competitors.map((comp, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded border border-border-subtle bg-surface-muted/30">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs font-medium text-text-primary truncate">{comp.name}</span>
              {comp.verified && (
                <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
              )}
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 shrink-0">
              {comp.sources} sources
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EvidencePreviewGrid() {
  return (
    <MarketingSection variant="muted" id="evidence">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-3">
              Evidence as a first-class artifact
            </h2>
            <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto">
              Every claim is backed by something you can open, share, and inspect.
            </p>
          </div>
        </Reveal>

        {/* Masonry-style grid */}
        <Stagger stagger={60} className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Reveal delay={0}>
            <EvidenceDrawerPreview />
          </Reveal>
          <Reveal delay={60}>
            <CitationListPreview />
          </Reveal>
          <Reveal delay={120}>
            <CompetitorSourcePreview />
          </Reveal>
        </Stagger>
      </MarketingContainer>
    </MarketingSection>
  )
}

