'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import type { NormalizedEvidenceBundle, NormalizedEvidenceType } from '@/lib/evidence/types'

const LABEL: Record<NormalizedEvidenceType, string> = {
  pricing: 'Pricing',
  docs: 'Docs',
  reviews: 'Reviews',
  jobs: 'Jobs',
  changelog: 'Changelog',
  blog: 'Blog',
  community: 'Community',
  security: 'Security',
  other: 'Other',
}

interface EvidenceDrawerProps {
  bundle: NormalizedEvidenceBundle
}

export function EvidenceDrawer({ bundle }: EvidenceDrawerProps) {
  const grouped = React.useMemo(() => {
    const m = new Map<NormalizedEvidenceType, typeof bundle.items>()
    for (const item of bundle.items) {
      const t = item.type ?? 'other'
      if (!m.has(t)) {
        m.set(t, [])
      }
      m.get(t)!.push(item)
    }
    return m
  }, [bundle])

  const types = Array.from(grouped.keys()).sort((a, b) => {
    // Sort by count (descending), then by label
    const aCount = grouped.get(a)?.length ?? 0
    const bCount = grouped.get(b)?.length ?? 0
    if (aCount !== bCount) return bCount - aCount
    return LABEL[a].localeCompare(LABEL[b])
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">View evidence</Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evidence bundle</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {bundle.items.length} source{bundle.items.length !== 1 ? 's' : ''} captured
            {bundle.company && ` • ${bundle.company}`}
          </div>
        </DialogHeader>

        {types.length === 0 ? (
          <div className="py-8 text-sm text-muted-foreground text-center">
            No evidence captured yet.
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {types.map((t) => {
              const items = grouped.get(t)!
              return (
                <AccordionItem key={t} value={t}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <span>{LABEL[t]}</span>
                      <Badge variant="secondary">{items.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {items.map((it) => (
                        <Card key={it.id} className="p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate mb-1">
                                {it.title ?? it.domain ?? it.url}
                              </div>
                              <a
                                href={it.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-primary hover:underline break-all"
                              >
                                {it.url}
                              </a>
                              {it.snippet && (
                                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                  {it.snippet}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0">
                              {it.publishedAt && (
                                <div>
                                  Published:{' '}
                                  {new Date(it.publishedAt).toLocaleDateString()}
                                </div>
                              )}
                              {it.retrievedAt && (
                                <div>
                                  Retrieved:{' '}
                                  {new Date(it.retrievedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </DialogContent>
    </Dialog>
  )
}

