"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const outputs = [
  {
    id: "competitor-profiles",
    label: "Competitor Profiles",
    title: "Competitor Profiles",
    description: "Evidence-backed positioning, value props, capabilities, and risks. See how competitors actually position themselves, not just what they claim.",
  },
  {
    id: "market-themes",
    label: "Market Themes",
    title: "Market Themes",
    description: "What's converging, what's commoditized, what's over-served. Understand the structural patterns across the competitive landscape.",
  },
  {
    id: "positioning-map",
    label: "Positioning Map",
    title: "Positioning Map",
    description: "How competitors cluster — and where space still exists. A text-based view of the competitive landscape that reveals opportunities.",
  },
  {
    id: "jobs-to-be-done",
    label: "Jobs To Be Done",
    title: "Jobs To Be Done",
    description: "Specific jobs customers need done that competitors don't support. Find unmet needs that represent real differentiation opportunities.",
  },
  {
    id: "opportunities",
    label: "Opportunities & Angles",
    title: "Opportunities & Angles",
    description: "Ranked, defensible paths to differentiation. Strategic angles grounded in evidence that you can act on with confidence.",
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
  const outputs = [
    {
      title: "Jobs to Be Done",
      description: "Clear, specific jobs grounded in unmet demand — not generic personas.",
    },
    {
      title: "Competitive Scorecards",
      description: "Weighted comparisons that reveal where differences actually matter.",
    },
    {
      title: "Strategic Opportunities",
      description: "Ranked opportunities that force clarity on tradeoffs, required capabilities, and defensibility.",
    },
  ]

  return (
    <section id="outputs" className="mx-auto max-w-7xl px-4 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
          What you actually get
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-text-secondary md:text-xl">
          Everything is exportable, copyable, and ready for real work.
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
                  <p className="mb-8 text-base leading-relaxed text-text-secondary md:text-lg">
                    {output.description}
                  </p>
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
                        {output.title} mockup placeholder
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </div>
      </div>
    </section>
  )
}

