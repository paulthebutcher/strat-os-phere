import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24 md:py-32">
      <div className="text-center space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl leading-tight max-w-4xl mx-auto">
          Make the right strategic bets — with evidence you can defend.
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground md:text-lg max-w-3xl mx-auto">
          Plinth synthesizes live market signals into jobs, scores, and opportunities — so product and UX leaders can decide what to build, what to ignore, and why competitors won't easily follow.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row pt-4">
          <Link href="#outputs">
            <Button variant="outline" size="default">
              View an example analysis
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="default">
              Generate your own analysis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

