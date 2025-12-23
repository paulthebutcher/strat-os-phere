'use client'

import { useState, useEffect } from 'react'
import { CommandPalette } from './CommandPalette'
import { useCommandPaletteHotkey } from './useCommandPaletteHotkey'

/**
 * Client component wrapper that manages CommandPalette state and hotkey
 * This can be mounted in server components
 */
export function CommandPaletteProvider() {
  const [open, setOpen] = useState(false)

  useCommandPaletteHotkey(() => setOpen(true), true)

  // Initialize compact mode from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCompact = localStorage.getItem('compact-mode') === 'true'
      if (isCompact) {
        document.documentElement.classList.add('compact-mode')
      }
    }
  }, [])

  return <CommandPalette open={open} onOpenChange={setOpen} />
}

