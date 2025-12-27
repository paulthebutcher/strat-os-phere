'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toastSuccess, toastError } from '@/lib/toast/toast'

interface ShareButtonProps {
  projectId: string
}

export function ShareButton({ projectId }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleOpen = async () => {
    setIsOpen(true)
    setError(null)
    setCopied(false)

    // If we already have a URL, don't fetch again
    if (shareUrl) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/shares/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create share link')
      }

      const data = await response.json()
      setShareUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share link')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toastSuccess('Copied link')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy link')
      toastError('Failed to copy link')
    }
  }

  const handleRevoke = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/shares/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to revoke share link')
      }

      setShareUrl(null)
      setIsOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke share link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={handleOpen} variant="outline" type="button">
        Share readout
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share readout</DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Anyone with this link can view
            </p>
          </DialogHeader>

          {loading && !shareUrl && (
            <div className="py-4 text-sm text-muted-foreground">Creating share link...</div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {shareUrl && (
            <div className="mb-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground"
                />
                <Button
                  onClick={handleCopy}
                  variant={copied ? 'default' : 'outline'}
                  size="default"
                  type="button"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              type="button"
            >
              Close
            </Button>
            {shareUrl && (
              <Button
                onClick={handleRevoke}
                variant="destructive"
                type="button"
                disabled={loading}
              >
                Revoke link
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

