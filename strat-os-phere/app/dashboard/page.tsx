import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '../login/actions'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-8 w-full max-w-2xl px-4">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </div>
        <div className="flex flex-col gap-4 w-full">
          <div className="p-4 border rounded-md">
            <p className="text-sm text-gray-600">Signed in as:</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div className="p-4 border rounded-md">
            <p className="text-sm text-gray-600">Welcome to your dashboard!</p>
          </div>
        </div>
      </main>
    </div>
  )
}

