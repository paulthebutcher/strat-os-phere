'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PROJECT_NAV_ITEMS, getActiveNavItem } from '@/lib/nav/projectNav'
import { cn } from '@/lib/utils'

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

  const renderNavLink = (item: typeof PROJECT_NAV_ITEMS[number]) => {
    const href = item.href(projectId)
    const isActive = activeItemId === item.id
    const Icon = item.icon

    return (
      <Link
        key={item.id}
        href={href}
        data-testid={`project-nav-item-${item.id}`}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isActive
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 md:pt-[57px] md:border-r md:border-border plinth-surface">
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Back to Projects Link */}
          <div className="p-3 border-b border-border">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid="back-to-projects-link"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Projects</span>
            </Link>
          </div>

          {/* Project Header */}
          <div className="p-4 border-b border-border space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground leading-tight">
                {projectName || 'Untitled Project'}
              </h2>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1" aria-label="Project navigation" data-testid="project-nav">
            {PROJECT_NAV_ITEMS.map(renderNavLink)}
          </nav>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-[57px] left-0 right-0 z-40 border-b border-border plinth-surface px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {projectName || 'Untitled Project'}
            </h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {subtitle}
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
              {/* Back to Projects Link */}
              <div className="p-3 border-b border-border">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="back-to-projects-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Projects</span>
                </Link>
              </div>
              {/* Navigation */}
              <nav className="flex-1 p-3 space-y-1" aria-label="Project navigation" data-testid="project-nav">
                {PROJECT_NAV_ITEMS.map(renderNavLink)}
              </nav>
            </div>
          </aside>
        </>
      )}
    </>
  )
}

