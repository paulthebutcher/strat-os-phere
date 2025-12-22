'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { NAV_ITEMS, type NavItem } from '@/lib/navigation/appNav'
import { RegenerateButton } from '@/components/results/RegenerateButton'
import { GenerateResultsV2Button } from '@/components/results/GenerateResultsV2Button'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  projectId: string
  projectName: string
  projectMarket?: string | null
  projectCustomer?: string | null
  hasArtifacts: boolean
  competitorCount: number
  effectiveCompetitorCount?: number
}

export function AppShell({
  children,
  projectId,
  projectName,
  projectMarket,
  projectCustomer,
  hasArtifacts,
  competitorCount,
  effectiveCompetitorCount,
}: AppShellProps) {
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

  // Filter nav items based on conditions
  // For now, we'll show all items. Conditional logic can be added later based on artifact presence
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    // For now, always show conditional items. This can be refined later
    return true
  })

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const renderNavLink = (item: NavItem) => {
    const href = item.href(projectId)
    const active = isActive(href)
    const Icon = item.icon

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
        <Icon className="h-4 w-4 shrink-0" />
        <span>{item.label}</span>
      </Link>
    )
  }

  const contextText = [projectMarket, projectCustomer].filter(Boolean).join(' · ')

  return (
    <div className="flex min-h-[calc(100vh-57px)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 md:pt-[57px] md:border-r md:border-border plinth-surface">
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Project Header */}
          <div className="p-4 border-b border-border space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground leading-tight">
                {projectName}
              </h2>
              {contextText && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {contextText}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {hasArtifacts && competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS ? (
                <RegenerateButton
                  projectId={projectId}
                  competitorCount={effectiveCompetitorCount ?? competitorCount}
                  label="Regenerate"
                />
              ) : null}
              {!hasArtifacts && competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS ? (
                <GenerateResultsV2Button
                  projectId={projectId}
                  label="Generate Analysis"
                />
              ) : null}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1" aria-label="Project navigation" data-testid="project-nav">
            {visibleNavItems.map(renderNavLink)}
          </nav>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-[57px] left-0 right-0 z-40 border-b border-border plinth-surface px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {projectName}
            </h2>
            {contextText && (
              <p className="text-xs text-muted-foreground truncate">
                {contextText}
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
              {/* Mobile Header Actions */}
              <div className="p-4 border-b border-border space-y-2">
                {hasArtifacts && competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS ? (
                  <RegenerateButton
                    projectId={projectId}
                    competitorCount={effectiveCompetitorCount ?? competitorCount}
                    label="Regenerate"
                  />
                ) : null}
                {!hasArtifacts && competitorCount >= MIN_COMPETITORS_FOR_ANALYSIS ? (
                  <GenerateResultsV2Button
                    projectId={projectId}
                    label="Generate Analysis"
                  />
                ) : null}
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-3 space-y-1" aria-label="Project navigation" data-testid="project-nav">
                {visibleNavItems.map(renderNavLink)}
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

