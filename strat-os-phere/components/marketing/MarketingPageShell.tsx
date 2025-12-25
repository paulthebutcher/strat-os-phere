/**
 * MarketingPageShell
 * 
 * Reusable layout shell for standalone marketing pages.
 * Provides consistent structure: title, eyebrow, lead, content sections, and CTA.
 */
import { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MarketingShell } from "./MarketingShell"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Footer } from "./Footer"
import { cn } from "@/lib/utils"

interface MarketingPageShellProps {
  title: string
  eyebrow?: string
  lead: string
  children: ReactNode
  className?: string
}

export function MarketingPageShell({
  title,
  eyebrow,
  lead,
  children,
  className,
}: MarketingPageShellProps) {
  return (
    <MarketingShell>
      <main className={cn("min-h-screen", className)}>
        {/* Header */}
        <MarketingSection variant="gradient" className="pb-8 sm:pb-12 md:pb-16">
          <MarketingContainer maxWidth="4xl">
            <div className="text-center space-y-3 sm:space-y-4">
              {eyebrow && (
                <p className={cn("text-sm font-medium", "text-text-secondary uppercase tracking-wide")}>
                  {eyebrow}
                </p>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary">
                {title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-text-secondary max-w-2xl mx-auto px-4 sm:px-0">
                {lead}
              </p>
            </div>
          </MarketingContainer>
        </MarketingSection>

        {/* Content */}
        {children}

        {/* CTA */}
        <MarketingSection variant="muted">
          <MarketingContainer maxWidth="4xl">
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-text-primary">
                  Ready to get started?
                </h2>
                <p className="text-base text-text-secondary max-w-xl mx-auto">
                  Start a new analysis and see what Plinth can do.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row pt-2">
                <Link href="/new" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto min-h-[44px]">
                    Try Plinth
                  </Button>
                </Link>
              </div>
            </div>
          </MarketingContainer>
        </MarketingSection>

        <Footer />
      </main>
    </MarketingShell>
  )
}

