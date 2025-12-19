import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTABand() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="panel mx-auto max-w-3xl p-12 text-center">
        <h2 className="text-3xl font-semibold text-text-primary md:text-4xl">
          Start from a stronger foundation
        </h2>
        <p className="mt-4 text-base text-text-secondary">
          Stop debating opinions. Start making decisions grounded in structure, evidence, and clarity.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/dashboard">
            <Button size="lg">Try Plinth</Button>
          </Link>
          <Link href="#outputs">
            <Button size="lg" variant="outline">
              Explore a sample analysis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

