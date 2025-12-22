'use client'

import { ProjectSidebar } from '@/components/nav/ProjectSidebar'

interface ProjectLayoutShellProps {
  projectId: string
  projectName?: string | null
  subtitle?: string | null
  children: React.ReactNode
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
 */
export function ProjectLayoutShell({
  projectId,
  projectName,
  subtitle,
  children,
}: ProjectLayoutShellProps) {
  return (
    <div className="flex min-h-[calc(100vh-57px)]">
      <ProjectSidebar
        projectId={projectId}
        projectName={projectName}
        subtitle={subtitle}
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-60">
        <div className="pt-0 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}

