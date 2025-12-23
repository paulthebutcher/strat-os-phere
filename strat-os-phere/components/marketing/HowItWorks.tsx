/**
 * How It Works Section
 * 
 * Enhanced with brand tokens for consistent styling and enterprise-grade appearance.
 */
import { Target, Search, TrendingUp } from "lucide-react"
import { Section } from "./Section"
import { FeatureGrid } from "./FeatureGrid"

export function HowItWorks() {
  const steps = [
    {
      icon: Target,
      title: "Describe the decision",
      description: "Write what you're deciding. We infer what to research.",
    },
    {
      icon: Search,
      title: "We gather evidence",
      description: "We pull credible signals across sources and organize them by type.",
    },
    {
      icon: TrendingUp,
      title: "Get ranked opportunities",
      description: "You get prioritized moves + why they matter + citations.",
    },
  ]

  return (
    <Section
      id="how-it-works"
      title="How it works"
      description="Everything is backed by evidence with citations you can validate"
      tone="default"
    >
      <div className="max-w-5xl mx-auto">
        <FeatureGrid items={steps} columns={3} />
      </div>
    </Section>
  )
}

