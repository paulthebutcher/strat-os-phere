'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to handle ⌘K / Ctrl+K hotkey for opening command palette
 * Prevents triggering when user is typing in inputs, textareas, or contenteditable elements
 */
export function useCommandPaletteHotkey(
  onOpen: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if ⌘K (Mac) or Ctrl+K (Windows/Linux)
      const isModifierPressed = e.metaKey || e.ctrlKey
      const isKKey = e.key === 'k' || e.key === 'K'

      if (!isModifierPressed || !isKKey) return

      // Don't trigger if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement
      const isInputElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      if (isInputElement) return

      // Prevent default browser behavior (e.g., browser search)
      e.preventDefault()
      onOpen()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onOpen, enabled])
}

