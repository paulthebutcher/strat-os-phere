import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/login/actions'
import { Button } from '@/components/ui/button'

export async function Nav() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Show nav for all authenticated users
  if (!user) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-surface bg-surface backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="text-base font-semibold text-card-foreground hover:text-accent-primary transition-colors"
          >
            Plinth
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-text-secondary hover:text-card-foreground transition-colors"
            >
              Projects
            </Link>
            <span className="text-xs text-text-muted">·</span>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-text-secondary hover:text-card-foreground transition-colors"
            >
              Insights
            </Link>
            <span className="text-xs text-text-muted">·</span>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-text-secondary hover:text-card-foreground transition-colors"
            >
              Help
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user?.email && (
            <span className="hidden text-sm text-text-secondary sm:inline-block">
              {user.email}
            </span>
          )}
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </nav>
  )
}

