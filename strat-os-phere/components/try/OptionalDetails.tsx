'use client'

import { Collapsible } from '@/components/ui/collapsible'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

interface OptionalDetailsProps {
  contextText: string
  targetCustomer: string
  onContextTextChange: (value: string) => void
  onTargetCustomerChange: (value: string) => void
}

export function OptionalDetails({
  contextText,
  targetCustomer,
  onContextTextChange,
  onTargetCustomerChange,
}: OptionalDetailsProps) {
  return (
    <Collapsible title="Add details (optional)" defaultOpen={false}>
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="contextText"
            className="text-sm font-semibold text-foreground"
          >
            What are you trying to decide?
          </label>
          <Textarea
            id="contextText"
            value={contextText}
            onChange={(e) => onContextTextChange(e.target.value)}
            placeholder="Describe the decision you're making or the context for this analysis..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="targetCustomer"
            className="text-sm font-semibold text-foreground"
          >
            Who is this for?
          </label>
          <Input
            id="targetCustomer"
            type="text"
            value={targetCustomer}
            onChange={(e) => onTargetCustomerChange(e.target.value)}
            placeholder="e.g. Teams and organizations"
          />
        </div>
      </div>
    </Collapsible>
  )
}

