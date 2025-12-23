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
    <nav className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
            href="#product"
            className={cn(
              "relative text-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
              "after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:rounded-full after:bg-accent-primary after:content-[''] after:opacity-0 after:transition-opacity",
              "hover:after:opacity-100"
            )}
          >
            Product
          </Link>
          <Link
            href="#how-it-works"
            className={cn(
              "relative text-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
              "after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:rounded-full after:bg-accent-primary after:content-[''] after:opacity-0 after:transition-opacity",
              "hover:after:opacity-100"
            )}
          >
            How it works
          </Link>
          <Link
            href="#trust"
            className={cn(
              "relative text-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
              "after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:rounded-full after:bg-accent-primary after:content-[''] after:opacity-0 after:transition-opacity",
              "hover:after:opacity-100"
            )}
          >
            Trust
          </Link>
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-sm font-medium text-text-secondary hover:text-text-primary",
                isActive("/login") && "text-text-primary"
              )}
              aria-current={isActive("/login") ? "page" : undefined}
            >
              Login
            </Button>
          </Link>
          <HelpDrawer />
          <Link href="/new">
            <Button
              size="sm"
              className="shadow-sm hover:shadow-md transition-all"
            >
              Try
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
            <X className="h-5 w-5 text-text-primary" />
          ) : (
            <Menu className="h-5 w-5 text-text-primary" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border-subtle bg-background/95 backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6 lg:px-8">
            <Link
              href="#product"
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Product
            </Link>
            <Link
              href="#how-it-works"
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="#trust"
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trust
            </Link>
            <Link
              href="/login"
              className={cn(
                "px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive("/login") && "text-text-primary bg-surface-muted"
              )}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive("/login") ? "page" : undefined}
            >
              Login
            </Link>
            <div className="px-3 py-2" onClick={() => setMobileMenuOpen(false)}>
              <HelpDrawer />
            </div>
            <Link href="/new" className="px-3 py-2" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" className="w-full shadow-sm hover:shadow-md transition-all">
                Try
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

