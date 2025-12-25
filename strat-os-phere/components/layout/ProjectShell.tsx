'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { projectRoutes } from '@/lib/routing/projectRoutes'
import { cn } from '@/lib/utils'

type ProjectShellActive = 
  | 'opportunities'
  | 'competitors'
  | 'evidence'
  | 'scorecard'
  | 'settings'
  | 'appendix'

interface ProjectShellProps {
  project: { id: string; name?: string | null; market?: string | null }
  active?: ProjectShellActive
  children: React.ReactNode
}

const NAV_ITEMS: Array<{
  id: ProjectShellActive
  label: string
  href: (id: string) => string
}> = [
  {
    id: 'opportunities',
    label: 'Opportunities',
    href: projectRoutes.opportunities,
  },
  {
    id: 'competitors',
    label: 'Competitors',
    href: projectRoutes.competitors,
  },
  {
    id: 'scorecard',
    label: 'Scorecard',
    href: projectRoutes.scorecard,
  },
  {
    id: 'evidence',
    label: 'Evidence',
    href: projectRoutes.evidence,
  },
  {
    id: 'appendix',
    label: 'Appendix',
    href: projectRoutes.appendix,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: projectRoutes.settings,
  },
]

export function ProjectShell({ project, active, children }: ProjectShellProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const renderNavLink = (item: typeof NAV_ITEMS[number]) => {
    const href = item.href(project.id)
    const active = isActive(href)

    return (
      <Link
        key={item.id}
        href={href}
        data-testid={`project-nav-item-${item.id}`}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          active
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-current={active ? 'page' : undefined}
      >
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 md:pt-[57px] md:border-r md:border-border plinth-surface">
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Project Header */}
          <div className="p-4 border-b border-border space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground leading-tight">
                {project.name || 'Untitled Project'}
              </h2>
              {project.market && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {project.market}
                </p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1" aria-label="Project navigation" data-testid="project-nav">
            {NAV_ITEMS.map(renderNavLink)}
          </nav>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-[57px] left-0 right-0 z-40 border-b border-border plinth-surface px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {project.name || 'Untitled Project'}
            </h2>
            {project.market && (
              <p className="text-xs text-muted-foreground truncate">
                {project.market}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 w-64 plinth-surface border-r border-border pt-[57px] pb-4 overflow-y-auto md:hidden">
            <div className="flex flex-col h-full">
              {/* Navigation */}
              <nav className="flex-1 p-3 space-y-1" aria-label="Project navigation" data-testid="project-nav">
                {NAV_ITEMS.map(renderNavLink)}
              </nav>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-60">
        <div className="pt-0 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}

