'use client'

import { ProjectNav } from '@/components/nav/ProjectNav'
import { cn } from '@/lib/utils'
import { appGutter } from '@/lib/ui/tokens'

interface ProjectAppShellProps {
  projectId: string
  projectTitle?: string | null
  subtitle?: string | null
  children: React.ReactNode
  className?: string
}

/**
 * Canonical Project App Shell
 * 
 * This is the ONLY layout wrapper for project pages.
 * 
 * Responsibilities:
 * - Two-column layout: left nav + main content
 * - Enforce layout contract:
 *   - Main content starts ≤ 24px from the nav
 *   - No mystery "white strip" / extra column between nav and content
 * - Ensure main content scrolls properly:
 *   - The shell allows vertical scrolling for the content area
 *   - Avoid overflow: hidden traps
 * 
 * Layout spacing:
 * - Sidebar width: 240px (desktop)
 * - Sidebar-to-main gutter: 24px (max allowed, enforced via padding)
 * - Main content margin-left: 240px (sidebar width)
 * - Main content padding-left: 24px (creates the gutter)
 */
export function ProjectAppShell({
  projectId,
  projectTitle,
  subtitle,
  children,
  className,
}: ProjectAppShellProps) {
  return (
    <div className="flex h-[calc(100vh-57px)] min-h-0 relative">
      <ProjectNav
        projectId={projectId}
        projectTitle={projectTitle}
        subtitle={subtitle}
      />

      {/* Main Content - positioned to not overlap sidebar */}
      {/* Sidebar width: 240px expanded */}
      {/* Sidebar-to-main gutter: 24px for tight spacing (max allowed) */}
      <main
        className={cn(
          'flex-1 relative z-0 min-h-0 overflow-y-auto',
          // Desktop: sidebar is 240px, content starts after it
          'md:ml-[240px]',
          // Main content padding creates the 24px gutter
          appGutter.combined
        )}
      >
        <div className="pt-0 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}

