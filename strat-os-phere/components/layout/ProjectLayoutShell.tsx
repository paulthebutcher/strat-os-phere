'use client'

import { ProjectSidebar } from '@/components/nav/ProjectSidebar'
import { SidebarProvider, useSidebar } from '@/components/nav/SidebarContext'
import { cn } from '@/lib/utils'
import { appGutter } from '@/lib/ui/tokens'

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
      {/* Sidebar-to-main gutter: 24px for tight spacing (max allowed) */}
      <main
        className={cn(
          'flex-1 relative z-0 transition-[margin-left] duration-200 ease-out',
          // Expanded: 240px sidebar
          'md:ml-[240px]',
          // Collapsed: 64px sidebar
          isCollapsed && 'md:ml-[64px]'
        )}
      >
        <div className={cn("pt-0 md:pt-0", appGutter.combined)}>
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
 * - Sidebar-to-main gutter: 24px for tight spacing (max allowed)
 * - Sidebar width: 240px expanded, 64px collapsed
 * - Main content margin-left: 240px expanded (sidebar width), 64px collapsed (sidebar width)
 * - Main content padding-left: 16px on mobile, 24px on desktop (creates the gutter)
 */
export function ProjectLayoutShell(props: ProjectLayoutShellProps) {
  return (
    <SidebarProvider>
      <ProjectLayoutShellInner {...props} />
    </SidebarProvider>
  )
}

