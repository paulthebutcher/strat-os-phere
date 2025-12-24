"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand/Logo"
import { GlassPanel } from "./GlassPanel"

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
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4 sm:px-6 lg:px-8 pointer-events-none">
      <GlassPanel className="pointer-events-auto">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <Logo
          href="/"
          variant="lockup"
          size="md"
          priority
          className="text-lg font-bold text-foreground hover:text-primary transition-colors"
        />

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="#product"
            className={cn(
              "relative text-sm font-medium text-text-secondary transition-all duration-200 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
              "after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:rounded-full after:bg-accent-primary after:content-[''] after:transition-all after:duration-200",
              "hover:after:w-full"
            )}
          >
            Product
          </Link>
          <Link
            href="#how-it-works"
            className={cn(
              "relative text-sm font-medium text-text-secondary transition-all duration-200 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
              "after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:rounded-full after:bg-accent-primary after:content-[''] after:transition-all after:duration-200",
              "hover:after:w-full"
            )}
          >
            How it works
          </Link>
          <Link
            href="#trust"
            className={cn(
              "relative text-sm font-medium text-text-secondary transition-all duration-200 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
              "after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:rounded-full after:bg-accent-primary after:content-[''] after:transition-all after:duration-200",
              "hover:after:w-full"
            )}
          >
            Trust
          </Link>
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-sm font-medium text-text-secondary transition-all duration-200 hover:text-text-primary hover:bg-white/40",
                isActive("/login") && "text-text-primary"
              )}
              aria-current={isActive("/login") ? "page" : undefined}
            >
              Login
            </Button>
          </Link>
          <Link href="/new">
            <Button
              size="sm"
              className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
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
        <div className="mt-2 md:hidden">
          <GlassPanel>
            <div className="flex flex-col gap-1 px-4 py-3">
            <Link
              href="#product"
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/40 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Product
            </Link>
            <Link
              href="#how-it-works"
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/40 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="#trust"
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/40 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trust
            </Link>
            <Link
              href="/login"
              className={cn(
                "px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/40 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive("/login") && "text-text-primary bg-white/40"
              )}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive("/login") ? "page" : undefined}
            >
              Login
            </Link>
            <Link href="/new" className="px-3 py-2" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" className="w-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                Try
              </Button>
            </Link>
          </div>
          </GlassPanel>
        </div>
      )}
      </GlassPanel>
    </nav>
  )
}

