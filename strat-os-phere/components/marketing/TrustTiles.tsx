import { FileText, Clock, Share2 } from "lucide-react"
import { Section } from "./Section"
import { FeatureGrid } from "./FeatureGrid"

export function TrustTiles() {
  const items = [
    {
      icon: FileText,
      title: "Evidence grouped by type",
      description: "Pricing, docs, reviews, and more—organized so you can see what matters.",
    },
    {
      icon: Clock,
      title: "Recency signals",
      description: "So you know what's current and what's stale.",
    },
    {
      icon: Share2,
      title: "Links back to sources",
      description: "For verification and deeper context when you need it.",
    },
  ]

  return (
    <Section
      id="trust"
      title="Credible by design"
      description="Plinth shows its work. Every recommendation is tied to sources and recency—so you can defend decisions in real conversations."
      tone="muted"
    >
      <div className="max-w-6xl mx-auto">
        <FeatureGrid items={items} columns={3} />
      </div>
    </Section>
  )
}

