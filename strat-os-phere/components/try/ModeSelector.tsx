'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TryMode } from '@/lib/tryDraft'

interface ModeSelectorProps {
  value: TryMode
  onValueChange: (value: TryMode) => void
}

export function ModeSelector({ value, onValueChange }: ModeSelectorProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as TryMode)}>
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="company">Company</TabsTrigger>
        <TabsTrigger value="market">Market</TabsTrigger>
        <TabsTrigger value="idea">Idea</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

