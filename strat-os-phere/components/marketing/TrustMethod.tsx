/**
 * Trust / Method Section
 * 
 * Enterprise credibility section showing "What we use" vs "What we never do".
 * Calm, skeptical-operator-focused messaging.
 */
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

const weUse = [
  "Public pages only",
  "Traceable citations for claims",
  "Deterministic scoring inputs",
  "Confidence + coverage indicators",
]

const weNever = [
  "Invent evidence",
  "Hide sources",
  "Require you to trust a black box",
  "Mix private/confidential data by default",
]

export function TrustMethod() {
  return (
    <MarketingSection variant="muted" id="trust">
      <MarketingContainer maxWidth="6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
            Credible by design
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Plinth shows its work. Every recommendation is tied to sources and recency—so you can defend decisions in real conversations.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* What we use */}
          <div className="panel p-8 rounded-xl border border-border-subtle bg-surface shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10">
                <Check className="h-5 w-5 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary">
                What we use
              </h3>
            </div>
            
            <ul className="space-y-4">
              {weUse.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed text-text-secondary">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* What we never do */}
          <div className="panel p-8 rounded-xl border border-border-subtle bg-surface shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger/10">
                <X className="h-5 w-5 text-danger" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary">
                What we never do
              </h3>
            </div>
            
            <ul className="space-y-4">
              {weNever.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed text-text-secondary">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Footnote */}
        <div className="mt-12 text-center">
          <p className="text-sm text-text-muted italic">
            Plinth is designed for skeptical operators.
          </p>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

