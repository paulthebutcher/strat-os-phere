'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { generateBreadcrumbs } from '@/lib/nav/breadcrumbs'

interface ProjectBreadcrumbsProps {
  projectId: string
  projectName: string
  opportunityTitle?: string
  evidenceType?: string
}

/**
 * Breadcrumb component for project pages
 * Automatically generates breadcrumbs based on current route
 */
export function ProjectBreadcrumbs({
  projectId,
  projectName,
  opportunityTitle,
  evidenceType,
}: ProjectBreadcrumbsProps) {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname || '', projectId, projectName, {
    opportunityTitle,
    evidenceType,
  })

  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <div key={index} className="flex items-center gap-1.5">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

