'use client'

import { Button } from '@/components/ui/button'
import type { TryMode } from '@/lib/tryDraft'

interface ExampleChip {
  label: string
  mode: TryMode
  value: string
}

const EXAMPLES: ExampleChip[] = [
  { label: 'Monday', mode: 'company', value: 'Monday' },
  { label: 'PagerDuty', mode: 'company', value: 'PagerDuty' },
  { label: 'Expense management tools', mode: 'market', value: 'Expense management tools' },
]

interface ExampleChipsProps {
  onSelect: (mode: TryMode, value: string) => void
}

export function ExampleChips({ onSelect }: ExampleChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {EXAMPLES.map((example, index) => (
        <Button
          key={index}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSelect(example.mode, example.value)}
          className="text-xs"
        >
          {example.label}
        </Button>
      ))}
    </div>
  )
}

