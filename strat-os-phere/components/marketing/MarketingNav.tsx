"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HelpDrawer } from "@/components/guidance/HelpDrawer"
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
    <nav className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/70 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo
          href="/"
          variant="lockup"
          size="md"
          priority
          className="text-lg font-bold text-foreground hover:text-primary transition-colors"
        />

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#outputs"
            className={cn(
              "relative text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
              "after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:rounded-full after:bg-slate-900 after:content-[''] after:opacity-0 after:transition-opacity",
              "hover:after:opacity-100"
            )}
          >
            Outputs
          </Link>
          <Link
            href="#how-it-works"
            className={cn(
              "relative text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
              "after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:rounded-full after:bg-slate-900 after:content-[''] after:opacity-0 after:transition-opacity",
              "hover:after:opacity-100"
            )}
          >
            How it works
          </Link>
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-sm font-medium text-slate-700 hover:text-slate-900",
                isActive("/login") && "text-slate-900"
              )}
              aria-current={isActive("/login") ? "page" : undefined}
            >
              Login
            </Button>
          </Link>
          <HelpDrawer />
          <Link href="/try">
            <Button
              size="sm"
              className="rounded-xl px-5 py-2 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all"
            >
              Try Plinth
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 text-slate-700" />
          ) : (
            <Menu className="h-5 w-5 text-slate-700" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-black/5 bg-white/95 backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            <Link
              href="#outputs"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Outputs
            </Link>
            <Link
              href="#how-it-works"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="/login"
              className={cn(
                "px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive("/login") && "text-slate-900 bg-slate-50"
              )}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive("/login") ? "page" : undefined}
            >
              Login
            </Link>
            <div className="px-3 py-2" onClick={() => setMobileMenuOpen(false)}>
              <HelpDrawer />
            </div>
            <Link href="/try" className="px-3 py-2" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" className="w-full rounded-xl shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all">
                Try Plinth
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

