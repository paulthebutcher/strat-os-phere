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
      {/* Sidebar-to-main gutter: 16px for tight, intentional spacing */}
      <main
        className={cn(
          'flex-1 relative z-0 transition-[margin-left] duration-200 ease-out',
          // Expanded: 240px sidebar + 16px gap = 256px
          'md:ml-[256px]',
          // Collapsed: 64px sidebar + 16px gap = 80px
          isCollapsed && 'md:ml-[80px]'
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
 * - Sidebar-to-main gutter: 16px for tight, intentional spacing
 * - Sidebar width: 240px expanded, 64px collapsed
 * - Main content margin-left: 256px expanded (240px + 16px), 80px collapsed (64px + 16px)
 */
export function ProjectLayoutShell(props: ProjectLayoutShellProps) {
  return (
    <SidebarProvider>
      <ProjectLayoutShellInner {...props} />
    </SidebarProvider>
  )
}

