'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'

interface CopySectionButtonProps {
  /**
   * Pre-formatted markdown or plaintext content for this section.
   */
  content: string
  /**
   * Optional label for screen readers and button text.
   */
  label?: string
}

export function CopySectionButton({
  content,
  label = 'Copy',
}: CopySectionButtonProps) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCopy() {
    setError(null)

    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        throw new Error('Clipboard API is not available in this browser.')
      }

      await navigator.clipboard.writeText(content)
      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 1500)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to copy to clipboard.'
      setError(message)
      setCopied(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={handleCopy}
        aria-label={label}
      >
        {copied ? 'Copied' : label}
      </Button>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : copied ? (
        <p className="text-xs text-muted-foreground" role="status">
          Copied
        </p>
      ) : null}
    </div>
  )
}


