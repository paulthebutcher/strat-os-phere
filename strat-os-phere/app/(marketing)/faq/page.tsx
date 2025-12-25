/**
 * FAQ Page
 * 
 * Skeptical, decision-grade FAQ addressing trust questions and common concerns.
 */
import type { Metadata } from "next"
import Link from "next/link"
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell"
import { MarketingSection } from "@/components/marketing/MarketingSection"
import { MarketingContainer } from "@/components/marketing/MarketingContainer"
import { GlassPanel } from "@/components/marketing/GlassPanel"
import { Button } from "@/components/ui/button"
import { createPageMetadata } from "@/lib/seo/metadata"
import { cn } from "@/lib/utils"

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "FAQ — Plinth",
    description: "Frequently asked questions about how Plinth works, evidence handling, and decision support.",
    path: "/faq",
    robots: {
      index: true,
      follow: true,
    },
  })
}

export default function FAQPage() {
  return (
    <MarketingPageShell
      title="Frequently Asked Questions"
      eyebrow="Trust & Clarity"
      lead="Straight answers to skeptical questions about how Plinth works, what it does, and what it doesn't."
    >
      <MarketingSection>
        <MarketingContainer maxWidth="4xl">
          <div className="space-y-8">
            <GlassPanel className="p-8 md:p-12">
              <div className="space-y-12">
                {/* FAQ Items */}
                <div className="space-y-10">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      What does Plinth actually do?
                    </h2>
                    <p className="text-base text-text-secondary leading-relaxed">
                      Plinth helps strategy teams turn competitive research into decision-ready outputs. You provide a decision question and competitors, and Plinth collects evidence from public sources, normalizes it, and ranks strategic opportunities—with full citations and confidence indicators. It's designed for VP+ Product, UX, and Strategy teams who need to defend recommendations with evidence.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      How is this different from generic AI research tools?
                    </h2>
                    <p className="text-base text-text-secondary leading-relaxed">
                      Most AI research tools give you summaries. Plinth gives you investment-ready recommendations with deterministic scoring, confidence boundaries, and traceable evidence. Every opportunity is ranked using transparent criteria (recency, coverage, specificity), not black-box models. We're optimized for strategic decisions, not general knowledge retrieval.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      What happens when evidence is thin?
                    </h2>
                    <p className="text-base text-text-secondary leading-relaxed">
                      Plinth shows confidence indicators for every recommendation. When evidence is thin, confidence scores drop. If Plinth can't support a recommendation with sufficient evidence, it returns fewer (or no) opportunities—rather than fabricating confidence. You'll see coverage metrics and recency indicators so you can judge the strength of the evidence yourself.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      Do you hallucinate? How do citations work?
                    </h2>
                    <p className="text-base text-text-secondary leading-relaxed">
                      Every claim in Plinth's output is tied to at least one citation with a URL you can verify. We collect evidence from public pages (marketing sites, help docs, blog posts), normalize it, and link recommendations directly to sources. Citations include recency metadata so you know how fresh the evidence is. We don't generate claims without citations, and we don't fabricate URLs.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      What sources do you use (and what don't you use)?
                    </h2>
                    <p className="text-base text-text-secondary leading-relaxed">
                      We collect evidence exclusively from publicly accessible pages: marketing sites, help documentation, blog posts, product pages, and similar public-facing content. We don't access private data, attempt to bypass authentication, scrape behind paywalls, or use methods that would violate terms of service. We focus on information that competitors have chosen to publish publicly.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      Can I use this for early-stage ideas and also VP-level decisions?
                    </h2>
                    <p className="text-base text-text-secondary leading-relaxed">
                      Yes. Plinth works across decision maturity levels. For early-stage ideas, confidence scores will reflect the limited evidence available—but you'll still get structured opportunities with citations. For VP-level decisions, the same system surfaces higher-confidence recommendations when evidence is stronger. The confidence boundary lens adapts to the evidence, not the persona. You decide what level of confidence is acceptable for your decision context.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      What's an 'investment-ready' recommendation?
                    </h2>
                    <p className="text-base text-text-secondary leading-relaxed">
                      An investment-ready recommendation is a strategic opportunity that's scored, ranked, and backed by evidence with confidence indicators. It's formatted for decision-makers who need to justify resource allocation. Each recommendation includes: the opportunity itself, evidence citations, recency indicators, coverage metrics, and a deterministic score—so you can defend it in real conversations without relying on "the AI said so."
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      Do you store competitive data?
                    </h2>
                    <p className="text-base text-text-secondary leading-relaxed">
                      We store your project inputs (decision question, competitor names) and the evidence we collect during your analysis runs. This data is private to your account. We don't share your competitive data with other users. We do collect evidence from public sources, but we store it in the context of your projects—not in a shared pool. See our Privacy Policy for details.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      Is this secure / enterprise-ready?
                    </h2>
                    <p className="text-base text-text-secondary leading-relaxed">
                      We use industry-standard security practices: encrypted connections, secure authentication, and data isolation. However, we're honest about our current state: this is an early product focused on individual strategy professionals. If you're evaluating Plinth for enterprise deployment with specific compliance requirements, contact us to discuss your needs. We don't overpromise certifications we don't have.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      How do I get best results?
                    </h2>
                    <p className="text-base text-text-secondary leading-relaxed">
                      Be specific with your decision question. Add competitors (3-7 works well). Include any known constraints or context that matters. The more focused your question, the better Plinth can surface relevant opportunities. Also: let Plinth run its full evidence collection cycle—skipping evidence collection leads to weaker recommendations. Review citations to understand the evidence base, and use confidence scores to filter recommendations that match your risk tolerance.
                    </p>
                  </div>
                </div>

                {/* Callout */}
                <div className={cn("pt-8 border-t border-border-subtle")}>
                  <div className={cn("p-6 rounded-lg", "bg-surface-muted border border-border-subtle")}>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      <strong className="font-semibold text-text-primary">Important:</strong> If Plinth can't support a recommendation with sufficient evidence, it returns fewer (or no) opportunities. We prioritize honesty over completeness.
                    </p>
                  </div>
                </div>
              </div>
            </GlassPanel>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/trust">
                <Button size="lg" variant="outline">
                  See how Plinth thinks
                </Button>
              </Link>
              <Link href="/samples">
                <Button size="lg" variant="outline">
                  View an example
                </Button>
              </Link>
            </div>
          </div>
        </MarketingContainer>
      </MarketingSection>
    </MarketingPageShell>
  )
}

