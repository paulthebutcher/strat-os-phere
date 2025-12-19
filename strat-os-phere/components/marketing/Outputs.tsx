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

export function Outputs() {
  return (
    <section id="outputs" className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold text-text-primary md:text-4xl">
          What you actually get
        </h2>
        <p className="mt-4 text-base text-text-secondary">
          Everything is exportable, copyable, and ready for real work.
        </p>
      </div>
      <div className="mt-16">
        <Tabs defaultValue={outputs[0].id} className="mx-auto max-w-4xl">
          <TabsList className="w-full justify-start overflow-x-auto">
            {outputs.map((output) => (
              <TabsTrigger key={output.id} value={output.id}>
                {output.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {outputs.map((output) => (
            <TabsContent key={output.id} value={output.id} className="mt-8">
              <div className="panel p-8">
                <h3 className="mb-4 text-2xl font-semibold text-text-primary">
                  {output.title}
                </h3>
                <p className="text-base text-text-secondary leading-relaxed">
                  {output.description}
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}

