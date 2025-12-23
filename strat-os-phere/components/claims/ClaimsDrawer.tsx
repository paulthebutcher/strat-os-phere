'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ClaimsBundle, Claim } from '@/lib/claims/types'
import { groupClaimsByCategory } from '@/lib/claims/format'

const CATEGORY_LABELS: Record<string, string> = {
  pricing: 'Pricing',
  docs: 'Documentation',
  reviews: 'Reviews',
  jobs: 'Jobs',
  changelog: 'Changelog',
  status: 'Status',
  marketing: 'Marketing',
  other: 'Other',
}

const SUPPORT_LABELS: Record<string, string> = {
  strong: 'Strong',
  medium: 'Medium',
  weak: 'Weak',
}

const SUPPORT_VARIANTS: Record<string, 'default' | 'secondary' | 'muted'> = {
  strong: 'default',
  medium: 'secondary',
  weak: 'muted',
}

interface ClaimsDrawerProps {
  projectId: string
  competitorId?: string
}

export function ClaimsDrawer({ projectId, competitorId }: ClaimsDrawerProps) {
  const [open, setOpen] = React.useState(false)
  const [claimsBundle, setClaimsBundle] = React.useState<ClaimsBundle | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchClaims = React.useCallback(async () => {
    if (claimsBundle) return // Already loaded

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/claims/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, competitorId }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError('No evidence collected yet. Run evidence collection to generate claims.')
        } else {
          setError('Failed to load claims')
        }
        return
      }

      const data = await response.json()
      setClaimsBundle(data)
    } catch (err) {
      console.error('Error fetching claims:', err)
      setError('Failed to load claims')
    } finally {
      setLoading(false)
    }
  }, [projectId, competitorId, claimsBundle])

  React.useEffect(() => {
    if (open && !claimsBundle && !loading) {
      fetchClaims()
    }
  }, [open, claimsBundle, loading, fetchClaims])

  const grouped = React.useMemo(() => {
    if (!claimsBundle) return null
    return groupClaimsByCategory(claimsBundle.claims)
  }, [claimsBundle])

  const claimCount = claimsBundle?.claims.length || 0

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          View key claims {claimCount > 0 && `(${claimCount})`}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Evidence Claims</SheetTitle>
          {claimsBundle?.meta.company && (
            <p className="text-sm text-muted-foreground">
              {claimsBundle.meta.company}
            </p>
          )}
        </SheetHeader>

        <div className="mt-6">
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {error && (
            <div className="py-8 text-sm text-muted-foreground text-center">
              {error}
            </div>
          )}

          {!loading && !error && grouped && (
            <div className="space-y-6">
              {Object.entries(grouped).map(([category, claims]) => {
                if (claims.length === 0) return null

                return (
                  <div key={category}>
                    <h3 className="text-sm font-semibold mb-3 text-foreground">
                      {CATEGORY_LABELS[category] || category}
                    </h3>
                    <div className="space-y-3">
                      {claims.map((claim) => (
                        <ClaimCard key={claim.id} claim={claim} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && !error && claimsBundle && claimsBundle.claims.length === 0 && (
            <div className="py-8 text-sm text-muted-foreground text-center">
              No claims extracted from evidence yet.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ClaimCard({ claim }: { claim: Claim }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm font-medium flex-1">{claim.statement}</p>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={SUPPORT_VARIANTS[claim.support]}>
            {SUPPORT_LABELS[claim.support]}
          </Badge>
          {claim.recencyDays !== null && claim.recencyDays !== undefined && (
            <Badge variant="muted" className="text-xs">
              {claim.recencyDays === 0
                ? 'Today'
                : claim.recencyDays === 1
                ? '1 day ago'
                : `${claim.recencyDays} days ago`}
            </Badge>
          )}
        </div>
      </div>

      {claim.conflicts && claim.conflicts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            Conflicting signals:
          </p>
          {claim.conflicts.map((conflict, idx) => (
            <div key={idx} className="mb-2">
              <p className="text-xs text-muted-foreground">{conflict.statement}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          Citations ({claim.citations.length}):
        </p>
        <div className="space-y-1">
          {claim.citations.map((citation, idx) => (
            <a
              key={idx}
              href={citation.url}
              target="_blank"
              rel="noreferrer"
              className="block text-xs text-primary hover:underline truncate"
            >
              {citation.title || citation.url}
            </a>
          ))}
        </div>
      </div>
    </Card>
  )
}

