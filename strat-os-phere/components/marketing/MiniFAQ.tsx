/**
 * Mini FAQ Section
 * 
 * Lightweight FAQ addressing common objections and questions.
 * Focused on credibility and clarity.
 */
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

const faqs = [
  {
    question: "Where does evidence come from?",
    answer: "Plinth pulls from public pages only: pricing pages, documentation, changelogs, and review sites. We never invent evidence or use private data without explicit permission.",
  },
  {
    question: "How do citations work?",
    answer: "Every strategic recommendation links back to specific sources with timestamps. You can see exactly which pricing page, doc page, or review thread supports each claim.",
  },
  {
    question: "Is this a research tool?",
    answer: "No, it's a decision system. Plinth doesn't just gather information—it ranks opportunities by evidence strength, defensibility, and market timing to help you make decisions.",
  },
  {
    question: "What if I disagree with a ranking?",
    answer: "All scoring inputs are visible. You can inspect the evidence, see the confidence levels, and adjust your decision context. Plinth shows its work so you can defend or challenge the output.",
  },
]

export function MiniFAQ() {
  return (
    <MarketingSection variant="muted" id="faq">
      <MarketingContainer maxWidth="4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
            Common questions
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Clear answers to help you understand how Plinth works.
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={cn(
                "panel p-6 rounded-xl border border-border-subtle",
                "bg-surface shadow-sm"
              )}
            >
              <h3 className="text-base font-semibold text-text-primary mb-2">
                {faq.question}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

