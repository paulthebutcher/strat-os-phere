'use client'

import { ProjectSidebar } from '@/components/nav/ProjectSidebar'
import { SidebarProvider, useSidebar } from '@/components/nav/SidebarContext'
import { cn } from '@/lib/utils'

interface ProjectLayoutShellProps {
  projectId: string
  projectName?: string | null
  subtitle?: string | null
  children: React.ReactNode
}

function ProjectLayoutShellInner({
  projectId,
  projectName,
  subtitle,
  children,
}: ProjectLayoutShellProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex min-h-[calc(100vh-57px)] relative">
      <ProjectSidebar
        projectId={projectId}
        projectName={projectName}
        subtitle={subtitle}
      />

      {/* Main Content - positioned to not overlap sidebar */}
      {/* Sidebar width: 240px expanded, 64px collapsed */}
      {/* Sidebar-to-main gutter is intentionally capped at 24px (gap-6) for scanability */}
      <main
        className={cn(
          'flex-1 relative z-0 transition-[margin-left] duration-200 ease-out',
          // Expanded: 240px sidebar + 24px gap = 264px
          'md:ml-[264px]',
          // Collapsed: 64px sidebar + 24px gap = 88px
          isCollapsed && 'md:ml-[88px]'
        )}
      >
        <div className="pt-0 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}

/**
 * Canonical layout shell for project pages
 * 
 * This component provides:
 * - Project sidebar navigation (left)
 * - Main content area (right)
 * 
 * It should be used in the project layout to ensure all project pages
 * have consistent navigation without duplicate navs.
 * 
 * Layout spacing:
 * - Sidebar-to-main gutter: 24px (gap-6) maximum for optimal scanability
 * - Sidebar width: 240px expanded, 64px collapsed
 * - Main content margin-left: 264px expanded (240px + 24px), 88px collapsed (64px + 24px)
 */
export function ProjectLayoutShell(props: ProjectLayoutShellProps) {
  return (
    <SidebarProvider>
      <ProjectLayoutShellInner {...props} />
    </SidebarProvider>
  )
}

