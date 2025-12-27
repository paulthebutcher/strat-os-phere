/**
 * EvidenceCardsVisual
 * 
 * Clean, intentional visual showing evidence cards in a structured grid.
 * Represents the evidence sources that should make it to the decision table.
 * 
 * Visual principles:
 * - Structured grid layout (2-3 rows)
 * - Small evidence cards with domain labels, extracted claims, and metadata
 * - One highlighted card to show "what makes it to the table"
 * - Clean, no chaos - deliberate product visual
 */
"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface EvidenceCardsVisualProps {
  className?: string
}

interface EvidenceCard {
  domain: string
  claim: string
  claimSecondary?: string
  category: "Pricing" | "Docs" | "Reviews" | "Changelog"
  strength: "High" | "Med"
  isHighlighted?: boolean
  iconColor: string
}

const evidenceData: EvidenceCard[] = [
  {
    domain: "statuspage.io",
    claim: "Real-time status updates",
    claimSecondary: "99.9% uptime SLA",
    category: "Docs",
    strength: "High",
    isHighlighted: true,
    iconColor: "bg-blue-500",
  },
  {
    domain: "docs.acme.com",
    claim: "Enterprise API documentation",
    category: "Docs",
    strength: "Med",
    iconColor: "bg-indigo-500",
  },
  {
    domain: "g2.com",
    claim: "4.8/5 rating",
    claimSecondary: "150+ reviews",
    category: "Reviews",
    strength: "High",
    iconColor: "bg-green-500",
  },
  {
    domain: "pricing.example.com",
    claim: "Starting at $49/month",
    category: "Pricing",
    strength: "Med",
    iconColor: "bg-purple-500",
  },
  {
    domain: "changelog.io",
    claim: "Latest release notes",
    claimSecondary: "Updated 2 days ago",
    category: "Changelog",
    strength: "High",
    iconColor: "bg-cyan-500",
  },
  {
    domain: "docs.beta.com",
    claim: "Beta feature documentation",
    category: "Docs",
    strength: "Med",
    iconColor: "bg-orange-500",
  },
  {
    domain: "reviews.site.com",
    claim: "Customer testimonials",
    category: "Reviews",
    strength: "Med",
    iconColor: "bg-pink-500",
  },
  {
    domain: "pricing.pro.io",
    claim: "Enterprise plans available",
    category: "Pricing",
    strength: "High",
    iconColor: "bg-teal-500",
  },
]

function EvidenceCardItem({ card }: { card: EvidenceCard }) {
  const strengthVariant = card.strength === "High" ? "default" : "secondary"
  
  return (
    <div
      className={cn(
        "bg-white rounded-lg border p-3 space-y-2",
        "transition-shadow duration-200",
        card.isHighlighted
          ? "border-accent-primary/30 shadow-md shadow-accent-primary/10"
          : "border-border-subtle shadow-sm"
      )}
    >
      {/* Header: Icon + Domain */}
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full shrink-0", card.iconColor)} />
        <span className="text-xs font-medium text-text-primary truncate">
          {card.domain}
        </span>
      </div>

      {/* Claims: 1-2 lines of gray text (aligned like text) */}
      <div className="space-y-1">
        <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-1">
          {card.claim}
        </p>
        {card.claimSecondary && (
          <p className="text-[10px] text-text-muted leading-relaxed line-clamp-1">
            {card.claimSecondary}
          </p>
        )}
      </div>

      {/* Footer: Category pill + Strength chip */}
      <div className="flex items-center justify-between pt-1">
        <Badge
          variant="secondary"
          className="text-[10px] px-1.5 py-0 h-4 font-normal"
        >
          {card.category}
        </Badge>
        <Badge
          variant={strengthVariant}
          className={cn(
            "text-[10px] px-1.5 py-0 h-4 font-normal",
            card.strength === "High"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          )}
        >
          {card.strength}
        </Badge>
      </div>
    </div>
  )
}

export function EvidenceCardsVisual({ className }: EvidenceCardsVisualProps) {
  return (
    <div
      className={cn(
        "relative w-full min-h-[500px] p-8 sm:p-12",
        "bg-slate-50/30",
        "rounded-xl border border-border-subtle/40",
        className
      )}
    >
      {/* Grid: 2-3 columns on larger screens, 1 column on mobile */}
      {/* 8 cards total: 4 cols = 2 rows, 3 cols = 3 rows */}
      {/* On mobile, hide cards beyond first 6 using hidden sm:block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {evidenceData.map((card, idx) => (
          <div
            key={idx}
            className={cn(
              // Hide cards 7-8 on mobile (show only first 6)
              idx >= 6 && "hidden sm:block"
            )}
          >
            <EvidenceCardItem card={card} />
          </div>
        ))}
      </div>
    </div>
  )
}

