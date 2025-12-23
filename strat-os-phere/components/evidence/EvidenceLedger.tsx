'use client'

import { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EvidenceLedgerModel, EvidenceItem } from '@/lib/evidence/ledger'

interface EvidenceLedgerProps {
  model: EvidenceLedgerModel
  className?: string
}

const INITIAL_ITEMS_SHOWN = 5

/**
 * Copy link to clipboard
 */
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
    } catch (fallbackErr) {
      // Ignore
    }
    document.body.removeChild(textArea)
  }
}

/**
 * Evidence Item Row
 */
function EvidenceItemRow({ item }: { item: EvidenceItem }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(item.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="py-3 border-b border-border last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
            >
              <span className="truncate">{item.title}</span>
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </a>
          </div>
          <div className="text-xs text-muted-foreground mb-1">
            {item.domain}
          </div>
          {item.snippet && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {item.snippet}
            </p>
          )}
          {item.date && (
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(item.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 shrink-0"
          onClick={handleCopy}
          title="Copy link"
        >
          <Copy className={cn('h-3.5 w-3.5', copied && 'text-primary')} />
        </Button>
      </div>
    </div>
  )
}

/**
 * Evidence Group
 */
function EvidenceGroup({
  type,
  items,
}: {
  type: EvidenceLedgerModel['groups'][0]['type']
  items: EvidenceItem[]
}) {
  const [showAll, setShowAll] = useState(false)
  const hasMore = items.length > INITIAL_ITEMS_SHOWN
  const displayedItems = showAll
    ? items
    : items.slice(0, INITIAL_ITEMS_SHOWN)

  return (
    <AccordionItem value={type} className="border-b">
      <AccordionTrigger className="py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{type}</span>
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="pt-2">
          {displayedItems.map((item) => (
            <EvidenceItemRow key={item.id} item={item} />
          ))}
          {hasMore && (
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <>
                    Show less
                    <ChevronDown className="h-3 w-3 ml-1 rotate-180" />
                  </>
                ) : (
                  <>
                    View all {items.length} sources
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

/**
 * Evidence Ledger
 * Displays evidence grouped by type in an accordion
 */
export function EvidenceLedger({
  model,
  className,
}: EvidenceLedgerProps) {
  if (model.groups.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Accordion type="multiple" className="w-full">
        {model.groups.map((group) => (
          <EvidenceGroup
            key={group.type}
            type={group.type}
            items={group.items}
          />
        ))}
      </Accordion>
    </div>
  )
}

