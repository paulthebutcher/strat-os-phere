'use client'

import Link from 'next/link'
import { CopySectionButton } from '@/components/results/CopySectionButton'
import type { TabId } from '@/lib/ui/resultsTab'

interface AppendixTabsProps {
  projectId: string
  activeTab: TabId
  copyContent: string
  tabs: Array<{ id: TabId; label: string; enabled: boolean }>
  frame?: string
}

/**
 * Appendix / Deep Dive tabs component
 * 
 * Displays tabs at the bottom of the memo for deep dive sections.
 * Preserves query param navigation but keeps tabs demoted below the memo content.
 */
export function AppendixTabs({
  projectId,
  activeTab,
  copyContent,
  tabs,
  frame,
}: AppendixTabsProps) {
  const enabledTabs = tabs.filter((tab) => tab.enabled)
  
  if (enabledTabs.length === 0) {
    return null
  }
  
  const buildTabUrl = (tabId: TabId) => {
    const params = new URLSearchParams()
    params.set('tab', tabId)
    if (frame) params.set('frame', frame)
    return `/projects/${projectId}/results?${params.toString()}`
  }
  
  return (
    <section className="space-y-6 pt-8 border-t border-border">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Appendix</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Deep dive (for inspection, not decision-making).
        </p>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <nav
          className="tabs-list"
          aria-label="Deep dive sections"
        >
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={buildTabUrl(tab.id)}
              className="tabs-trigger"
              data-state={activeTab === tab.id ? 'active' : 'inactive'}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <CopySectionButton content={copyContent} label="Copy section" />
      </div>
    </section>
  )
}

