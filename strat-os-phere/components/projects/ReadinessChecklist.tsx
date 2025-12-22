import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReadinessItem } from '@/lib/ui/readiness'

interface ReadinessChecklistProps {
  items: ReadinessItem[]
  projectId: string
}

/**
 * Checklist component showing project readiness items
 * Each item shows status, label, and optional fix link
 */
export function ReadinessChecklist({ items, projectId }: ReadinessChecklistProps) {
  return (
    <div className="panel p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Readiness checklist
      </h3>
      <ul className="space-y-3">
        {items.map((item) => {
          const isComplete = item.status === 'complete'
          const fixHref = item.fixHref
            ? item.fixHref.startsWith('/')
              ? `/projects/${projectId}${item.fixHref}`
              : item.fixHref
            : undefined

          return (
            <li
              key={item.id}
              className={cn(
                'flex items-start gap-3',
                !isComplete && 'text-muted-foreground'
              )}
            >
              {/* Status icon */}
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                {isComplete ? (
                  <Check className="h-5 w-5 text-success" />
                ) : (
                  <X className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p
                      className={cn(
                        'text-sm',
                        isComplete ? 'font-medium text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {item.label}
                    </p>
                    {item.details && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.details}
                      </p>
                    )}
                  </div>
                  {fixHref && !isComplete && (
                    <Link
                      href={fixHref}
                      className="text-xs font-medium text-primary underline-offset-4 hover:underline shrink-0"
                    >
                      Fix
                    </Link>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

