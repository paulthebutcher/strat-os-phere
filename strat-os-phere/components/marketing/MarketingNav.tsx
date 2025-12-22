"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b bg-surface/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-lg font-bold text-foreground hover:text-primary transition-colors"
        >
          Plinth
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#outputs"
            className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            Outputs
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-primary to-[hsl(var(--marketing-gradient-end))] opacity-0 transition-opacity hover:opacity-100" />
          </Link>
          <Link
            href="#how-it-works"
            className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            How it works
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-primary to-[hsl(var(--marketing-gradient-end))] opacity-0 transition-opacity hover:opacity-100" />
          </Link>
          <Link
            href="/login"
            className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            Login
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-primary to-[hsl(var(--marketing-gradient-end))] opacity-0 transition-opacity hover:opacity-100" />
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="shadow-sm hover:shadow-md transition-shadow">
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
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-surface/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            <Link
              href="#outputs"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              Outputs
            </Link>
            <Link
              href="#how-it-works"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link href="/dashboard" className="px-3 py-2" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" className="w-full">
                Try Plinth
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

