"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand/Logo"

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href.startsWith("#")) {
      // For hash links, we can't easily detect active state without scroll position
      // So we'll just use hover states
      return false
    }
    return pathname === href
  }

  return (
    <nav className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-3 sm:px-4 lg:px-8 pointer-events-none">
      <div className="pointer-events-auto bg-white/95 backdrop-blur-sm border border-border-subtle rounded-xl shadow-sm">
        <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo
          href="/"
          variant="lockup"
          size="md"
          priority
          className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
        />

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-text-secondary transition-all duration-200 hover:text-text-primary"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/new">
            <Button
              size="sm"
              variant="brand"
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              Try Plinth
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 text-text-primary" />
          ) : (
            <Menu className="h-5 w-5 text-text-primary" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mt-2 md:hidden bg-white/95 backdrop-blur-sm border border-border-subtle rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-col gap-1 px-3 py-2">
            <Link
              href="/login"
              className="px-3 py-3 min-h-[44px] flex items-center text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-muted transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign in
            </Link>
            <Link href="/new" className="px-3 py-2" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" variant="brand" className="w-full min-h-[44px] shadow-sm hover:shadow-md transition-all">
                Try Plinth
              </Button>
            </Link>
          </div>
        </div>
      )}
      </div>
    </nav>
  )
}

