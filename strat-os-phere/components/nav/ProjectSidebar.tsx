'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { PROJECT_NAV_ITEMS, getActiveNavItem, getPrimaryNavItems, getSupportingNavItems } from '@/lib/nav/projectNav'
import { navLinkClasses, navIconClasses } from '@/lib/nav/navLinkClasses'

interface ProjectSidebarProps {
  projectId: string
  projectName?: string | null
  subtitle?: string | null
}

export function ProjectSidebar({
  projectId,
  projectName,
  subtitle,
}: ProjectSidebarProps) {
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

  const activeItemId = getActiveNavItem(pathname, projectId)
  const primaryItems = getPrimaryNavItems()
  const supportingItems = getSupportingNavItems()

  const renderNavLink = (item: typeof PROJECT_NAV_ITEMS[number]) => {
    const href = item.href(projectId)
    const isActive = activeItemId === item.id
    const Icon = item.icon
    const isDecision = item.id === 'decision'

    const linkContent = (
      <Link
        key={item.id}
        href={href}
        prefetch
        data-testid={`project-nav-item-${item.id}`}
        className={navLinkClasses({ isActive, isDecision })}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => {
          if (process.env.NODE_ENV !== 'production') {
            console.log('[ProjectSidebar] Navigation click:', {
              itemId: item.id,
              href,
              currentPathname: pathname,
            })
          }
        }}
      >
        <Icon className={navIconClasses({ isActive })} />
        <span className="truncate">{item.label}</span>
        {isDecision && isActive && (
          <span className="ml-auto text-[10px] font-medium text-blue-600/70" aria-label="Summary">
            Summary
          </span>
        )}
      </Link>
    )

    // Tooltips not needed when sidebar is always expanded
    return linkContent
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:pt-[57px] md:border-r md:border-border md:z-10 md:bg-background plinth-surface md:w-[240px]"
      >
        <div className="flex flex-col h-full">
          {/* Top Section: Back to Projects + Project Header */}
          <div className="flex-shrink-0">
            {/* Back to Projects Link */}
            <div className="p-3 border-b border-border">
              <Link
                href="/dashboard"
                prefetch
                className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
                data-testid="back-to-projects-link"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Projects</span>
              </Link>
            </div>

            {/* Project Header */}
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-slate-900 leading-tight">
                {projectName || 'Untitled Project'}
              </h2>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Scrollable Navigation */}
          <nav className="flex-1 overflow-y-auto px-2.5 py-3" aria-label="Project navigation" data-testid="project-nav">
            {/* Primary Section */}
            <div className="space-y-0.5 mb-4">
              {primaryItems.map(item => renderNavLink(item))}
            </div>
            
            {/* Supporting Section with divider */}
            <div className="pt-3 border-t border-border space-y-0.5">
              <div className="px-2.5 mb-1.5">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  Details
                </span>
              </div>
              {supportingItems
                .filter(item => item.id !== 'settings') // Settings goes at bottom
                .map(item => renderNavLink(item))}
            </div>
          </nav>

          {/* Sticky Settings Footer */}
          <div className="flex-shrink-0 border-t border-border bg-background">
            <div className="px-2.5 py-2.5">
              {supportingItems
                .filter(item => item.id === 'settings')
                .map(item => renderNavLink(item))}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-[57px] left-0 right-0 z-40 border-b border-border plinth-surface bg-background">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <Link
            href="/dashboard"
            prefetch
            className="flex items-center justify-center h-8 w-8 rounded-md text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            aria-label="Back to Projects"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-slate-900 truncate">
              {projectName || 'Untitled Project'}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 truncate">
                {subtitle}
              </p>
            )}
          </div>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full">
                {/* Top Section: Back to Projects + Project Header */}
                <div className="flex-shrink-0">
                  {/* Back to Projects Link */}
                  <div className="p-3 border-b border-border">
                    <Link
                      href="/dashboard"
                      prefetch
                      className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
                      data-testid="back-to-projects-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to Projects</span>
                    </Link>
                  </div>

                  {/* Project Header */}
                  <div className="px-4 py-3 border-b border-border">
                    <h2 className="text-sm font-semibold text-slate-900 leading-tight">
                      {projectName || 'Untitled Project'}
                    </h2>
                    {subtitle && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Scrollable Navigation */}
                <nav className="flex-1 overflow-y-auto px-2.5 py-3" aria-label="Project navigation" data-testid="project-nav">
                  {/* Primary Section */}
                  <div className="space-y-0.5 mb-4">
                    {primaryItems.map(item => renderNavLink(item))}
                  </div>
                  
                  {/* Supporting Section with divider */}
                  <div className="pt-3 border-t border-border space-y-0.5">
                    <div className="px-2.5 mb-1.5">
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                        Details
                      </span>
                    </div>
                    {supportingItems
                      .filter(item => item.id !== 'settings')
                      .map(item => renderNavLink(item))}
                  </div>
                </nav>

                {/* Sticky Settings Footer */}
                <div className="flex-shrink-0 border-t border-border bg-background">
                  <div className="px-2.5 py-2.5">
                    {supportingItems
                      .filter(item => item.id === 'settings')
                      .map(item => renderNavLink(item))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
