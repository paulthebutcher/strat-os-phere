import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/Logo'
import { HelpDrawer } from '@/components/guidance/HelpDrawer'
import { NavRunStatusChip } from '@/components/results/NavRunStatusChip'
import { CommandPaletteProvider } from '@/components/command/CommandPaletteProvider'
import { NavPrimaryLinks } from './NavPrimaryLinks'

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
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-card shadow-sm plinth-elev-2">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-8">
            <Logo
              href="/dashboard"
              variant="lockup"
              size="sm"
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
            />
            <NavPrimaryLinks />
          </div>
          <div className="flex items-center gap-3">
            <NavRunStatusChip />
            {user?.email && (
              <span className="hidden text-xs text-muted-foreground sm:inline-block">
                {user.email}
              </span>
            )}
            <HelpDrawer />
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </nav>
      <CommandPaletteProvider />
    </>
  )
}

