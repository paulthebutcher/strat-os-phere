/**
 * Credibility Section
 * 
 * Trust-building section immediately after hero that explains why teams trust Plinth.
 * Emphasizes "method over magic" with concrete credibility signals.
 */
import { Check } from "lucide-react"
import { MarketingSection } from "../MarketingSection"
import { MarketingContainer } from "../MarketingContainer"
import { Badge } from "@/components/ui/badge"
import { GlassPanel } from "../GlassPanel"
import { cn } from "@/lib/utils"

const credibilityPoints = [
  {
    title: "Public sources only",
    description: "Pricing, docs, changelogs, reviews—only publicly available signals",
  },
  {
    title: "Every claim is cited",
    description: "Every recommendation links back to specific sources with timestamps",
  },
  {
    title: "Deterministic scoring drivers",
    description: "Scoring is transparent and repeatable, not a black box",
  },
  {
    title: "Explicit gaps and assumptions",
    description: "We show what we know, what we don't, and what we're assuming",
  },
]

const trustBadges = [
  "Citations included",
  "Deterministic",
  "Exec-ready",
]

export function CredibilitySection() {
  return (
    <MarketingSection variant="default">
      <MarketingContainer maxWidth="6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
            Why teams trust Plinth's recommendations
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Plinth is a method, not a black box. Every bet is grounded in public signals.
          </p>
        </div>

        {/* Credibility points grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {credibilityPoints.map((point, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-border-subtle p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10 mt-0.5">
                  <Check className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    {point.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {point.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Glass badge row */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {trustBadges.map((badge) => (
            <GlassPanel key={badge} variant="default" className="px-4 py-2">
              <Badge variant="secondary" className="text-xs font-medium border-0 bg-transparent">
                {badge}
              </Badge>
            </GlassPanel>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

