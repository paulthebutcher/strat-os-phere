import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-2xl font-semibold">StratOSphere</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          An AI-enabled OS for experience strategy work, designed to stay out of
          your way.
        </p>
        <Link href="/login">
          <Button>Sign in</Button>
        </Link>
      </main>
    </div>
  )
}
