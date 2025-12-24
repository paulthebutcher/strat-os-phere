'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Check if the current route is an in-app route (not marketing)
 * In-app routes: /dashboard, /projects, /new, /samples, /try
 */
function isInAppRoute(pathname: string): boolean {
  const inAppPrefixes = ['/dashboard', '/projects', '/new', '/samples', '/try']
  return inAppPrefixes.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'))
}

/**
 * Client component for primary navigation links
 * Conditionally hides "Projects, Insights, Help" links when in-app
 */
export function NavPrimaryLinks() {
  const pathname = usePathname()
  const isInApp = isInAppRoute(pathname || '')

  // Hide primary links when in-app
  if (isInApp) {
    return null
  }

  return (
    <div className="hidden items-center gap-4 md:flex" data-testid="nav-primary-links">
      <Link
        href="/dashboard"
        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Projects
      </Link>
      <span className="text-xs text-muted-foreground">·</span>
      <Link
        href="/dashboard"
        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Insights
      </Link>
      <span className="text-xs text-muted-foreground">·</span>
      <Link
        href="/help"
        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Help
      </Link>
    </div>
  )
}

