'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  FolderKanban,
  Plus,
  Lightbulb,
  HelpCircle,
  Copy,
  Layout,
  ChevronRight,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type CommandItem = {
  id: string
  label: string
  keywords?: string
  shortcut?: string
  section: 'Navigate' | 'Projects' | 'Actions'
  href?: string
  run?: () => Promise<void> | void
  icon?: React.ComponentType<{ className?: string }>
}

const COMMANDS: CommandItem[] = [
  // Navigate
  {
    id: 'nav-projects',
    label: 'Projects',
    keywords: 'dashboard projects list',
    section: 'Navigate',
    href: '/dashboard',
    icon: FolderKanban,
  },
  {
    id: 'nav-new-analysis',
    label: 'New Analysis',
    keywords: 'new project create analysis',
    section: 'Navigate',
    href: '/projects/new',
    icon: Plus,
  },
  {
    id: 'nav-insights',
    label: 'Insights',
    keywords: 'insights dashboard',
    section: 'Navigate',
    href: '/dashboard',
    icon: Lightbulb,
  },
  {
    id: 'nav-help',
    label: 'Help',
    keywords: 'help documentation support',
    section: 'Navigate',
    href: '/help',
    icon: HelpCircle,
  },
  // Actions
  {
    id: 'action-copy-url',
    label: 'Copy Current Page URL',
    keywords: 'copy url link share',
    section: 'Actions',
    icon: Copy,
    run: async () => {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href)
      }
    },
  },
  {
    id: 'action-toggle-compact',
    label: 'Toggle Compact Mode',
    keywords: 'compact mode spacing tight',
    section: 'Actions',
    icon: Layout,
    run: () => {
      if (typeof window !== 'undefined') {
        const isCompact = localStorage.getItem('compact-mode') === 'true'
        localStorage.setItem('compact-mode', String(!isCompact))
        // Trigger a small visual feedback - could add a toast here
        document.documentElement.classList.toggle('compact-mode', !isCompact)
      }
    },
  },
]

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search.trim()) {
      return COMMANDS
    }

    const query = search.toLowerCase()
    return COMMANDS.filter((cmd) => {
      const labelMatch = cmd.label.toLowerCase().includes(query)
      const keywordMatch = cmd.keywords?.toLowerCase().includes(query)
      return labelMatch || keywordMatch
    })
  }, [search])

  // Group commands by section
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      Navigate: [],
      Projects: [],
      Actions: [],
    }

    filteredCommands.forEach((cmd) => {
      if (groups[cmd.section]) {
        groups[cmd.section].push(cmd)
      }
    })

    // Remove empty sections
    return Object.entries(groups).filter(([_, items]) => items.length > 0)
  }, [filteredCommands])

  // Flatten for keyboard navigation
  const flatCommands = useMemo(() => {
    return filteredCommands
  }, [filteredCommands])

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure dialog is fully rendered
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      setSearch('')
      setSelectedIndex(0)
    }
  }, [open])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && flatCommands.length > 0) {
      const selectedElement = listRef.current.querySelector(
        `[data-command-index="${selectedIndex}"]`
      )
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        })
      }
    }
  }, [selectedIndex, flatCommands.length])

  const handleSelect = async (command: CommandItem) => {
    if (command.href) {
      router.push(command.href)
      onOpenChange(false)
    } else if (command.run) {
      await command.run()
      onOpenChange(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < flatCommands.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (flatCommands[selectedIndex]) {
        handleSelect(flatCommands[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onOpenChange(false)
    }
  }

  let commandIndex = 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="sr-only">Command Palette</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type to search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 h-12 text-base"
            />
          </div>
        </DialogHeader>

        <div
          ref={listRef}
          className="max-h-[400px] overflow-y-auto px-2 pb-4"
        >
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No results found for &quot;{search}&quot;
              </p>
            </div>
          ) : (
            groupedCommands.map(([section, items]) => (
              <div key={section} className="py-2">
                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section}
                </div>
                <div className="space-y-0.5">
                  {items.map((command) => {
                    const index = commandIndex++
                    const isSelected = index === selectedIndex
                    const Icon = command.icon

                    return (
                      <button
                        key={command.id}
                        data-command-index={index}
                        onClick={() => handleSelect(command)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors',
                          'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isSelected && 'bg-muted'
                        )}
                      >
                        {Icon && (
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="flex-1 font-medium text-foreground">
                          {command.label}
                        </span>
                        {command.shortcut && (
                          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            {command.shortcut}
                          </kbd>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {filteredCommands.length > 0 && search.trim() === '' && (
          <div className="px-4 py-2 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="h-5 px-1.5 rounded border bg-background font-mono">
                    ↑↓
                  </kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="h-5 px-1.5 rounded border bg-background font-mono">
                    Enter
                  </kbd>
                  <span>Select</span>
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="h-5 px-1.5 rounded border bg-background font-mono">
                  Esc
                </kbd>
                <span>Close</span>
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

