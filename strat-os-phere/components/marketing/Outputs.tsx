"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const outputs = [
  {
    id: "jobs-to-be-done",
    label: "Jobs-to-be-Done",
    title: "Jobs-to-be-Done + Opportunity Scores",
    description: "Specific jobs customers need done, scored by frequency and dissatisfaction. Each job includes an opportunity score you can act on.",
    bullets: [
      "Jobs extracted from public evidence (reviews, docs, changelogs)",
      "Opportunity scores based on frequency and unmet need",
      "Ready to prioritize your roadmap or positioning",
    ],
  },
  {
    id: "scorecard",
    label: "Scorecard",
    title: "Weighted Scorecard + Bar Chart",
    description: "Compare competitors across weighted criteria with a visual bar chart. See where you win, where you lag, and where gaps exist.",
    bullets: [
      "Weighted scoring matrix across multiple criteria",
      "Visual bar chart for quick comparison",
      "Deterministic scoring with explainers for repeatability",
    ],
  },
  {
    id: "opportunities",
    label: "Opportunities",
    title: "Differentiation Opportunities",
    description: "Ranked opportunities for differentiation, each with first experiments you can run. Grounded in evidence, not assumptions.",
    bullets: [
      "Ranked by leverage and defensibility",
      "First experiments suggested for each opportunity",
      "Evidence-backed with citations you can validate",
    ],
  },
  {
    id: "strategic-bets",
    label: "Strategic Bets",
    title: "Strategic Bets",
    description: "Decision forcing function: what you'd have to say no to, and why competitors won't easily follow. Forces tradeoffs and creates clarity.",
    bullets: [
      "What to say no to (and why)",
      "Why rivals won't follow (structural barriers)",
      "Defensible with evidence trail",
    ],
  },
  {
    id: "evidence",
    label: "Evidence & Citations",
    title: "Evidence & Citations",
    description: "Every output includes citations to public sources: pricing pages, changelogs, reviews, docs, jobs, status pages. Full audit trail.",
    bullets: [
      "Citations for every claim and insight",
      "Public sources only: pricing, changelogs, reviews, docs, jobs, status",
      "You can validate and trace every decision",
    ],
  },
]

/**
 * Outputs Section
 * 
 * Design tokens used:
 * - panel: Card styling for output content
 * - accent-primary: Active tab indicator
 * - surface-muted: Placeholder mockup background
 * 
 * Enhanced with placeholder mockups and improved tab styling.
 */
export function Outputs() {
  return (
    <section id="outputs" className="mx-auto max-w-7xl px-4 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
          Decision-ready outputs
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-text-secondary md:text-xl">
          Everything is copyable, exportable, and ready to use in your strategy work. No buzzwords—just actionable insights.
        </p>
      </div>
      <div className="mt-20">
        <Tabs defaultValue={outputs[0].id} className="mx-auto max-w-5xl">
          <TabsList className="mb-8 w-full justify-start overflow-x-auto border border-border-subtle bg-surface p-1.5">
            {outputs.map((output) => (
              <TabsTrigger key={output.id} value={output.id} className="px-6 py-2.5">
                {output.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {outputs.map((output) => (
            <TabsContent key={output.id} value={output.id} className="mt-8">
              <div className="panel overflow-hidden border-2 border-border-subtle shadow-sm">
                <div className="p-8 md:p-10">
                  <h3 className="mb-4 text-2xl font-semibold text-text-primary md:text-3xl">
                    {output.title}
                  </h3>
                  <p className="mb-6 text-base leading-relaxed text-text-secondary md:text-lg">
                    {output.description}
                  </p>
                  {output.bullets && (
                    <ul className="mb-8 space-y-3">
                      {output.bullets.map((bullet, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <svg className="mt-0.5 h-5 w-5 shrink-0 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-base leading-relaxed text-text-secondary md:text-lg">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Placeholder mockup */}
                <div className="border-t border-border-subtle bg-surface-muted">
                  <div className="aspect-video flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="mx-auto mb-4 h-16 w-16 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                        <svg
                          className="h-8 w-8 text-accent-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-text-muted">
                        {output.title} output preview
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}

