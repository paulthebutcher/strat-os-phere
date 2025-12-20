"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-surface bg-surface backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-base font-semibold text-card-foreground hover:text-accent-primary transition-colors"
        >
          Plinth
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="#product"
            className="text-sm font-medium text-text-secondary hover:text-card-foreground transition-colors"
          >
            Product
          </Link>
          <Link
            href="#outputs"
            className="text-sm font-medium text-text-secondary hover:text-card-foreground transition-colors"
          >
            Outputs
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-text-secondary hover:text-card-foreground transition-colors"
          >
            How it works
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-text-secondary hover:text-card-foreground transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-text-secondary hover:text-card-foreground transition-colors"
          >
            Login
          </Link>
          <Link href="/dashboard">
            <Button size="sm">Try Plinth</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 text-card-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-card-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-surface bg-surface md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            <Link
              href="#product"
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-card-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Product
            </Link>
            <Link
              href="#outputs"
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-card-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Outputs
            </Link>
            <Link
              href="#how-it-works"
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-card-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-card-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-card-foreground transition-colors"
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

