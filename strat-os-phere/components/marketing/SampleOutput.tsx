/**
 * Sample Output Section
 * 
 * Interactive sample output switcher for marketing purposes.
 * Shows 2-3 example opportunity cards that users can toggle between.
 */
import { Section } from "./Section"
import { SampleOutputSwitcher } from "./SampleOutputSwitcher"
import { Badge } from "@/components/ui/badge"

export function SampleOutput() {
  return (
    <Section
      id="sample-output"
      title="Sample output"
      description="This is what you share internally: the top opportunities, why they matter, and the evidence behind them."
      tone="muted"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <Badge variant="secondary" className="px-3 py-1">
            Exec-ready
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            Citations included
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            Actionable next steps
          </Badge>
        </div>
        
        <SampleOutputSwitcher />
      </div>
    </Section>
  )
}

