import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTABand() {
  return (
    <section className="border-t border-border mx-auto max-w-5xl px-4 py-20 md:py-24">
      <div className="mx-auto max-w-3xl text-center space-y-8">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Stop generating insights. Start making decisions.
        </h2>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/dashboard">
            <Button size="default">
              Generate an analysis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

