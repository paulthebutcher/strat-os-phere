import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl lg:text-6xl">
          Find your unfair advantage.
        </h1>
        <p className="mt-6 text-lg text-text-secondary md:text-xl">
          Plinth is a strategy workspace that turns competitive noise into clear, defensible positioning.
          It helps teams see what competitors can't — and act on it.
        </p>
        <p className="mt-4 text-sm text-text-muted">
          Strategy, grounded.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/dashboard">
            <Button size="lg">Try Plinth</Button>
          </Link>
          <Link href="#outputs">
            <Button size="lg" variant="outline">
              See a sample
            </Button>
          </Link>
        </div>
        {/* Optional: Product screenshot placeholder */}
        <div className="mt-16">
          <div className="panel mx-auto max-w-4xl overflow-hidden">
            <div className="aspect-video bg-surface-muted flex items-center justify-center">
              <p className="text-sm text-text-muted">[Product screenshot placeholder]</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

