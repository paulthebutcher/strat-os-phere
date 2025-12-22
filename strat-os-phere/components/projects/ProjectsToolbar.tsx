'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type SortKey = 'updated' | 'created' | 'name'

interface ProjectsToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortKey: SortKey
  onSortChange: (sort: SortKey) => void
}

export function ProjectsToolbar({
  searchQuery,
  onSearchChange,
  sortKey,
  onSortChange,
}: ProjectsToolbarProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Search projects…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-sm text-muted-foreground whitespace-nowrap">
          Sort:
        </label>
        <select
          id="sort-select"
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className={cn(
            "flex h-10 rounded-lg border border-border bg-input px-3 py-2 text-sm",
            "text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors"
          )}
        >
          <option value="updated">Last updated</option>
          <option value="created">Created</option>
          <option value="name">Name</option>
        </select>
      </div>
    </div>
  )
}

