'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  Briefcase,
  ClipboardList,
  Users,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectNavigatorProps {
  projectId: string
  projectName: string
  /**
   * Whether to show sub-navigation links for Results sections
   */
  showResultsSubNav?: boolean
  /**
   * Whether the sidebar is collapsed (for mobile/responsive)
   */
  collapsed?: boolean
}

/**
 * Left-rail project navigator component
 * Pure UI component that does NOT change routes - uses existing navigation structure
 * Optional and non-breaking: only renders on project pages
 */
export function ProjectNavigator({
  projectId,
  projectName,
  showResultsSubNav = false,
  collapsed = false,
}: ProjectNavigatorProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      href: `/projects/${projectId}/overview`,
    },
    {
      id: 'competitors',
      label: 'Competitors',
      icon: Users,
      href: `/projects/${projectId}/competitors`,
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: Target,
      href: `/projects/${projectId}/opportunities`,
    },
    {
      id: 'strategic_bets',
      label: 'Strategic Bets',
      icon: TrendingUp,
      href: `/projects/${projectId}/strategic-bets`,
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: Briefcase,
      href: `/projects/${projectId}/jobs`,
    },
    {
      id: 'scorecard',
      label: 'Scorecard',
      icon: ClipboardList,
      href: `/projects/${projectId}/scorecard`,
    },
  ]

  // Results sub-navigation (anchor-scroll within Results page)
  // Note: These are UI-only links that scroll to sections, not route changes
  const resultsSubNav = [
    { label: 'Opportunities', href: '#opportunities' },
    { label: 'Strategic Bets', href: '#strategic-bets' },
    { label: 'Scorecard', href: '#scorecard' },
    { label: 'Jobs', href: '#jobs' },
  ]

  if (collapsed) {
    return null
  }

  return (
    <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-[57px] lg:border-r lg:border-border lg:bg-surface">
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Project Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground leading-tight truncate">
            {projectName}
          </h2>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-3 space-y-1" aria-label="Project navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  active
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          {/* Results sub-navigation (only shown when on results-related pages) */}
          {showResultsSubNav && (
            <div className="pt-4 mt-4 border-t border-border">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Results Sections
              </div>
              <div className="space-y-1">
                {resultsSubNav.map((subItem) => (
                  <a
                    key={subItem.href}
                    href={subItem.href}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                    <span>{subItem.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>
    </aside>
  )
}

