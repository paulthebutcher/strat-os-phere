/**
 * Proof → What You Actually Get Section
 * 
 * Shows real outcomes with visual indicators instead of generic feature bullets.
 */
import { FileText, CheckCircle2, ArrowRight } from "lucide-react"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal, Stagger } from "./motion"
import { cn } from "@/lib/utils"

interface BenefitTileProps {
  icon: React.ElementType
  title: string
  description: string
}

function BenefitTile({ icon: Icon, title, description }: BenefitTileProps) {
  return (
    <div className={cn(
      "panel p-6 md:p-8 rounded-2xl border border-border-subtle",
      "bg-surface shadow-sm hover:shadow-md transition-all",
      "hover:border-accent-primary/30 hover:-translate-y-0.5"
    )}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-primary/10">
          <Icon className="h-6 w-6 text-accent-primary" />
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-text-primary">
        {title}
      </h3>
      <p className="text-sm md:text-base leading-relaxed text-text-secondary">
        {description}
      </p>
    </div>
  )
}

export function ProofSection() {
  const benefits = [
    {
      icon: FileText,
      title: "Evidence with citations",
      description: "Every claim ties back to a real source you can open and share.",
    },
    {
      icon: CheckCircle2,
      title: "Confidence made explicit",
      description: "No hidden uncertainty — know what's supported vs unknown.",
    },
    {
      icon: ArrowRight,
      title: "Next steps built in",
      description: "Clear next moves and what would change the call.",
    },
  ]

  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary">
              See why Plinth works — without the fluff
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Stagger>
            {benefits.map((benefit, index) => (
              <BenefitTile
                key={index}
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
              />
            ))}
          </Stagger>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

